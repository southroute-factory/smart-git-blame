import { z } from "zod";
import { promises as fs } from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Pattern to detect dangerous characters that could enable command injection.
 * These characters are not allowed in repo or file paths.
 */
const DANGEROUS_CHARS_PATTERN = /[;&|`$(){}[\]<>\\'"!#*?~]/;

/**
 * Zod schema for validating repository paths.
 * - Must be a non-empty string
 * - Must be an absolute path (starts with /)
 * - Must not contain dangerous characters
 */
export const repoPathSchema = z
  .string()
  .min(1, "Repository path is required")
  .refine((path) => path.startsWith("/"), {
    message: "Repository path must be an absolute path",
  })
  .refine((path) => !DANGEROUS_CHARS_PATTERN.test(path), {
    message: "Repository path contains invalid characters",
  });

/**
 * Zod schema for validating file paths.
 * - Must be a non-empty string
 * - Must not contain dangerous characters
 * - Must not start with / (relative to repo root)
 * - Must not contain path traversal sequences
 */
export const filePathSchema = z
  .string()
  .min(1, "File path is required")
  .refine((path) => !DANGEROUS_CHARS_PATTERN.test(path), {
    message: "File path contains invalid characters",
  })
  .refine((path) => !path.startsWith("/"), {
    message: "File path must be relative to repository root",
  })
  .refine((path) => !path.includes(".."), {
    message: "File path must not contain path traversal sequences",
  });

/**
 * Zod schema for validating blame API query parameters.
 */
export const blameQuerySchema = z.object({
  repo: repoPathSchema,
  file: filePathSchema,
});

/**
 * Type for validated blame query parameters.
 */
export type BlameQueryParams = z.infer<typeof blameQuerySchema>;

/**
 * Error thrown when validation fails.
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: z.ZodIssue[]
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Error thrown when repository validation fails.
 */
export class RepoValidationError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "NOT_A_GIT_REPO"
  ) {
    super(message);
    this.name = "RepoValidationError";
  }
}

/**
 * Error thrown when file validation fails.
 */
export class FileValidationError extends Error {
  constructor(
    message: string,
    public readonly code: "FILE_NOT_FOUND" | "NOT_A_FILE"
  ) {
    super(message);
    this.name = "FileValidationError";
  }
}

/**
 * Validates and parses blame API query parameters using Zod.
 *
 * @param params - URLSearchParams from the request
 * @returns Validated and typed query parameters
 * @throws ValidationError if validation fails
 */
export function validateBlameParams(params: URLSearchParams): BlameQueryParams {
  const repo = params.get("repo");
  const file = params.get("file");

  const result = blameQuerySchema.safeParse({ repo, file });

  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((e: z.ZodIssue) => e.message).join("; "),
      result.error.issues
    );
  }

  return result.data;
}

/**
 * Validates that a repository path exists and is a valid git repository.
 *
 * @param repoPath - Absolute path to the repository
 * @throws RepoValidationError if path doesn't exist or is not a git repo
 */
export async function validateRepoExists(repoPath: string): Promise<void> {
  // Check if path exists
  try {
    const stats = await fs.stat(repoPath);
    if (!stats.isDirectory()) {
      throw new RepoValidationError(
        `Repository path is not a directory: ${repoPath}`,
        "NOT_FOUND"
      );
    }
  } catch (error) {
    if (error instanceof RepoValidationError) {
      throw error;
    }
    // Path doesn't exist
    throw new RepoValidationError(
      `Repository path does not exist: ${repoPath}`,
      "NOT_FOUND"
    );
  }

  // Check if it's a git repository using git rev-parse
  try {
    await execAsync("git rev-parse --is-inside-work-tree", {
      cwd: repoPath,
      encoding: "utf-8",
    });
  } catch {
    throw new RepoValidationError(
      `Not a git repository: ${repoPath}`,
      "NOT_A_GIT_REPO"
    );
  }
}

/**
 * Validates that a file exists in the repository and is tracked by git.
 *
 * @param repoPath - Absolute path to the repository
 * @param filePath - Relative path to the file within the repository
 * @throws FileValidationError if file doesn't exist or is not tracked
 */
export async function validateFileExists(
  repoPath: string,
  filePath: string
): Promise<void> {
  const fullPath = `${repoPath}/${filePath}`;

  // First check if file exists on filesystem
  try {
    const stats = await fs.stat(fullPath);
    if (!stats.isFile()) {
      throw new FileValidationError(
        `Path is not a file: ${filePath}`,
        "NOT_A_FILE"
      );
    }
  } catch (error) {
    if (error instanceof FileValidationError) {
      throw error;
    }
    // File doesn't exist on filesystem
    throw new FileValidationError(
      `File not found: ${filePath}`,
      "FILE_NOT_FOUND"
    );
  }

  // Check if file is tracked by git using git ls-files
  try {
    const { stdout } = await execAsync(`git ls-files -- "${filePath}"`, {
      cwd: repoPath,
      encoding: "utf-8",
    });

    // If the file is tracked, git ls-files will return the filename
    if (!stdout.trim()) {
      throw new FileValidationError(
        `File not tracked by git: ${filePath}`,
        "FILE_NOT_FOUND"
      );
    }
  } catch (error) {
    if (error instanceof FileValidationError) {
      throw error;
    }
    // git ls-files failed - treat as file not found
    throw new FileValidationError(
      `Unable to verify file in repository: ${filePath}`,
      "FILE_NOT_FOUND"
    );
  }
}
