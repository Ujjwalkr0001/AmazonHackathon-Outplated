/**
 * PatcherService
 * Handles unified diff patch generation and formatting
 */

import { CodePatch } from '../types/doctor';

/**
 * PatcherService - Generate and format unified diff patches
 * Converts AI-generated diffs into standard git-apply format
 */
export class PatcherService {
  
  /**
   * Clean and standardize a unified diff string
   * @param diff - Raw diff string from AI
   * @param filePath - File path being patched
   * @returns Cleaned unified diff format
   */
  static cleanDiff(diff: string, filePath: string): string {
    // Implementation will be added in next commits
    return diff.trim();
  }

  /**
   * Extract before/after code snippets from unified diff
   * @param diff - Unified diff string
   * @returns Object with beforeSnippet and afterSnippet
   */
  static extractSnippets(diff: string): { beforeSnippet: string; afterSnippet: string } {
    // Implementation will be added in next commits
    return {
      beforeSnippet: '',
      afterSnippet: ''
    };
  }

  /**
   * Build complete CodePatch object with metadata
   * @param rawDiff - Raw diff from AI
   * @param explanation - Human-readable explanation
   * @param filePath - Target file path
   * @returns Complete CodePatch object
   */
  static buildPatch(rawDiff: string, explanation: string, filePath: string): CodePatch {
    const cleanedDiff = this.cleanDiff(rawDiff, filePath);
    const snippets = this.extractSnippets(cleanedDiff);

    return {
      diff: cleanedDiff,
      explanation: explanation.trim(),
      affectedFile: filePath,
      beforeSnippet: snippets.beforeSnippet,
      afterSnippet: snippets.afterSnippet,
    };
  }
}
