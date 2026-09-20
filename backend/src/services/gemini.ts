import { GoogleGenAI } from '@google/genai';
import { PackedRepository } from './repoPacker.js';
import { ProjectHealthReport, PillarCategory, IssueItem } from '../types/doctor.js';
import { PatcherService } from './patcher.js';
import { v4 as uuidv4 } from 'uuid';

const CANDIDATE_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.5-pro',
];

export class GeminiDoctorService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Run multi-pillar codebase diagnosis on packed repo
   */
  async analyzeCodebase(packed: PackedRepository, scanId: string = uuidv4(), sourceUrl?: string, repoType: 'github' | 'upload' | 'demo' = 'upload'): Promise<ProjectHealthReport> {
    const fileManifest = packed.files.map(f => {
      return `### FILE: ${f.relativePath} (${f.lineCount} lines)\n\`\`\`\n${f.content}\n\`\`\``;
    }).join('\n\n');

    const prompt = `You are the world's top Principal Software Architect and Chief Cyber Security Officer acting as the "AI Codebase Doctor".
Your job is to perform an exhaustive, rigorous health diagnosis on the provided repository and produce a structured, high-value PROJECT HEALTH report.

Analyze the codebase across these SIX specific pillars:
1. "security": Vulnerabilities like SQL injection, command execution, XSS, hardcoded API keys/passwords/JWT secrets, missing auth checks, insecure deserialization, prototype pollution, path traversal.
2. "performance": N+1 query loops, blocking synchronous I/O in async runtimes, memory leaks, unindexed database queries, redundant computations, lack of caching or pagination.
3. "dependencies": Outdated or unpinned dependencies (e.g. "*", "^" on volatile packages), deprecated libraries, known CVEs (e.g., vulnerable lodash, jsonwebtoken, etc.), lack of lockfile or missing critical security tools.
4. "codeQuality": Silent error swallowing (empty catch blocks), spaghetti code, deep nesting, lack of type safety, global state pollution, improper error handling.
5. "architecture": Tight coupling, God classes/files, mixing business logic with HTTP route handlers, circular dependencies, lack of separation of concerns.
6. "missingTests": Missing test suites, untested critical business paths (payments, auth, data mutation), absent mock strategies.

CRITICAL REQUIREMENT: For each critical or high issue detected (especially security & performance bugs), provide a precise, syntactically valid UNIFIED GIT DIFF patch that fixes the issue! The diff must follow standard unified diff format:
--- a/filepath
+++ b/filepath
@@ -line,count +line,count @@
-old line
+new line

Here is the repository information:
Repository Name: ${packed.repoName}
File Tree:
${packed.fileTree.map(p => ' - ' + p).join('\n')}

SOURCE CODE:
${fileManifest}

Respond strictly with valid JSON conforming to this TypeScript interface:
{
  "overallScore": number, // 0 to 100 (e.g. 64)
  "grade": "A+" | "A" | "B" | "C" | "D" | "F",
  "criticalVulnerabilityBanner": string, // One-sentence summary of the single most dangerous flaw (e.g. "SQL injection vulnerability allows unauthenticated database dump") or null if none
  "summary": string, // 2-3 paragraph executive summary of the repository's health
  "categories": {
    "security": { "rating": "critical" | "warning" | "good", "issuesCount": number, "badgeLabel": string, "summary": string },
    "performance": { "rating": "critical" | "warning" | "good", "issuesCount": number, "badgeLabel": string, "summary": string },
    "dependencies": { "rating": "critical" | "warning" | "good", "issuesCount": number, "badgeLabel": string, "summary": string },
    "codeQuality": { "rating": "critical" | "warning" | "good", "issuesCount": number, "badgeLabel": string, "summary": string },
    "architecture": { "rating": "critical" | "warning" | "good", "issuesCount": number, "badgeLabel": string, "summary": string },
    "missingTests": { "rating": "critical" | "warning" | "good", "issuesCount": number, "badgeLabel": string, "summary": string }
  },
  "issues": [
    {
      "id": string, // e.g. "SEC-001", "PERF-001"
      "title": string,
      "category": "security" | "performance" | "dependencies" | "codeQuality" | "architecture" | "missingTests",
      "severity": "critical" | "high" | "medium" | "low",
      "file": string,
      "lineStart": number,
      "lineEnd": number,
      "codeSnippet": string,
      "description": string,
      "impact": string,
      "recommendation": string,
      "patch": {
        "diff": string, // Unified diff text
        "explanation": string,
        "affectedFile": string
      }
    }
  ]
}`;

    let lastError: any = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`[Doctor] Invoking Gemini model: ${modelName}...`);
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1, // Deterministic, rigorous analysis
          },
        });

        const rawText = response.text || '';
        const parsed = this.parseGeminiOutput(rawText);

        // Sanitize and enhance issues & patches
        const sanitizedIssues: IssueItem[] = (parsed.issues || []).map((issue: any, index: number) => {
          const id = issue.id || `${(issue.category || 'GEN').substring(0, 3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`;
          let patch = undefined;
          if (issue.patch && issue.patch.diff) {
            patch = PatcherService.buildPatch(
              issue.patch.diff,
              issue.patch.explanation || issue.recommendation || 'Automated fix proposed by AI Codebase Doctor',
              issue.file || issue.patch.affectedFile || 'file'
            );
          }
          return {
            id,
            title: issue.title || 'Identified Issue',
            category: (issue.category || 'codeQuality') as PillarCategory,
            severity: issue.severity || 'medium',
            file: issue.file || '',
            lineStart: issue.lineStart,
            lineEnd: issue.lineEnd,
            codeSnippet: issue.codeSnippet,
            description: issue.description || '',
            impact: issue.impact || '',
            recommendation: issue.recommendation || '',
            patch,
          };
        });

        // Compute metrics
        const criticalCount = sanitizedIssues.filter(i => i.severity === 'critical').length;
        const highCount = sanitizedIssues.filter(i => i.severity === 'high').length;
        const mediumCount = sanitizedIssues.filter(i => i.severity === 'medium').length;
        const lowCount = sanitizedIssues.filter(i => i.severity === 'low').length;

        const report: ProjectHealthReport = {
          scanId,
          repoName: packed.repoName,
          repoType,
          sourceUrl,
          timestamp: new Date().toISOString(),
          overallScore: typeof parsed.overallScore === 'number' ? parsed.overallScore : 70,
          grade: parsed.grade || this.calculateGrade(parsed.overallScore || 70),
          criticalVulnerabilityBanner: parsed.criticalVulnerabilityBanner || (criticalCount > 0 ? `${sanitizedIssues.find(i => i.severity === 'critical')?.title}` : undefined),
          summary: parsed.summary || 'Codebase analysis completed.',
          categories: parsed.categories || {
            security: { rating: criticalCount > 0 ? 'critical' : 'good', issuesCount: sanitizedIssues.filter(i => i.category === 'security').length, badgeLabel: `${sanitizedIssues.filter(i => i.category === 'security').length} issues`, summary: 'Security check' },
            performance: { rating: 'good', issuesCount: sanitizedIssues.filter(i => i.category === 'performance').length, badgeLabel: 'Good', summary: 'Performance check' },
            dependencies: { rating: 'good', issuesCount: sanitizedIssues.filter(i => i.category === 'dependencies').length, badgeLabel: 'Good', summary: 'Dependency check' },
            codeQuality: { rating: 'good', issuesCount: sanitizedIssues.filter(i => i.category === 'codeQuality').length, badgeLabel: 'Good', summary: 'Quality check' },
            architecture: { rating: 'good', issuesCount: sanitizedIssues.filter(i => i.category === 'architecture').length, badgeLabel: 'Good', summary: 'Architecture check' },
            missingTests: { rating: 'warning', issuesCount: sanitizedIssues.filter(i => i.category === 'missingTests').length, badgeLabel: 'Needs Tests', summary: 'Test check' },
          },
          metrics: {
            totalFilesScanned: packed.totalFiles,
            linesOfCode: packed.totalLines,
            totalIssues: sanitizedIssues.length,
            criticalCount,
            highCount,
            mediumCount,
            lowCount,
          },
          issues: sanitizedIssues,
          fileTree: packed.fileTree,
        };

        return report;
      } catch (err: any) {
        console.warn(`[Doctor] Model ${modelName} failed: ${err.message || err}. Checking next candidate...`);
        lastError = err;
      }
    }

    throw new Error(`All Gemini models failed to analyze codebase. Last error: ${lastError?.message || lastError}`);
  }

  private parseGeminiOutput(raw: string): any {
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback: extract JSON from markdown fences
      const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('Failed to parse Gemini output as JSON: ' + raw.slice(0, 300));
    }
  }

  private calculateGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }
}
