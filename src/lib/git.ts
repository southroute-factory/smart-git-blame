import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Cache entry with expiration timestamp
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Simple in-memory cache with TTL support
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
 * Cache for merge context lookups (5 minute TTL)
 */
const mergeContextCache = new MemoryCache<MergeContext>(5);

/**
 * Represents a file rename event in git history
 */
export interface FileRename {
  /** Previous file path before rename */
  fromPath: string;
  /** New file path after rename */
  toPath: string;
  /** Commit SHA where the rename occurred */
  commitSha: string;
  /** ISO 8601 date string of the rename */
  date: string;
}

/**
 * Represents the complete file history including renames
 */
export interface FileHistory {
  /** Current path of the file */
  currentPath: string;
  /** List of renames in reverse chronological order (newest first) */
  renames: FileRename[];
}

/**
 * Cache for file history lookups (5 minute TTL)
 */
const fileHistoryCache = new MemoryCache<FileHistory>(5);

/**
 * Build cache key for merge context
 */
export function buildMergeContextCacheKey(repo: string, sha: string): string {
  return `${repo}:${sha}`;
}

/**
 * Get cached merge context if available
 */
export function getCachedMergeContext(repo: string, sha: string): MergeContext | undefined {
  const key = buildMergeContextCacheKey(repo, sha);
  return mergeContextCache.get(key);
}

/**
 * Cache merge context result
 */
export function cacheMergeContext(repo: string, sha: string, context: MergeContext): void {
  const key = buildMergeContextCacheKey(repo, sha);
  mergeContextCache.set(key, context);
}

/**
 * Clear the merge context cache
 */
export function clearMergeContextCache(): void {
  mergeContextCache.clear();
}

/**
 * Represents a commit in a merge context
 */
export interface MergeCommitInfo {
  sha: string;
  message: string;
  author: string;
}

/**
 * Represents the merge context for a commit
 */
export interface MergeContext {
  /** True if the queried commit is itself a merge commit */
  isMergeCommit: boolean;
  /** True if committed directly to main (no merge parent) */
  isDirectCommit: boolean;
  /** The merge commit that brought this commit to main */
  mergeCommit?: {
    sha: string;
    message: string;
    date: string;
  };
  /** List of commits included in the merge */
  commitsInMerge?: MergeCommitInfo[];
}

/**
 * Represents commit details from git show
 */
export interface CommitDetails {
  sha: string;
  author: string;
  authorEmail: string;
  date: string;
  message: string;
  stats: {
    filesChanged: number;
    insertions: number;
    deletions: number;
  };
}

/**
 * Represents a single line from git blame output
 */
export interface BlameLine {
  lineNumber: number;
  content: string;
  sha: string;
  author: string;
  authorEmail: string;
  timestamp: number;
  /** Original line number if the line was moved within the file (TASK-059) */
  originalLine?: number;
  /** If line was moved, the previous SHA where it originated (TASK-059) */
  previousSha?: string;
}

/**
 * Result of executing git blame
 */
export interface GitBlameResult {
  lines: BlameLine[];
  file: string;
  repo: string;
}

/**
 * Error thrown when git operations fail
 */
export class GitError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly stderr?: string
  ) {
    super(message);
    this.name = "GitError";
  }
}

/**
 * Parses git blame porcelain output into structured BlameLine objects.
 *
 * Porcelain format structure:
 * ```
 * {sha} {original-line} {final-line} {num-lines}
 * author {name}
 * author-mail <{email}>
 * author-time {timestamp}
 * author-tz {timezone}
 * committer {name}
 * committer-mail <{email}>
 * committer-time {timestamp}
 * committer-tz {timezone}
 * summary {commit summary}
 * [previous {sha} {filename}]
 * [boundary]
 * filename {filename}
 * \t{content}
 * ```
 *
 * With -M flag for move detection, when a line was moved within the file,
 * the "previous" line shows where the content originally came from:
 * ```
 * {sha} {original-line} {final-line}
 * previous {prev-sha} {prev-filename}
 * ```
 *
 * @param porcelainOutput - Raw output from git blame --porcelain
 * @returns Array of BlameLine objects
 */
