import 'dotenv/config';
import path from 'path';
import { RepoPacker } from './src/services/repoPacker.js';
import { GeminiDoctorService } from './src/services/gemini.js';

async function testScan() {
  console.log('--- Testing AI Codebase Doctor Ingestion & Diagnosis ---');
  const demoPath = path.resolve('demo-repos/vulnerable-node-api');
  console.log('Packing demo repo:', demoPath);

  const packed = RepoPacker.packLocalDirectory(demoPath, 'vulnerable-node-api');
  console.log(`Packed ${packed.totalFiles} files, ${packed.totalLines} lines.`);
  console.log('File tree:', packed.fileTree);

  console.log('Sending to GeminiDoctorService for analysis...');
  const doctor = new GeminiDoctorService();
  const report = await doctor.analyzeCodebase(packed, 'demo-scan-001', undefined, 'demo');

  console.log('\n==============================');
  console.log('      PROJECT HEALTH');
  console.log('==============================');
  console.log(`Overall Score: ${report.overallScore}/100 (Grade: ${report.grade})`);
  console.log(`Security:     ${report.categories.security.rating === 'critical' ? '🔴' : '🟢'} ${report.categories.security.badgeLabel}`);
  console.log(`Performance:  ${report.categories.performance.rating === 'critical' ? '🔴' : (report.categories.performance.rating === 'warning' ? '🟠' : '🟢')} ${report.categories.performance.badgeLabel}`);
  console.log(`Dependencies: ${report.categories.dependencies.rating === 'critical' ? '🔴' : (report.categories.dependencies.rating === 'warning' ? '🟠' : '🟢')} ${report.categories.dependencies.badgeLabel}`);
  console.log(`Code Quality: ${report.categories.codeQuality.rating === 'critical' ? '🔴' : (report.categories.codeQuality.rating === 'warning' ? '🟠' : '🟢')} ${report.categories.codeQuality.badgeLabel}`);
  console.log(`Architecture: ${report.categories.architecture.rating === 'critical' ? '🔴' : (report.categories.architecture.rating === 'warning' ? '🟠' : '🟢')} ${report.categories.architecture.badgeLabel}`);
  console.log(`Missing Tests:${report.categories.missingTests.rating === 'critical' ? '🔴' : (report.categories.missingTests.rating === 'warning' ? '🟠' : '🟢')} ${report.categories.missingTests.badgeLabel}`);

  if (report.criticalVulnerabilityBanner) {
    console.log(`\nCritical Issue:\n${report.criticalVulnerabilityBanner}`);
  }

  console.log(`\nTotal Issues Found: ${report.issues.length}`);
  for (const issue of report.issues) {
    console.log(`\n[${issue.id}] [${issue.severity.toUpperCase()}] ${issue.title} (${issue.file}:${issue.lineStart || '?'})`);
    if (issue.patch) {
      console.log(' -> Proposed Patch Available:\n' + issue.patch.diff.slice(0, 150) + '...\n');
    }
  }
}

testScan().catch(err => {
  console.error('Scan test failed:', err);
  process.exit(1);
});
