import { CodePatch } from '../types/doctor.js';

export class PatcherService {
  /**
   * Sanitizes and standardizes a unified diff string
   */
  static cleanDiff(diff: string, filePath: string): string {
    let cleaned = diff.trim();

    // Strip markdown fences if present
    if (cleaned.startsWith('```diff')) {
      cleaned = cleaned.replace(/^```diff\s*/i, '').replace(/```$/i, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\w*\s*/i, '').replace(/```$/i, '').trim();
    }

    const normalizedPath = filePath.replace(/\\/g, '/');

    // Ensure unified diff header exists
    if (!cleaned.includes('--- a/') && !cleaned.includes('--- ')) {
      cleaned = `--- a/${normalizedPath}\n+++ b/${normalizedPath}\n` + cleaned;
    }

    if (!cleaned.startsWith('diff --git')) {
      cleaned = `diff --git a/${normalizedPath} b/${normalizedPath}\n` + cleaned;
    }

    return cleaned;
  }

  /**
   * Extracts before and after snippets from a unified diff for side-by-side viewing
   */
  static extractSnippets(diff: string): { beforeSnippet: string; afterSnippet: string } {
    const lines = diff.split('\n');
    const beforeLines: string[] = [];
    const afterLines: string[] = [];

    let inHunk = false;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        inHunk = true;
        continue;
      }
      if (!inHunk) continue;

      if (line.startsWith('-')) {
        beforeLines.push(line.substring(1));
      } else if (line.startsWith('+')) {
        afterLines.push(line.substring(1));
      } else if (line.startsWith(' ')) {
        beforeLines.push(line.substring(1));
        afterLines.push(line.substring(1));
      }
    }

    return {
      beforeSnippet: beforeLines.join('\n').trim(),
      afterSnippet: afterLines.join('\n').trim(),
    };
  }

  /**
   * Constructs a complete CodePatch object
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
