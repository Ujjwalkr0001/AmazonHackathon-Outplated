export type PillarCategory = 
  | 'security'
  | 'performance'
  | 'dependencies'
  | 'codeQuality'
  | 'architecture'
  | 'missingTests';

export type HealthRating = 'good' | 'warning' | 'critical';
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface CategoryHealth {
  rating: HealthRating; // 'good' = 🟢, 'warning' = 🟠, 'critical' = 🔴
  issuesCount: number;
  badgeLabel: string;   // e.g. "3 issues", "Good", "5 issues"
  summary: string;
}

export interface CodePatch {
  diff: string;         // Standard unified diff format
  explanation: string;  // Detailed explanation of the fix
  affectedFile: string;
  beforeSnippet?: string;
  afterSnippet?: string;
}

export interface IssueItem {
  id: string;
  title: string;
  category: PillarCategory;
  severity: IssueSeverity;
  file: string;
  lineStart?: number;
  lineEnd?: number;
  codeSnippet?: string;
  description: string;
  impact: string;
  recommendation: string;
  patch?: CodePatch;
}

export interface ProjectHealthReport {
  scanId: string;
  repoName: string;
  repoType: 'github' | 'upload' | 'demo';
  sourceUrl?: string;
  timestamp: string;
  overallScore: number;  // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  criticalVulnerabilityBanner?: string;
  summary: string;
  categories: {
    security: CategoryHealth;
    performance: CategoryHealth;
    dependencies: CategoryHealth;
    codeQuality: CategoryHealth;
    architecture: CategoryHealth;
    missingTests: CategoryHealth;
  };
  metrics: {
    totalFilesScanned: number;
    linesOfCode: number;
    totalIssues: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  issues: IssueItem[];
  fileTree: string[];
}

export interface ScanStatus {
  scanId: string;
  status: 'queued' | 'unpacking' | 'analyzing' | 'synthesizing_patches' | 'completed' | 'failed';
  progress: number; // 0 - 100
  currentStep: string;
  repoName: string;
  report?: ProjectHealthReport;
  error?: string;
}
