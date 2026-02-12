/**
 * Cross-file detection service for git blame analysis.
 *
 * TASK-078: Create cross-file detection service
 * TASK-079: Add confidence scoring
 *
 * This module analyzes blame data to detect when code was copied or moved
 * from other files, providing confidence scores based on various heuristics.
 */

import { BlameLine } from "./git";

/**
 * Cache entry with expiration timestamp
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Simple in-memory cache with TTL support
 * TASK-082: Cache crossfile results
 */
class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;

  constructor(ttlMinutes: number = 5) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  /**
   * Get a value from the cache if it exists and hasn't expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  /**
   * Set a value in the cache with TTL
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  /**
   * Check if a key exists and hasn't expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size (including potentially expired entries)
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Cache for cross-file analysis results (5 minute TTL)
 * TASK-082: Cache crossfile results
 */
const crossFileAnalysisCache = new MemoryCache<CrossFileAnalysis>(5);

/**
 * Build cache key for cross-file analysis
 * TASK-082: Cache crossfile results
 */
export function buildCrossFileCacheKey(repo: string, file: string): string {
  return `crossfile:${repo}:${file}`;
}

/**
 * Get cached cross-file analysis if available
 * TASK-082: Cache crossfile results
 */
export function getCachedCrossFileAnalysis(repo: string, file: string): CrossFileAnalysis | undefined {
  const key = buildCrossFileCacheKey(repo, file);
  return crossFileAnalysisCache.get(key);
}

/**
 * Cache cross-file analysis result
 * TASK-082: Cache crossfile results
 */
export function cacheCrossFileAnalysis(repo: string, file: string, analysis: CrossFileAnalysis): void {
  const key = buildCrossFileCacheKey(repo, file);
  crossFileAnalysisCache.set(key, analysis);
}

/**
 * Clear the cross-file analysis cache
 * TASK-082: Cache crossfile results
 */
export function clearCrossFileAnalysisCache(): void {
  crossFileAnalysisCache.clear();
}

/**
 * Confidence levels for cross-file detection
 * TASK-079: Add confidence scoring
 */
export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * Represents code that was detected as coming from another file
 */
export interface CrossFileMatch {
  /** The source file where the code originated */
  sourceFile: string;
  /** Line numbers in the current file that came from this source */
  lineNumbers: number[];
  /** The author who wrote the original code */
  author: string;
  /** Timestamp of the original commit */
  timestamp: number;
  /** SHA of the commit where the code was originally written */
  sha: string;
  /** Confidence level of the detection */
  confidence: ConfidenceLevel;
  /** Detected type of operation */
  operationType: "moved" | "copied";
}

/**
 * Summary of cross-file analysis for a blamed file
 */
export interface CrossFileAnalysis {
  /** Current file being analyzed */
  currentFile: string;
  /** Total number of lines analyzed */
  totalLines: number;
  /** Number of lines detected as coming from other files */
  crossFileLines: number;
  /** Grouped matches by source file */
  matches: CrossFileMatch[];
  /** Percentage of code from other files */
  crossFilePercentage: number;
}

/**
 * Internal structure for grouping lines by source file
 */
interface SourceFileGroup {
  sourceFile: string;
  lines: BlameLine[];
}

/**
 * Threshold constants for confidence scoring
 */
const CONFIDENCE_THRESHOLDS = {
  /** Minimum lines to consider a high confidence match */
  HIGH_MIN_LINES: 5,
  /** Maximum time difference (in seconds) for high confidence (24 hours) */
  HIGH_MAX_TIME_DIFF: 24 * 60 * 60,
  /** Minimum lines for medium confidence */
  MEDIUM_MIN_LINES: 2,
  /** Maximum time difference for medium confidence (7 days) */
  MEDIUM_MAX_TIME_DIFF: 7 * 24 * 60 * 60,
} as const;

/**
 * Groups blame lines by their source file.
 *
 * @param lines - Array of BlameLine objects from git blame
 * @returns Array of source file groups, excluding lines from the current file
 */
