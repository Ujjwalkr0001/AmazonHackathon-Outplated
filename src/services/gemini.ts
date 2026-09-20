/**
 * GeminiDoctorService
 * AI-powered code analysis using Google Gemini API
 */

import { GoogleGenerativeAI } from '@google/genai';
import { ProjectHealthReport, IssueItem, CategoryHealth } from '../types/doctor';
import { PackedRepository } from './repoPacker';
import { config } from '../config/environment';
import { v4 as uuidv4 } from 'uuid';

/**
 * GeminiDoctorService - AI Code Analysis Engine
 * Leverages Google Gemini's 1M+ token context window for whole-repo analysis
 */
export class GeminiDoctorService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    console.log('🚀 Initializing Gemini AI client...');
    
    // Initialize Google Generative AI client
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    
    // Use Gemini 1.5 Flash model with 1M+ token context
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
    });

    console.log('✅ Gemini AI client initialized');
  }
  
  /**
   * Analyze a packed repository and generate health report
   * @param packed - Packed repository with all files
   * @param scanId - Unique scan identifier
   * @param sourceUrl - Optional source URL (GitHub, etc.)
   * @param repoType - Type of repository source
   * @returns Complete project health report
   */
  async analyzeCodebase(
    packed: PackedRepository,
    scanId: string = uuidv4(),
    sourceUrl?: string,
    repoType: 'github' | 'upload' | 'demo' = 'upload'
  ): Promise<ProjectHealthReport> {
    console.log(`🤖 Starting Gemini analysis for: ${packed.name}`);
    console.log(`📊 Scan ID: ${scanId}`);
    console.log(`📁 Files to analyze: ${packed.files.length}`);
    
    // Build file manifest for Gemini
    const fileManifest = packed.files.map(f => {
      return `### FILE: ${f.path} (${f.size} bytes)\n\`\`\`${f.extension}\n${f.content}\n\`\`\``;
    }).join('\n\n');

    console.log(`📝 Built file manifest (${fileManifest.length} chars)`);

    // Construct comprehensive analysis prompt
    const prompt = this.buildAnalysisPrompt(packed, fileManifest);
    
    console.log(`🎯 Prompt ready (${prompt.length} chars)`);
    
    // Call Gemini API with 1M+ context window
    try {
      console.log(`🚀 Calling Gemini API...`);
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Deterministic analysis
        },
      });

      const response = await result.response;
      const rawText = response.text();
      
      console.log(`✅ Received response (${rawText.length} chars)`);
      
      // Parse JSON response
      const parsed = this.parseGeminiOutput(rawText);
      
      console.log(`📊 Parsed ${parsed.issues?.length || 0} issues`);
      
      // Build complete report (will be implemented in next commit)
      
    } catch (error) {
      console.error(`❌ Gemini API error:`, error);
      throw error;
    }
    
    // Return placeholder report
    return {
      scanId,
      repoName: packed.name,
      repoType,
      sourceUrl,
      timestamp: new Date().toISOString(),
      overallScore: 0,
      grade: 'F',
      summary: 'Analysis in progress...',
      categories: this.getEmptyCategories(),
      metrics: {
        totalFilesScanned: packed.files.length,
        linesOfCode: packed.metadata.totalLines,
        totalIssues: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0
      },
      issues: [],
      fileTree: packed.fileTree
    };
  }

  /**
   * Build comprehensive analysis prompt for Gemini
   */
  private buildAnalysisPrompt(packed: PackedRepository, fileManifest: string): string {
    return `You are the world's top Principal Software Architect and Chief Cyber Security Officer acting as the "AI Codebase Doctor".
Your job is to perform an exhaustive, rigorous health diagnosis on the provided repository and produce a structured, high-value PROJECT HEALTH report.

Analyze the codebase across these SIX specific pillars:
1. "security": Vulnerabilities like SQL injection, command execution, XSS, hardcoded API keys/passwords/JWT secrets, missing auth checks, insecure deserialization, prototype pollution, path traversal.
2. "performance": N+1 query loops, blocking synchronous I/O in async runtimes, memory leaks, unindexed database queries, redundant computations, lack of caching or pagination.
3. "dependencies": Outdated or unpinned dependencies (e.g. "*", "^" on volatile packages), deprecated libraries, known CVEs, lack of lockfile or missing critical security tools.
4. "codeQuality": Silent error swallowing (empty catch blocks), spaghetti code, deep nesting, lack of type safety, global state pollution, improper error handling.
5. "architecture": Tight coupling, God classes/files, mixing business logic with HTTP route handlers, circular dependencies, lack of separation of concerns.
6. "missingTests": Missing test suites, untested critical business paths (payments, auth, data mutation), absent mock strategies.

CRITICAL REQUIREMENT: For each critical or high issue detected (especially security & performance bugs), provide a precise, syntactically valid UNIFIED GIT DIFF patch that fixes the issue!

Repository Name: ${packed.name}
File Tree:
${packed.fileTree.map(p => ' - ' + p).join('\n')}

SOURCE CODE:
${fileManifest}

Respond strictly with valid JSON conforming to this structure:
{
  "overallScore": number, // 0 to 100
  "grade": "A+" | "A" | "B" | "C" | "D" | "F",
  "criticalVulnerabilityBanner": string | null,
  "summary": string,
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
      "id": string,
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
        "diff": string,
        "explanation": string,
        "affectedFile": string
      }
    }
  ]
}`;
  }

  /**
   * Get empty category health structure
   */
  private getEmptyCategories() {
    const emptyCategory: CategoryHealth = {
      rating: 'good',
      issuesCount: 0,
      badgeLabel: 'Good',
      summary: 'No issues detected'
    };

    return {
      security: { ...emptyCategory },
      performance: { ...emptyCategory },
      dependencies: { ...emptyCategory },
      codeQuality: { ...emptyCategory },
      architecture: { ...emptyCategory },
      missingTests: { ...emptyCategory }
    };
  }
}