export function parseBlameOutput(porcelainOutput: string): BlameLine[] {
  const lines: BlameLine[] = [];
  const outputLines = porcelainOutput.split("\n");

  let currentSha = "";
  let currentAuthor = "";
  let currentAuthorEmail = "";
  let currentTimestamp = 0;
  let currentFinalLine = 0;
  let currentOriginalLine = 0;
  let currentPreviousSha: string | undefined;
  let currentPreviousOriginalLine: number | undefined;

  // Cache for commit metadata (sha -> metadata)
  // Git blame porcelain only outputs full commit info once per commit
  const commitCache = new Map<
    string,
    { author: string; authorEmail: string; timestamp: number }
  >();

  for (let i = 0; i < outputLines.length; i++) {
    const line = outputLines[i];

    // Skip empty lines
    if (!line) {
      continue;
    }

    // Check if this is a commit line (40-char hex SHA followed by line numbers)
    const commitMatch = line.match(/^([a-f0-9]{40})\s+(\d+)\s+(\d+)(?:\s+(\d+))?$/);

    if (commitMatch) {
      currentSha = commitMatch[1];
      currentOriginalLine = parseInt(commitMatch[2], 10);
      currentFinalLine = parseInt(commitMatch[3], 10);
      // Reset previous info for new line block
      currentPreviousSha = undefined;
      currentPreviousOriginalLine = undefined;

      // Check if we have cached metadata for this commit
      const cached = commitCache.get(currentSha);
      if (cached) {
        currentAuthor = cached.author;
        currentAuthorEmail = cached.authorEmail;
        currentTimestamp = cached.timestamp;
      }
      continue;
    }

    // Parse author name
    if (line.startsWith("author ")) {
      currentAuthor = line.slice(7);
      continue;
    }

    // Parse author email (format: author-mail <email@example.com>)
    if (line.startsWith("author-mail ")) {
      const email = line.slice(12);
      // Remove angle brackets if present
      currentAuthorEmail = email.replace(/^<|>$/g, "");
      continue;
    }

    // Parse author timestamp
    if (line.startsWith("author-time ")) {
      currentTimestamp = parseInt(line.slice(12), 10);
      continue;
    }

    // TASK-058: Parse "previous" line for move detection with -M flag
    // Format: "previous {sha} {filename}"
    if (line.startsWith("previous ")) {
      const previousMatch = line.match(/^previous\s+([a-f0-9]{40})\s+(.+)$/);
      if (previousMatch) {
        currentPreviousSha = previousMatch[1];
        // If line was moved (original line differs from final line), track original position
        if (currentOriginalLine !== currentFinalLine) {
          currentPreviousOriginalLine = currentOriginalLine;
        }
      }
      continue;
    }

    // When we hit the filename line, cache the commit metadata
    if (line.startsWith("filename ")) {
      if (!commitCache.has(currentSha)) {
        commitCache.set(currentSha, {
          author: currentAuthor,
          authorEmail: currentAuthorEmail,
          timestamp: currentTimestamp,
        });
      }
      continue;
    }

    // Content line starts with a tab
    if (line.startsWith("\t")) {
      const content = line.slice(1); // Remove leading tab

      const blameLine: BlameLine = {
        lineNumber: currentFinalLine,
        content,
        sha: currentSha,
        author: currentAuthor,
        authorEmail: currentAuthorEmail,
        timestamp: currentTimestamp,
      };

      // TASK-059: Add movement info if line was moved within file
      if (currentPreviousSha && currentPreviousOriginalLine !== undefined) {
        blameLine.originalLine = currentPreviousOriginalLine;
        blameLine.previousSha = currentPreviousSha;
      }

      lines.push(blameLine);
      continue;
    }

    // Skip other metadata lines (committer, summary, boundary, etc.)
  }

  return lines;
}

/**
 * Executes git blame on a file and returns parsed results.
 *
 * @param repoPath - Absolute path to the git repository
 * @param filePath - Path to the file relative to repo root
 * @returns Promise resolving to GitBlameResult
 * @throws GitError if git command fails
 */
