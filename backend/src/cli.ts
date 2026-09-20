import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { RepoPacker } from './services/repoPacker.js';
import { GeminiDoctorService } from './services/gemini.js';
import { v4 as uuidv4 } from 'uuid';

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

  const doctor = new GeminiDoctorService();
  const scanId = uuidv4().slice(0, 8);
  const report = await doctor.analyzeCodebase(packed, scanId, target, target.startsWith('http') ? 'github' : 'demo');

  console.log('\n======================================================');
  console.log('                   PROJECT HEALTH');
  console.log('======================================================');
  console.log(`\nOverall Health Score: ${report.overallScore}/100 [Grade: ${report.grade}]\n`);

  console.log(`Security       ${report.categories.security.rating === 'critical' ? '??' : '??'} ${report.categories.security.badgeLabel}`);
  console.log(`Performance    ${report.categories.performance.rating === 'critical' ? '??' : (report.categories.performance.rating === 'warning' ? '??' : '??')} ${report.categories.performance.badgeLabel}`);
  console.log(`Dependencies   ${report.categories.dependencies.rating === 'critical' ? '??' : (report.categories.dependencies.rating === 'warning' ? '??' : '??')} ${report.categories.dependencies.badgeLabel}`);
  console.log(`Code Quality   ${report.categories.codeQuality.rating === 'critical' ? '??' : (report.categories.codeQuality.rating === 'warning' ? '??' : '??')} ${report.categories.codeQuality.badgeLabel}`);
  console.log(`Architecture   ${report.categories.architecture.rating === 'critical' ? '??' : (report.categories.architecture.rating === 'warning' ? '??' : '??')} ${report.categories.architecture.badgeLabel}`);
  console.log(`Missing Tests  ${report.categories.missingTests.rating === 'critical' ? '??' : (report.categories.missingTests.rating === 'warning' ? '??' : '??')} ${report.categories.missingTests.badgeLabel}`);

  if (report.criticalVulnerabilityBanner) {
    console.log('\n------------------------------------------------------');
    console.log('??  CRITICAL VULNERABILITY DETECTED:');
    console.log(`   ${report.criticalVulnerabilityBanner}`);
    console.log('------------------------------------------------------');
  }
}

main().catch(err => {
  console.error('[CLI Error]', err);
  process.exit(1);
});
