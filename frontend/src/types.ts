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
