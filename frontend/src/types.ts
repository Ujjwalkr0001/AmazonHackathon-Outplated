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
  rating: HealthRating;
  issuesCount: number;
  badgeLabel: string;
  summary: string;
}

export interface CodePatch {
  diff: string;
  explanation: string;
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
  overallScore: number;
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
  progress: number;
  currentStep: string;
  repoName: string;
  report?: ProjectHealthReport;
  error?: string;
}

export interface DemoRepo {
  id: string;
  name: string;
  description: string;
  language: string;
  expectedScore: string;
}

