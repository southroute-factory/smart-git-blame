import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
      currentFinalLine = parseInt(commitMatch[3], 10);

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

      lines.push({
        lineNumber: currentFinalLine,
        content,
        sha: currentSha,
        author: currentAuthor,
        authorEmail: currentAuthorEmail,
        timestamp: currentTimestamp,
      });
      continue;
    }

    // Skip other metadata lines (committer, summary, previous, boundary, etc.)
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
    const { stdout, stderr } = await execAsync(
      `git blame --porcelain -- "${filePath}"`,
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
