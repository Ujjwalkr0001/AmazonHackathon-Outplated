/**
 * RepoPacker Service
 * Handles repository file extraction and packing for AI analysis
 */

import AdmZip from 'adm-zip';

export interface PackedFile {
  path: string;
  content: string;
  size: number;
  extension: string;
}

export interface PackedRepository {
  name: string;
  files: PackedFile[];
  totalFiles: number;
  totalSize: number;
  timestamp: string;
}

// Directories to ignore during repository packing
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

// File extensions to ignore
const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.bmp',
  '.mp4', '.mp3', '.wav', '.mov', '.avi',
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
  '.exe', '.dll', '.so', '.dylib', '.class', '.pyc', '.o',
  '.woff', '.woff2', '.ttf', '.eot',
  '.map', '.min.js', '.min.css',
  '.lock',
]);

// Specific filenames to ignore
const IGNORED_FILENAMES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'composer.lock',
  'gemfile.lock',
  'cargo.lock',
  'poetry.lock',
]);

/**
 * RepoPacker - Intelligent repository file packer
 * Extracts and filters files from ZIP archives for AI analysis
 */
export class RepoPacker {
  
  /**
   * Check if a file path should be ignored based on patterns
   * @param filePath - File path to check
   * @returns true if file should be ignored
   */
  static shouldIgnore(filePath: string): boolean {
    const normalized = filePath.replace(/\\/g, '/');
    const parts = normalized.split('/');
    
    // Check if any directory in path is ignored
    for (const part of parts) {
      if (IGNORED_DIRECTORIES.has(part.toLowerCase())) {
        return true;
      }
    }

    // Get filename and check against ignored list
    const filename = parts[parts.length - 1].toLowerCase();
    if (IGNORED_FILENAMES.has(filename)) {
      return true;
    }

    // Check file extension
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    if (IGNORED_EXTENSIONS.has(ext)) {
      return true;
    }

    // Ignore dotfiles except important configs
    if (filename.startsWith('.') && 
        !filename.includes('docker') && 
        !filename.includes('env.example') &&
        !filename.includes('gitignore')) {
      return true;
    }

    return false;
  }
  
  /**
   * Pack a ZIP buffer into structured repository format
   * @param buffer - ZIP file buffer
   * @param repoName - Repository name
   * @returns Packed repository with filtered files
   */
  static packZipBuffer(buffer: Buffer, repoName: string): PackedRepository {
    console.log(`📦 Unpacking ZIP buffer for: ${repoName}`);
    
    // Initialize AdmZip with buffer
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    
    console.log(`📂 Found ${zipEntries.length} entries in ZIP`);
    
    const packedFiles: PackedFile[] = [];
    const fileTree: string[] = [];
    let totalBytes = 0;

    // Detect and remove root prefix (GitHub adds owner-repo-commit/)
    let rootPrefix = '';
    const firstEntry = zipEntries.find(e => e.isDirectory);
    if (firstEntry && firstEntry.entryName.split('/').length <= 2) {
      rootPrefix = firstEntry.entryName;
      console.log(`🔍 Detected root prefix: ${rootPrefix}`);
    }

    return {
      name: repoName,
      files: packedFiles,
      totalFiles: fileTree.length,
      totalSize: totalBytes,
      timestamp: new Date().toISOString()
    };
  }
}
