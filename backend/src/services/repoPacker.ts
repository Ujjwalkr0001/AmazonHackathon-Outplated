import AdmZip from 'adm-zip';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export interface PackedFile {
  relativePath: string;
  content: string;
  lineCount: number;
  sizeBytes: number;
}

export interface PackedRepository {
  repoName: string;
  files: PackedFile[];
  fileTree: string[];
  totalFiles: number;
  totalLines: number;
  totalBytes: number;
}

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  'vendor',
  '.git',
  '.github',
  '.vscode',
  '.idea',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  'target',
  'bin',
  'obj',
  'venv',
  '.venv',
  'env',
  '__pycache__',
  'coverage',
  '.nyc_output',
  'tmp',
  'temp',
  'logs',
]);

const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.bmp',
  '.mp4', '.mp3', '.wav', '.mov', '.avi',
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
  '.exe', '.dll', '.so', '.dylib', '.class', '.pyc', '.o',
  '.woff', '.woff2', '.ttf', '.eot',
  '.map', '.min.js', '.min.css',
  '.lock',
]);

const IGNORED_FILENAMES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'composer.lock',
  'gemfile.lock',
  'cargo.lock',
  'poetry.lock',
]);

const MAX_FILE_SIZE_BYTES = 120 * 1024; // 120 KB per file limit
const MAX_TOTAL_FILES = 200;            // Keep repo scan prompt fast and focused

export class RepoPacker {
  /**
   * Check if a file path should be ignored
   */
  static shouldIgnore(filePath: string): boolean {
    const normalized = filePath.replace(/\\/g, '/');
    const parts = normalized.split('/');
    
    // Check ignored directories
    for (const part of parts) {
      if (IGNORED_DIRECTORIES.has(part.toLowerCase())) {
        return true;
      }
    }

    const filename = parts[parts.length - 1].toLowerCase();
    if (IGNORED_FILENAMES.has(filename)) {
      return true;
    }

    // Check extensions
    const ext = path.extname(filename).toLowerCase();
    if (IGNORED_EXTENSIONS.has(ext)) {
      return true;
    }

    // Ignore dotfiles except important configs (.env.example, .dockerignore, etc.)
    if (filename.startsWith('.') && !filename.includes('docker') && !filename.includes('env.example')) {
      return true;
    }

    return false;
  }

  /**
   * Unpack and process a ZIP buffer (e.g. from Multer upload or GitHub zipball)
   */
  static packZipBuffer(buffer: Buffer, repoName: string): PackedRepository {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    
    const packedFiles: PackedFile[] = [];
    const fileTree: string[] = [];
    let totalLines = 0;
    let totalBytes = 0;

    // GitHub zipballs usually have a top-level root directory like `owner-repo-commit/`
    let rootPrefix = '';
    const firstEntry = zipEntries.find(e => e.isDirectory);
    if (firstEntry && firstEntry.entryName.split('/').length <= 2) {
      rootPrefix = firstEntry.entryName;
    }

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;

      let relativePath = entry.entryName.replace(/\\/g, '/');
      if (rootPrefix && relativePath.startsWith(rootPrefix)) {
        relativePath = relativePath.slice(rootPrefix.length);
      }

      if (this.shouldIgnore(relativePath)) continue;

      // Skip files that exceed individual file threshold
      if (entry.header.size > MAX_FILE_SIZE_BYTES) continue;

      fileTree.push(relativePath);

      if (packedFiles.length >= MAX_TOTAL_FILES) continue;

      try {
        const textContent = entry.getData().toString('utf8');
        // Quick binary detection: check for null bytes
        if (textContent.includes('\0')) continue;

        const lines = textContent.split('\n').length;
        packedFiles.push({
          relativePath,
          content: textContent,
          lineCount: lines,
          sizeBytes: entry.header.size,
        });

        totalLines += lines;
        totalBytes += entry.header.size;
      } catch (err) {
        // Skip unreadable files
      }
    }

    return {
      repoName,
      files: packedFiles,
      fileTree: fileTree.sort(),
      totalFiles: packedFiles.length,
      totalLines,
      totalBytes,
    };
  }

  /**
   * Fetch and unpack a public GitHub repository by URL
   */
  static async packGitHubRepo(githubUrl: string): Promise<PackedRepository> {
    // Parse GitHub owner/repo
    const regex = /github\.com\/([^/]+)\/([^/]+?)(\.git|\/.*)?$/i;
    const match = githubUrl.trim().match(regex);
    if (!match) {
      throw new Error(`Invalid GitHub repository URL: "${githubUrl}". Expected format: https://github.com/owner/repo`);
    }

    const owner = match[1];
    let repo = match[2];
    if (repo.endsWith('.git')) repo = repo.slice(0, -4);

    const zipballUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;
    
    const response = await axios.get(zipballUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'AICodebaseDoctor/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
      timeout: 30000,
    });

    return this.packZipBuffer(Buffer.from(response.data), `${owner}/${repo}`);
  }

  /**
   * Pack a local directory (for preloaded demo repositories)
   */
  static packLocalDirectory(dirPath: string, repoName: string): PackedRepository {
    const packedFiles: PackedFile[] = [];
    const fileTree: string[] = [];
    let totalLines = 0;
    let totalBytes = 0;

    function walk(currentDir: string, relativeBase: string = '') {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const item of items) {
        const itemRelative = relativeBase ? `${relativeBase}/${item.name}` : item.name;

        if (RepoPacker.shouldIgnore(itemRelative)) continue;

        const fullPath = path.join(currentDir, item.name);
        if (item.isDirectory()) {
          walk(fullPath, itemRelative);
        } else if (item.isFile()) {
          const stats = fs.statSync(fullPath);
          if (stats.size > MAX_FILE_SIZE_BYTES) continue;

          fileTree.push(itemRelative);
          if (packedFiles.length >= MAX_TOTAL_FILES) continue;

          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('\0')) continue;

            const lines = content.split('\n').length;
            packedFiles.push({
              relativePath: itemRelative,
              content,
              lineCount: lines,
              sizeBytes: stats.size,
            });

            totalLines += lines;
            totalBytes += stats.size;
          } catch {
            // Ignore unreadable
          }
        }
      }
    }

    walk(dirPath);

    return {
      repoName,
      files: packedFiles,
      fileTree: fileTree.sort(),
      totalFiles: packedFiles.length,
      totalLines,
      totalBytes,
    };
  }
}
