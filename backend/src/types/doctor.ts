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
  rating: HealthRating; // 'good' = ??, 'warning' = ??, 'critical' = ??
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
