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
  console.log('   🩺 AI CODEBASE DOCTOR - TERMINAL DIAGNOSTICS');
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

  console.log(`Security       ${report.categories.security.rating === 'critical' ? '🔴' : '🟢'} ${report.categories.security.badgeLabel}`);
  console.log(`Performance    ${report.categories.performance.rating === 'critical' ? '🔴' : (report.categories.performance.rating === 'warning' ? '🟠' : '🟢')} ${report.categories.performance.badgeLabel}`);
  console.log(`Dependencies   ${report.categories.dependencies.rating === 'critical' ? '🔴' : (report.categories.dependencies.rating === 'warning' ? '🟠' : '🟢')} ${report.categories.dependencies.badgeLabel}`);
  console.log(`Code Quality   ${report.categories.codeQuality.rating === 'critical' ? '🔴' : (report.categories.codeQuality.rating === 'warning' ? '🟠' : '🟢')} ${report.categories.codeQuality.badgeLabel}`);
  console.log(`Architecture   ${report.categories.architecture.rating === 'critical' ? '🔴' : (report.categories.architecture.rating === 'warning' ? '🟠' : '🟢')} ${report.categories.architecture.badgeLabel}`);
  console.log(`Missing Tests  ${report.categories.missingTests.rating === 'critical' ? '🔴' : (report.categories.missingTests.rating === 'warning' ? '🟠' : '🟢')} ${report.categories.missingTests.badgeLabel}`);

  if (report.criticalVulnerabilityBanner) {
    console.log('\n------------------------------------------------------');
    console.log('⚠️  CRITICAL VULNERABILITY DETECTED:');
    console.log(`   ${report.criticalVulnerabilityBanner}`);
    console.log('------------------------------------------------------');
  }

  console.log(`\nDiagnosed Issues (${report.issues.length}):`);
  for (const issue of report.issues) {
    console.log(`\n • [${issue.id}] [${issue.severity.toUpperCase()}] ${issue.title}`);
    console.log(`   Location: ${issue.file}:${issue.lineStart || '?'}`);
    console.log(`   Remedy:   ${issue.recommendation}`);

    if (issue.patch) {
      const patchFilename = `${issue.id}_fix.patch`;
      fs.writeFileSync(patchFilename, issue.patch.diff);
      console.log(`   ✅ Unified patch generated & saved: ${patchFilename}`);
      console.log(`      To apply: git apply ${patchFilename}`);
    }
  }

  // Save full Markdown report
  const reportFilename = `PROJECT_HEALTH_${scanId}.md`;
  const mdContent = `# PROJECT HEALTH REPORT: ${report.repoName}
Overall Score: ${report.overallScore}/100 (Grade: ${report.grade})
Timestamp: ${report.timestamp}

## Health Pillars
- Security: ${report.categories.security.badgeLabel} (${report.categories.security.rating})
- Performance: ${report.categories.performance.badgeLabel} (${report.categories.performance.rating})
- Dependencies: ${report.categories.dependencies.badgeLabel} (${report.categories.dependencies.rating})
- Code Quality: ${report.categories.codeQuality.badgeLabel} (${report.categories.codeQuality.rating})
- Architecture: ${report.categories.architecture.badgeLabel} (${report.categories.architecture.rating})
- Missing Tests: ${report.categories.missingTests.badgeLabel} (${report.categories.missingTests.rating})

## Executive Summary
${report.summary}

## Diagnosed Issues
${report.issues.map(i => `### [${i.severity.toUpperCase()}] ${i.title}\n- **File**: \`${i.file}\`\n- **Impact**: ${i.impact}\n- **Recommendation**: ${i.recommendation}\n`).join('\n')}
`;
  fs.writeFileSync(reportFilename, mdContent);
  console.log(`\n[Doctor] Full audit report saved to: ${reportFilename}\n`);
}

main().catch(err => {
  console.error('[CLI Error]', err);
  process.exit(1);
});
