import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { RepoPacker } from './services/repoPacker.js';

async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'demo-repos/vulnerable-node-api';

  console.log('\n======================================================');
  console.log('   ?? AI CODEBASE DOCTOR - TERMINAL DIAGNOSTICS');
  console.log('   Powered by Google Gemini 3.7 & AWS Cloud Architecture');
  console.log('======================================================\n');

  console.log(`[Doctor] Target: ${target}`);
  let packed;

  if (target.startsWith('http://') || target.startsWith('https://')) {
    console.log('[Doctor] Downloading GitHub repository archive...');
    packed = await RepoPacker.packGitHubRepo(target);
  } else {
    const fullPath = path.resolve(target);
    if (!fs.existsSync(fullPath)) {
      console.error(`[Error] Target path not found: ${fullPath}`);
      process.exit(1);
    }
    console.log(`[Doctor] Packing local directory: ${fullPath}`);
    packed = RepoPacker.packLocalDirectory(fullPath, path.basename(fullPath));
  }

  console.log(`[Doctor] Ingested ${packed.totalFiles} files (${packed.totalLines} lines of code).`);
  console.log('[Doctor] Ingesting whole repository into Gemini 1M context engine...');
}

main().catch(err => {
  console.error('[CLI Error]', err);
  process.exit(1);
});
