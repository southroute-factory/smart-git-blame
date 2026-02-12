/**
 * Lineage context gathering for LLM code history explanations.
 *
 * TASK-096: Gather lineage context
 *
 * This module collects all contextual information about a line of code
 * including blame data, file history, cross-file origins, and merge context.
 */

import type { BlameLine } from "./git";
import type { FileHistory, MergeContext } from "./git";
import type { CrossFileMatch, CrossFileAnalysis } from "./crossfile";

/**
 * Blame information for a specific line
 */
export interface LineBlameInfo {
  /** Line number in the file */
  lineNumber: number;
  /** Content of the line */
  content: string;
  /** Commit SHA where this line was last modified */
  sha: string;
  /** Short SHA (first 7 characters) */
  shortSha: string;
  /** Author name */
  author: string;
  /** Author email */
  authorEmail: string;
  /** Unix timestamp of the commit */
  timestamp: number;
  /** ISO date string */
  date: string;
  /** Original line number if moved within file */
  originalLine?: number;
  /** Previous SHA if moved within file */
  previousSha?: string;
  /** Source file if copied/moved from another file */
  sourceFile?: string;
}

/**
 * File rename history context
 */
export interface RenameContext {
  /** Current file path */
  currentPath: string;
  /** Previous file path before most recent rename */
  previousPath?: string;
  /** Total number of renames in history */
  renameCount: number;
  /** Full rename history (newest first) */
  renames: Array<{
    from: string;
    to: string;
    date: string;
    commitSha: string;
  }>;
}

/**
 * Cross-file origin context for a line
 */
export interface CrossFileContext {
  /** Whether this line came from another file */
  hasOrigin: boolean;
  /** Source file path (if from another file) */
  sourceFile?: string;
  /** Type of operation that brought this code here */
  operationType?: "moved" | "copied";
  /** Confidence level of the detection */
  confidence?: "high" | "medium" | "low";
  /** Original author who wrote the code */
  originalAuthor?: string;
  /** Original commit SHA */
  originalSha?: string;
}

/**
 * Merge context for understanding how a commit arrived in main
 */
export interface CommitMergeContext {
  /** Whether the commit is a merge commit itself */
  isMergeCommit: boolean;
  /** Whether committed directly to main branch */
  isDirectCommit: boolean;
  /** Merge commit that brought this to main (if applicable) */
  mergeCommit?: {
    sha: string;
    shortSha: string;
    message: string;
    date: string;
  };
  /** Number of commits in the merge (if applicable) */
  commitsInMerge?: number;
}

/**
 * Complete lineage context for a line of code
 */
export interface LineageContext {
  /** File path */
  filePath: string;
  /** Blame information for the line */
  blame: LineBlameInfo;
  /** File rename history */
  renames: RenameContext;
  /** Cross-file origin information */
  crossFile: CrossFileContext;
  /** Merge context for the commit */
  merge: CommitMergeContext;
}

/**
 * Converts a BlameLine to LineBlameInfo with formatted data
 */
export function formatBlameInfo(line: BlameLine): LineBlameInfo {
  const date = new Date(line.timestamp * 1000);

  return {
    lineNumber: line.lineNumber,
    content: line.content,
    sha: line.sha,
    shortSha: line.sha.slice(0, 7),
    author: line.author,
    authorEmail: line.authorEmail,
    timestamp: line.timestamp,
    date: date.toISOString(),
    ...(line.originalLine !== undefined && { originalLine: line.originalLine }),
    ...(line.previousSha && { previousSha: line.previousSha }),
    ...(line.sourceFile && { sourceFile: line.sourceFile }),
  };
}

/**
 * Extracts rename context from file history
 */
export function extractRenameContext(
  currentPath: string,
  fileHistory?: FileHistory
): RenameContext {
  if (!fileHistory || fileHistory.renames.length === 0) {
    return {
      currentPath,
      renameCount: 0,
      renames: [],
    };
  }

  return {
    currentPath,
    previousPath: fileHistory.renames[0]?.fromPath,
    renameCount: fileHistory.renames.length,
    renames: fileHistory.renames.map((r) => ({
      from: r.fromPath,
      to: r.toPath,
      date: r.date,
      commitSha: r.commitSha,
    })),
  };
}