export function groupBySourceFile(lines: BlameLine[]): SourceFileGroup[] {
  const groups = new Map<string, BlameLine[]>();

  for (const line of lines) {
    // Only include lines that have a sourceFile (came from another file)
    if (line.sourceFile) {
      const existing = groups.get(line.sourceFile);
      if (existing) {
        existing.push(line);
      } else {
        groups.set(line.sourceFile, [line]);
      }
    }
  }

  return Array.from(groups.entries()).map(([sourceFile, lines]) => ({
    sourceFile,
    lines,
  }));
}

/**
 * Determines if code was moved vs copied based on heuristics.
 *
 * Heuristics for "moved":
 * - Large contiguous blocks (5+ lines)
 * - Same author context
 * - Close timestamps (within same commit window)
 *
 * Heuristics for "copied":
 * - Smaller fragments
 * - Different commit contexts
 * - Longer time between original and current
 *
 * @param lines - Lines from a single source file
 * @param allLines - All blame lines in the current file
 * @returns 'moved' or 'copied' classification
 */
export function determineOperationType(
  lines: BlameLine[],
  _allLines: BlameLine[]
): "moved" | "copied" {
  if (lines.length === 0) {
    return "copied";
  }

  // Check for contiguous blocks
  const lineNumbers = lines.map((l) => l.lineNumber).sort((a, b) => a - b);
  let maxContiguousLength = 1;
  let currentContiguousLength = 1;

  for (let i = 1; i < lineNumbers.length; i++) {
    if (lineNumbers[i] === lineNumbers[i - 1] + 1) {
      currentContiguousLength++;
      maxContiguousLength = Math.max(maxContiguousLength, currentContiguousLength);
    } else {
      currentContiguousLength = 1;
    }
  }

  // If we have a large contiguous block, likely a move
  if (maxContiguousLength >= CONFIDENCE_THRESHOLDS.HIGH_MIN_LINES) {
    return "moved";
  }

  // Check if all lines share the same author and close timestamps
  const uniqueAuthors = new Set(lines.map((l) => l.author));
  const timestamps = lines.map((l) => l.timestamp);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const timeDiff = maxTimestamp - minTimestamp;

  // Same author + close timestamps suggests a deliberate move
  if (uniqueAuthors.size === 1 && timeDiff < CONFIDENCE_THRESHOLDS.HIGH_MAX_TIME_DIFF) {
    return "moved";
  }

  // Default to copied for smaller/fragmented changes
  return "copied";
}

/**
 * Calculates confidence score for a cross-file match.
 *
 * TASK-079: Add confidence scoring
 *
 * High confidence:
 * - Same content, same author, close timestamp (< 24h)
 * - Large contiguous blocks (5+ lines)
 *
 * Medium confidence:
 * - Same content, different context
 * - 2-4 lines, within 7 days
 *
 * Low confidence:
 * - Similar content, uncertain origin
 * - Single line or fragmented matches
 * - Large time gaps
 *
 * @param lines - Lines from a single source file
 * @param allLines - All blame lines for context
 * @returns Confidence level
 */
export function calculateConfidence(
  lines: BlameLine[],
  _allLines: BlameLine[]
): ConfidenceLevel {
  if (lines.length === 0) {
    return "low";
  }

  // Check contiguity
  const lineNumbers = lines.map((l) => l.lineNumber).sort((a, b) => a - b);
  let maxContiguousLength = 1;
  let currentContiguousLength = 1;

  for (let i = 1; i < lineNumbers.length; i++) {
    if (lineNumbers[i] === lineNumbers[i - 1] + 1) {
      currentContiguousLength++;
      maxContiguousLength = Math.max(maxContiguousLength, currentContiguousLength);
    } else {
      currentContiguousLength = 1;
    }
  }

  // Check author consistency
  const uniqueAuthors = new Set(lines.map((l) => l.author));
  const sameAuthor = uniqueAuthors.size === 1;

  // Check timestamp consistency
  const timestamps = lines.map((l) => l.timestamp);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const timeDiff = maxTimestamp - minTimestamp;

  // High confidence criteria:
  // - 5+ contiguous lines OR (same author AND close timestamps AND 3+ lines)
  if (
    maxContiguousLength >= CONFIDENCE_THRESHOLDS.HIGH_MIN_LINES ||
    (sameAuthor && timeDiff < CONFIDENCE_THRESHOLDS.HIGH_MAX_TIME_DIFF && lines.length >= 3)
  ) {
    return "high";
  }

  // Medium confidence criteria:
  // - 2+ lines within reasonable time window OR multiple lines from same author
  if (
    lines.length >= CONFIDENCE_THRESHOLDS.MEDIUM_MIN_LINES &&
    (timeDiff < CONFIDENCE_THRESHOLDS.MEDIUM_MAX_TIME_DIFF || sameAuthor)
  ) {
    return "medium";
  }

  // Low confidence: single line, fragmented, or uncertain
  return "low";
}