export async function execGitBlame(
  repoPath: string,
  filePath: string
): Promise<GitBlameResult> {
  // Validate inputs to prevent command injection
  if (!repoPath || typeof repoPath !== "string") {
    throw new GitError("Invalid repository path");
  }
  if (!filePath || typeof filePath !== "string") {
    throw new GitError("Invalid file path");
  }

  // Sanitize paths - reject paths with dangerous characters
  const dangerousChars = /[;&|`$(){}[\]<>\\'"!#*?~]/;
  if (dangerousChars.test(repoPath) || dangerousChars.test(filePath)) {
    throw new GitError("Invalid characters in path");
  }

  try {
    // TASK-057: Use -M flag to detect lines moved within file
    const { stdout, stderr } = await execAsync(
      `git blame -M --porcelain -- "${filePath}"`,
      {
        cwd: repoPath,
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large files
        encoding: "utf-8",
      }
    );

    // Git may output warnings to stderr even on success
    if (stderr && !stdout) {
      throw new GitError(`Git blame failed: ${stderr}`, 1, stderr);
    }

    const lines = parseBlameOutput(stdout);

    return {
      lines,
      file: filePath,
      repo: repoPath,
    };
  } catch (error) {
    if (error instanceof GitError) {
      throw error;
    }

    // Handle exec errors
    const execError = error as { code?: number; stderr?: string; message?: string };

    if (execError.stderr?.includes("fatal: no such path")) {
      throw new GitError(`File not found: ${filePath}`, 128, execError.stderr);
    }

    if (execError.stderr?.includes("fatal: not a git repository")) {
      throw new GitError(
        `Not a git repository: ${repoPath}`,
        128,
        execError.stderr
      );
    }

    throw new GitError(
      execError.message || "Git blame failed",
      execError.code,
      execError.stderr
    );
  }
}

/**
 * Parses git show --stat output into structured CommitDetails.
 *
 * Expected output format:
 * ```
 * commit {sha}
 * Author: {name} <{email}>
 * Date:   {date}
 *
 *     {message line 1}
 *     {message line 2}
 *     ...
 *
 *  file1.txt | 10 +++---
 *  file2.ts  | 25 +++++++++++++++++++-----
 *  3 files changed, 20 insertions(+), 15 deletions(-)
 * ```
 *
 * @param output - Raw output from git show --stat
 * @returns CommitDetails object
 */
export function parseGitShow(output: string): CommitDetails {
  const lines = output.split("\n");

  let sha = "";
  let author = "";
  let authorEmail = "";
  let date = "";
  const messageLines: string[] = [];
  let filesChanged = 0;
  let insertions = 0;
  let deletions = 0;

  let parsingMessage = false;
  let foundBlankAfterDate = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse commit SHA
    if (line.startsWith("commit ")) {
      sha = line.slice(7).trim();
      continue;
    }

    // Parse Author line: "Author: Name <email@example.com>"
    if (line.startsWith("Author: ")) {
      const authorLine = line.slice(8);
      const emailMatch = authorLine.match(/^(.+?)\s*<(.+)>$/);
      if (emailMatch) {
        author = emailMatch[1].trim();
        authorEmail = emailMatch[2].trim();
      } else {
        author = authorLine.trim();
      }
      continue;
    }

    // Parse Date line: "Date:   Mon Jan 15 10:30:00 2024 -0500"
    if (line.startsWith("Date:")) {
      date = line.slice(5).trim();
      continue;
    }

    // Blank line after Date starts the message section
    if (!foundBlankAfterDate && line === "" && date !== "") {
      foundBlankAfterDate = true;
      parsingMessage = true;
      continue;
    }

    // Parse message lines (indented with 4 spaces)
    if (parsingMessage) {
      // End of message: blank line or start of stats
      if (line === "") {
        parsingMessage = false;
        continue;
      }
      // Message lines are indented
      if (line.startsWith("    ")) {
        messageLines.push(line.slice(4));
        continue;
      }
      // Non-indented line means we've hit the stats section
      parsingMessage = false;
    }

    // Parse stat summary line: "3 files changed, 20 insertions(+), 15 deletions(-)"
    const statMatch = line.match(
      /^\s*(\d+)\s+files?\s+changed(?:,\s+(\d+)\s+insertions?\(\+\))?(?:,\s+(\d+)\s+deletions?\(-\))?/
    );
    if (statMatch) {
      filesChanged = parseInt(statMatch[1], 10);
      insertions = statMatch[2] ? parseInt(statMatch[2], 10) : 0;
      deletions = statMatch[3] ? parseInt(statMatch[3], 10) : 0;
      continue;
    }
  }

  return {
    sha,
    author,
    authorEmail,
    date,
    message: messageLines.join("\n"),
    stats: {
      filesChanged,
      insertions,
      deletions,
    },
  };
}

/**
 * Executes git show --stat on a commit and returns parsed results.
 *
 * @param repoPath - Absolute path to the git repository
 * @param sha - Commit SHA to show
 * @returns Promise resolving to CommitDetails
 * @throws GitError if git command fails
 */
export async function execGitShow(
  repoPath: string,
  sha: string
): Promise<CommitDetails> {
  // Validate inputs to prevent command injection
  if (!repoPath || typeof repoPath !== "string") {
    throw new GitError("Invalid repository path");
  }
  if (!sha || typeof sha !== "string") {
    throw new GitError("Invalid commit SHA");
  }

  // Sanitize paths - reject paths with dangerous characters
  const dangerousChars = /[;&|`$(){}[\]<>\\'"!#*?~]/;
  if (dangerousChars.test(repoPath)) {
    throw new GitError("Invalid characters in repository path");
  }

  // Validate SHA format (allow short and full SHAs, alphanumeric only)
  const shaPattern = /^[a-f0-9]{4,40}$/i;
  if (!shaPattern.test(sha)) {
    throw new GitError("Invalid commit SHA format");
  }

  try {
    const { stdout, stderr } = await execAsync(
      `git show --stat "${sha}"`,
      {
        cwd: repoPath,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        encoding: "utf-8",
      }
    );

    // Git may output warnings to stderr even on success
    if (stderr && !stdout) {
      throw new GitError(`Git show failed: ${stderr}`, 1, stderr);
    }

    return parseGitShow(stdout);
  } catch (error) {
    if (error instanceof GitError) {
      throw error;
    }

    // Handle exec errors
    const execError = error as { code?: number; stderr?: string; message?: string };

    if (execError.stderr?.includes("fatal: bad object")) {
      throw new GitError(`Commit not found: ${sha}`, 128, execError.stderr);
    }

    if (execError.stderr?.includes("fatal: not a git repository")) {
      throw new GitError(
        `Not a git repository: ${repoPath}`,
        128,
        execError.stderr
      );
    }

    throw new GitError(
      execError.message || "Git show failed",
      execError.code,
      execError.stderr
    );
  }
}

/**
 * Validates repository path and commit SHA for use in git commands.
 *
 * @param repoPath - Absolute path to the git repository
 * @param sha - Commit SHA to validate
 * @throws GitError if validation fails
 */
function validateGitInputs(repoPath: string, sha: string): void {
  if (!repoPath || typeof repoPath !== "string") {
    throw new GitError("Invalid repository path");
  }
  if (!sha || typeof sha !== "string") {
    throw new GitError("Invalid commit SHA");
  }

  const dangerousChars = /[;&|`$(){}[\]<>\\'"!#*?~]/;
  if (dangerousChars.test(repoPath)) {
    throw new GitError("Invalid characters in repository path");
  }

  const shaPattern = /^[a-f0-9]{4,40}$/i;
  if (!shaPattern.test(sha)) {
    throw new GitError("Invalid commit SHA format");
  }
}

/**
 * Checks if a commit is a merge commit (has multiple parents).
 *
 * @param repoPath - Absolute path to the git repository
 * @param sha - Commit SHA to check
 * @returns Promise resolving to true if the commit is a merge
 */
async function isMerge(repoPath: string, sha: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `git rev-parse "${sha}^2"`,
      {
        cwd: repoPath,
        encoding: "utf-8",
      }
    );
    // If this succeeds, the commit has a second parent (merge commit)
    return stdout.trim().length > 0;
  } catch {
    // No second parent means it's not a merge
    return false;
  }
}

/**
 * Checks if a commit is reachable from HEAD via first-parent only
 * (i.e., it was committed directly to main, not via a merge).
 *
 * TASK-025: Direct Commit Detection
 * A commit is considered a "direct commit" if it appears in the first-parent
 * chain from HEAD. This means it was committed directly to main/master,
 * not brought in via a merge from a feature branch.
 *
 * First-parent traversal follows only merge commits' first parent, which
 * represents the mainline history. Commits introduced via the second parent
 * (merged branches) are excluded.
 *
 * @param repoPath - Absolute path to the git repository
 * @param sha - Commit SHA to check
 * @returns Promise resolving to true if the commit is on the main line
 */
async function isOnMainLine(repoPath: string, sha: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `git log --first-parent --format="%H" HEAD`,
      {
        cwd: repoPath,
        maxBuffer: 50 * 1024 * 1024,
        encoding: "utf-8",
      }
    );
    const mainLineCommits = stdout.trim().split("\n");
    return mainLineCommits.includes(sha);
  } catch {
    return false;
  }
}

/**
 * Finds merge commits that brought a commit to the main branch.
 *
 * @param repoPath - Absolute path to the git repository
 * @param sha - Commit SHA to find merge for
 * @returns Promise resolving to array of merge commit SHAs (most recent first)
 */
async function findMergeCommits(
  repoPath: string,
  sha: string
): Promise<string[]> {
  try {
    // Find merge commits in the ancestry path from sha to HEAD
    const { stdout } = await execAsync(
      `git log --ancestry-path "${sha}"..HEAD --merges --format="%H"`,
      {
        cwd: repoPath,
        maxBuffer: 10 * 1024 * 1024,
        encoding: "utf-8",
      }
    );

    if (!stdout.trim()) {
      return [];
    }

    const mergeCommits = stdout.trim().split("\n").filter(Boolean);

    // Filter to only include merges that actually contain this commit
    // (ancestry-path may include unrelated merges)
    const validMerges: string[] = [];
    for (const merge of mergeCommits) {
      try {
        // Check if the commit is an ancestor of the merge's second parent
        await execAsync(
          `git merge-base --is-ancestor "${sha}" "${merge}^2"`,
          {
            cwd: repoPath,
            encoding: "utf-8",
          }
        );
        validMerges.push(merge);
      } catch {
        // Not an ancestor of merge^2, skip
      }
    }

    return validMerges;
  } catch {
    return [];
  }
}

/**
 * Gets information about a merge commit.
 *
 * @param repoPath - Absolute path to the git repository
 * @param sha - Merge commit SHA
 * @returns Promise resolving to merge commit info
 */
async function getMergeCommitInfo(
  repoPath: string,
  sha: string
): Promise<{ sha: string; message: string; date: string }> {
  const { stdout } = await execAsync(
    `git log -1 --format="%H%n%s%n%aI" "${sha}"`,
    {
      cwd: repoPath,
      encoding: "utf-8",
    }
  );

  const [commitSha, message, date] = stdout.trim().split("\n");
  return {
    sha: commitSha,
    message,
    date,
  };
}

/**
 * Gets all commits that were included in a merge.
 *
 * @param repoPath - Absolute path to the git repository
 * @param mergeSha - The merge commit SHA
 * @returns Promise resolving to array of commits in the merge
 */
async function getCommitsInMerge(
  repoPath: string,
  mergeSha: string
): Promise<MergeCommitInfo[]> {
  try {
    // Get commits between first parent and second parent of the merge
    // This gives us the commits that were merged in
    const { stdout } = await execAsync(
      `git log --format="%H|%s|%an" "${mergeSha}^1..${mergeSha}^2"`,
      {
        cwd: repoPath,
        maxBuffer: 10 * 1024 * 1024,
        encoding: "utf-8",
      }
    );

    if (!stdout.trim()) {
      return [];
    }

    return stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [sha, message, author] = line.split("|");
        return { sha, message, author };
      });
  } catch {
    return [];
  }
}

/**
 * Gets the merge context for a commit, determining if it was merged via PR
 * or committed directly to the main branch.
 *
 * @param repoPath - Absolute path to the git repository
 * @param commitSha - Commit SHA to analyze
 * @returns Promise resolving to MergeContext
 * @throws GitError if git command fails
 *
 * @example
 * ```typescript
 * const context = await getMergeContext('/path/to/repo', 'abc123');
 * if (context.isDirectCommit) {
 *   console.log('Commit was made directly to main');
 * } else if (context.mergeCommit) {
 *   console.log(`Merged via: ${context.mergeCommit.sha}`);
 *   console.log(`Commits in merge: ${context.commitsInMerge?.length}`);
 * }
 * ```
 */
export async function getMergeContext(
  repoPath: string,
  commitSha: string
): Promise<MergeContext> {
  validateGitInputs(repoPath, commitSha);

  // Check cache first
  const cached = getCachedMergeContext(repoPath, commitSha);
  if (cached) {
    return cached;
  }

  try {
    // First, resolve the short SHA to full SHA
    const { stdout: fullShaOutput } = await execAsync(
      `git rev-parse "${commitSha}"`,
      {
        cwd: repoPath,
        encoding: "utf-8",
      }
    );
    const fullSha = fullShaOutput.trim();

    // Check if this commit itself is a merge commit
    const commitIsMerge = await isMerge(repoPath, fullSha);

    let result: MergeContext;

    if (commitIsMerge) {
      // The commit is itself a merge commit
      const mergeInfo = await getMergeCommitInfo(repoPath, fullSha);
      const commitsInMerge = await getCommitsInMerge(repoPath, fullSha);

      result = {
        isMergeCommit: true,
        isDirectCommit: false,
        mergeCommit: mergeInfo,
        commitsInMerge,
      };
    } else {
      // Check if the commit is directly on the main line
      const onMainLine = await isOnMainLine(repoPath, fullSha);

      if (onMainLine) {
        // Commit was made directly to main
        result = {
          isMergeCommit: false,
          isDirectCommit: true,
        };
      } else {
        // Find merge commits that brought this commit to main
        const mergeCommits = await findMergeCommits(repoPath, fullSha);

        if (mergeCommits.length === 0) {
          // No merge found - commit might be on a branch not yet merged
          // or it could be an old commit where merge history is complex
          result = {
            isMergeCommit: false,
            isDirectCommit: false,
          };
        } else {
          // Use the most recent (first) merge commit
          const mergeSha = mergeCommits[0];
          const mergeInfo = await getMergeCommitInfo(repoPath, mergeSha);
          const commitsInMerge = await getCommitsInMerge(repoPath, mergeSha);

          result = {
            isMergeCommit: false,
            isDirectCommit: false,
            mergeCommit: mergeInfo,
            commitsInMerge,
          };
        }
      }
    }

    // Cache the result before returning
    cacheMergeContext(repoPath, commitSha, result);
    return result;
  } catch (error) {
    if (error instanceof GitError) {
      throw error;
    }

    const execError = error as { code?: number; stderr?: string; message?: string };

    if (execError.stderr?.includes("fatal: bad object") ||
        execError.stderr?.includes("unknown revision")) {
      throw new GitError(`Commit not found: ${commitSha}`, 128, execError.stderr);
    }

    if (execError.stderr?.includes("fatal: not a git repository")) {
      throw new GitError(
        `Not a git repository: ${repoPath}`,
        128,
        execError.stderr
      );
    }

    throw new GitError(
      execError.message || "Failed to get merge context",
      execError.code,
      execError.stderr
    );
  }
}

/**
 * Build cache key for file history
 */
export function buildFileHistoryCacheKey(repo: string, file: string): string {
  return `history:${repo}:${file}`;
}

/**
 * Get cached file history if available
 */
export function getCachedFileHistory(repo: string, file: string): FileHistory | undefined {
  const key = buildFileHistoryCacheKey(repo, file);
  return fileHistoryCache.get(key);
}

/**
 * Cache file history result
 */
export function cacheFileHistory(repo: string, file: string, history: FileHistory): void {
  const key = buildFileHistoryCacheKey(repo, file);
  fileHistoryCache.set(key, history);
}

/**
 * Clear the file history cache
 */
export function clearFileHistoryCache(): void {
  fileHistoryCache.clear();
}

/**
 * Validates repository path and file path for use in git commands.
 *
 * @param repoPath - Absolute path to the git repository
 * @param filePath - Relative path to file within repository
 * @throws GitError if validation fails
 */
function validateFileInputs(repoPath: string, filePath: string): void {
  if (!repoPath || typeof repoPath !== "string") {
    throw new GitError("Invalid repository path");
  }
  if (!filePath || typeof filePath !== "string") {
    throw new GitError("Invalid file path");
  }

  const dangerousChars = /[;&|`$(){}[\]<>\\'"!#*?~]/;
  if (dangerousChars.test(repoPath) || dangerousChars.test(filePath)) {
    throw new GitError("Invalid characters in path");
  }
}

/**
 * Parses git log --follow --name-status output to extract file rename history.
 *
 * The git log --follow --name-status --format="%H|%an|%ae|%at|%s" command outputs:
 * ```
 * {sha}|{author}|{email}|{timestamp}|{subject}
 *
 * R100    old/path.ts     new/path.ts
 * M       path.ts
 * ...
 * ```
 *
 * We're interested in lines starting with 'R' (rename) which have format:
 * R{similarity}\t{old_path}\t{new_path}
 *
 * @param output - Raw output from git log --follow --name-status
 * @param currentPath - Current path of the file
 * @returns FileHistory object with rename information
 */
export function parseFileHistoryOutput(output: string, currentPath: string): FileHistory {
  const renames: FileRename[] = [];
  const lines = output.split("\n");

  let currentCommitSha = "";
  let currentTimestamp = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    // Check if this is a commit info line (format: sha|author|email|timestamp|subject)
    const commitMatch = line.match(/^([a-f0-9]{40})\|([^|]*)\|([^|]*)\|(\d+)\|(.*)$/);
    if (commitMatch) {
      currentCommitSha = commitMatch[1];
      currentTimestamp = parseInt(commitMatch[4], 10);
      continue;
    }

    // Check if this is a rename line (format: R{similarity}\t{old_path}\t{new_path})
    // Git uses tab characters to separate fields in --name-status output
    const renameMatch = line.match(/^R\d*\t(.+)\t(.+)$/);
    if (renameMatch && currentCommitSha) {
      const fromPath = renameMatch[1];
      const toPath = renameMatch[2];

      renames.push({
        fromPath,
        toPath,
        commitSha: currentCommitSha,
        date: new Date(currentTimestamp * 1000).toISOString(),
      });
    }
  }

  return {
    currentPath,
    renames,
  };
}

/**
 * Gets the file history including rename tracking using git log --follow.
 *
 * TASK-049: Implement git log --follow parser
 * Uses `git log --follow --name-status` to track file history across renames.
 *
 * TASK-051: Cache file history results
 * Results are cached using MemoryCache with a 5-minute TTL.
 *
 * @param repoPath - Absolute path to the git repository
 * @param filePath - Path to the file relative to repo root
 * @returns Promise resolving to FileHistory with rename information
 * @throws GitError if git command fails
 *
 * @example
 * ```typescript
 * const history = await getFileHistory('/path/to/repo', 'src/new-name.ts');
 * if (history.renames.length > 0) {
 *   console.log(`File was renamed from: ${history.renames[0].fromPath}`);
 * }
 * ```
 */
export async function getFileHistory(
  repoPath: string,
  filePath: string
): Promise<FileHistory> {
  validateFileInputs(repoPath, filePath);

  // Check cache first (TASK-051)
  const cached = getCachedFileHistory(repoPath, filePath);
  if (cached) {
    return cached;
  }

  try {
    // Execute git log --follow to track file renames
    // Format: sha|author|email|timestamp|subject
    // --name-status shows the status (R for rename, M for modify, etc.)
    const { stdout, stderr } = await execAsync(
      `git log --follow --name-status --format="%H|%an|%ae|%at|%s" -- "${filePath}"`,
      {
        cwd: repoPath,
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large histories
        encoding: "utf-8",
      }
    );

    // Git may output warnings to stderr even on success
    if (stderr && !stdout) {
      throw new GitError(`Git log failed: ${stderr}`, 1, stderr);
    }

    const history = parseFileHistoryOutput(stdout, filePath);

    // Cache the result (TASK-051)
    cacheFileHistory(repoPath, filePath, history);

    return history;
  } catch (error) {
    if (error instanceof GitError) {
      throw error;
    }

    const execError = error as { code?: number; stderr?: string; message?: string };

    if (execError.stderr?.includes("fatal: no such path")) {
      throw new GitError(`File not found: ${filePath}`, 128, execError.stderr);
    }

    if (execError.stderr?.includes("fatal: not a git repository")) {
      throw new GitError(
        `Not a git repository: ${repoPath}`,
        128,
        execError.stderr
      );
    }

    throw new GitError(
      execError.message || "Failed to get file history",
      execError.code,
      execError.stderr
    );
  }
}

/**
 * Gets the previous filename if the file was renamed, for use in blame responses.
 *
 * TASK-052: Add rename detection to blame response
 * Returns the most recent previous name if the file has been renamed.
 *
 * @param repoPath - Absolute path to the git repository
 * @param filePath - Current path to the file
 * @returns Promise resolving to the previous filename, or undefined if never renamed
 */
export async function getPreviousFilename(
  repoPath: string,
  filePath: string
): Promise<string | undefined> {
  try {
    const history = await getFileHistory(repoPath, filePath);

    // Return the most recent previous name (first rename in the list)
    if (history.renames.length > 0) {
      return history.renames[0].fromPath;
    }

    return undefined;
  } catch {
    // If we can't get history, just return undefined
    return undefined;
  }
}