/**
 * Extracts cross-file context for a specific line from analysis
 */
export function extractCrossFileContext(
  line: BlameLine,
  analysis?: CrossFileAnalysis
): CrossFileContext {
  // Check if the line has sourceFile from blame
  if (line.sourceFile) {
    // Find matching entry in analysis for additional context
    let match: CrossFileMatch | undefined;
    if (analysis) {
      match = analysis.matches.find(
        (m) =>
          m.sourceFile === line.sourceFile &&
          m.lineNumbers.includes(line.lineNumber)
      );
    }

    return {
      hasOrigin: true,
      sourceFile: line.sourceFile,
      operationType: match?.operationType ?? "copied",
      confidence: match?.confidence ?? "medium",
      originalAuthor: match?.author ?? line.author,
      originalSha: match?.sha ?? line.sha,
    };
  }

  return {
    hasOrigin: false,
  };
}

/**
 * Extracts merge context for a commit
 */
export function extractMergeContext(
  mergeContext?: MergeContext
): CommitMergeContext {
  if (!mergeContext) {
    return {
      isMergeCommit: false,
      isDirectCommit: false,
    };
  }

  return {
    isMergeCommit: mergeContext.isMergeCommit,
    isDirectCommit: mergeContext.isDirectCommit,
    ...(mergeContext.mergeCommit && {
      mergeCommit: {
        sha: mergeContext.mergeCommit.sha,
        shortSha: mergeContext.mergeCommit.sha.slice(0, 7),
        message: mergeContext.mergeCommit.message,
        date: mergeContext.mergeCommit.date,
      },
    }),
    ...(mergeContext.commitsInMerge && {
      commitsInMerge: mergeContext.commitsInMerge.length,
    }),
  };
}

/**
 * Gathers complete lineage context for a line of code.
 *
 * TASK-096: Main function to collect all context for LLM explanations.
 *
 * @param filePath - Path to the file
 * @param line - Blame line data
 * @param fileHistory - Optional file history with renames
 * @param crossFileAnalysis - Optional cross-file analysis
 * @param mergeContext - Optional merge context for the commit
 * @returns Complete lineage context
 *
 * @example
 * ```typescript
 * const context = gatherLineageContext(
 *   'src/lib/utils.ts',
 *   blameLine,
 *   fileHistory,
 *   crossFileAnalysis,
 *   mergeContext
 * );
 * const prompt = buildExplanationPrompt(context);
 * ```
 */
export function gatherLineageContext(
  filePath: string,
  line: BlameLine,
  fileHistory?: FileHistory,
  crossFileAnalysis?: CrossFileAnalysis,
  mergeContext?: MergeContext
): LineageContext {
  return {
    filePath,
    blame: formatBlameInfo(line),
    renames: extractRenameContext(filePath, fileHistory),
    crossFile: extractCrossFileContext(line, crossFileAnalysis),
    merge: extractMergeContext(mergeContext),
  };
}

/**
 * Formats a date for display in prompts (human-readable)
 */
export function formatDateForPrompt(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculates how long ago a date was (for recency context)
 */
export function getTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Generates a summary of the lineage for logging/debugging
 */
export function summarizeLineage(context: LineageContext): string {
  const parts: string[] = [
    `Line ${context.blame.lineNumber} in ${context.filePath}`,
    `Last modified by ${context.blame.author} on ${formatDateForPrompt(context.blame.date)}`,
  ];

  if (context.renames.renameCount > 0) {
    parts.push(`File was renamed ${context.renames.renameCount} time(s)`);
    if (context.renames.previousPath) {
      parts.push(`Previously: ${context.renames.previousPath}`);
    }
  }

  if (context.crossFile.hasOrigin) {
    parts.push(
      `Code ${context.crossFile.operationType} from ${context.crossFile.sourceFile}`
    );
  }

  if (context.merge.isDirectCommit) {
    parts.push("Direct commit to main");
  } else if (context.merge.mergeCommit) {
    parts.push(`Merged via: ${context.merge.mergeCommit.shortSha}`);
  }

  return parts.join(" | ");
}
