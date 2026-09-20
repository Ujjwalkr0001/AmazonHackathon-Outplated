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
    let cleaned = diff.trim();

    // Strip markdown code fences if present
    if (cleaned.startsWith('```diff')) {
      cleaned = cleaned.replace(/^```diff\s*/i, '').replace(/```$/i, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\w*\s*/i, '').replace(/```$/i, '').trim();
    }

    // Normalize file path (convert backslashes to forward slashes)
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Ensure unified diff header exists (--- and +++)
    if (!cleaned.includes('--- a/') && !cleaned.includes('--- ')) {
      cleaned = `--- a/${normalizedPath}\n+++ b/${normalizedPath}\n` + cleaned;
    }

    // Ensure git diff header exists
    if (!cleaned.startsWith('diff --git')) {
      cleaned = `diff --git a/${normalizedPath} b/${normalizedPath}\n` + cleaned;
    }

    console.log(`🔧 Cleaned diff for: ${normalizedPath}`);
    return cleaned;
  }

  /**
   * Extract before/after code snippets from unified diff
   * @param diff - Unified diff string
   * @returns Object with beforeSnippet and afterSnippet
   */
  static extractSnippets(diff: string): { beforeSnippet: string; afterSnippet: string } {
    const lines = diff.split('\n');
    const beforeLines: string[] = [];
    const afterLines: string[] = [];

    let inHunk = false;

    for (const line of lines) {
      // Detect hunk header (@@)
      if (line.startsWith('@@')) {
        inHunk = true;
        continue;
      }
      
      // Skip non-hunk lines
      if (!inHunk) continue;

      // Process diff lines
      if (line.startsWith('-')) {
        // Removed line (before)
        beforeLines.push(line.substring(1));
      } else if (line.startsWith('+')) {
        // Added line (after)
        afterLines.push(line.substring(1));
      } else if (line.startsWith(' ')) {
        // Context line (appears in both)
        beforeLines.push(line.substring(1));
        afterLines.push(line.substring(1));
      }
    }

    const beforeSnippet = beforeLines.join('\n').trim();
    const afterSnippet = afterLines.join('\n').trim();

    console.log(`📝 Extracted snippets: ${beforeLines.length} before, ${afterLines.length} after`);

    return {
      beforeSnippet,
      afterSnippet
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
    console.log(`🔨 Building patch for: ${filePath}`);
    
    // Clean and standardize the diff
    const cleanedDiff = this.cleanDiff(rawDiff, filePath);
    
    // Extract before/after snippets for UI display
    const snippets = this.extractSnippets(cleanedDiff);

    // Construct complete patch object
    const patch: CodePatch = {
      diff: cleanedDiff,
      explanation: explanation.trim(),
      affectedFile: filePath,
      beforeSnippet: snippets.beforeSnippet,
      afterSnippet: snippets.afterSnippet,
    };

    console.log(`✅ Patch built successfully for ${filePath}`);
    return patch;
  }
}


/**
 * Export PatcherService as default for easy importing
 */
export default PatcherService;