/**
 * Analyzes blame data to detect cross-file code movement/copying.
 *
 * TASK-078: Create cross-file detection service
 * TASK-079: Add confidence scoring
 *
 * @param lines - Array of BlameLine objects from git blame (with -C flags)
 * @param currentFile - Path of the current file being analyzed
 * @returns CrossFileAnalysis with detected matches and confidence scores
 *
 * @example
 * ```typescript
 * const blameResult = await execGitBlame('/repo', 'src/new-file.ts');
 * const analysis = analyzeCrossFileOrigins(blameResult.lines, 'src/new-file.ts');
 *
 * for (const match of analysis.matches) {
 *   console.log(`${match.lineNumbers.length} lines from ${match.sourceFile}`);
 *   console.log(`Confidence: ${match.confidence}, Type: ${match.operationType}`);
 * }
 * ```
 */
export function analyzeCrossFileOrigins(
  lines: BlameLine[],
  currentFile: string
): CrossFileAnalysis {
  const groups = groupBySourceFile(lines);
  const matches: CrossFileMatch[] = [];

  for (const group of groups) {
    const { sourceFile, lines: groupLines } = group;

    // Get representative line for author/timestamp (use the most common author)
    const authorCounts = new Map<string, number>();
    for (const line of groupLines) {
      authorCounts.set(line.author, (authorCounts.get(line.author) || 0) + 1);
    }
    const primaryAuthor = Array.from(authorCounts.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "";

    // Get the earliest timestamp and SHA
    const sortedByTime = [...groupLines].sort((a, b) => a.timestamp - b.timestamp);
    const earliestLine = sortedByTime[0];

    const confidence = calculateConfidence(groupLines, lines);
    const operationType = determineOperationType(groupLines, lines);

    matches.push({
      sourceFile,
      lineNumbers: groupLines.map((l) => l.lineNumber).sort((a, b) => a - b),
      author: primaryAuthor,
      timestamp: earliestLine?.timestamp || 0,
      sha: earliestLine?.sha || "",
      confidence,
      operationType,
    });
  }

  // Sort matches by number of lines (most significant first)
  matches.sort((a, b) => b.lineNumbers.length - a.lineNumbers.length);

  const crossFileLines = lines.filter((l) => l.sourceFile).length;
  const crossFilePercentage =
    lines.length > 0 ? Math.round((crossFileLines / lines.length) * 100) : 0;

  return {
    currentFile,
    totalLines: lines.length,
    crossFileLines,
    matches,
    crossFilePercentage,
  };
}

/**
 * Filters cross-file matches by minimum confidence level.
 *
 * @param analysis - CrossFileAnalysis result
 * @param minConfidence - Minimum confidence level to include
 * @returns Filtered array of CrossFileMatch
 */
export function filterByConfidence(
  analysis: CrossFileAnalysis,
  minConfidence: ConfidenceLevel
): CrossFileMatch[] {
  const confidenceOrder: Record<ConfidenceLevel, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const minLevel = confidenceOrder[minConfidence];

  return analysis.matches.filter(
    (match) => confidenceOrder[match.confidence] >= minLevel
  );
}

/**
 * Gets a summary of cross-file origins for display.
 *
 * @param analysis - CrossFileAnalysis result
 * @returns Human-readable summary string
 */
export function getCrossFileSummary(analysis: CrossFileAnalysis): string {
  if (analysis.matches.length === 0) {
    return "No cross-file origins detected.";
  }

  const summaryParts: string[] = [
    `${analysis.crossFilePercentage}% of code (${analysis.crossFileLines}/${analysis.totalLines} lines) originated from other files:`,
  ];

  for (const match of analysis.matches) {
    summaryParts.push(
      `  - ${match.sourceFile}: ${match.lineNumbers.length} lines (${match.confidence} confidence, ${match.operationType})`
    );
  }

  return summaryParts.join("\n");
}
