import { z } from "zod";
import { promises as fs, Stats } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

/**
 * Pattern to detect dangerous characters that could enable command injection.
 * These characters are not allowed in directory paths.
 */
const DANGEROUS_CHARS_PATTERN = /[;&|`$(){}[\]<>\\'"!#*?~]/;

/**
 * Pattern to detect path traversal attempts.
 * Matches sequences like .., or paths that try to escape the directory.
 */
const PATH_TRAVERSAL_PATTERN = /(?:^|[\\/])\.\.(?:[\\/]|$)/;

/**
 * Cache entry with expiration timestamp
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Simple in-memory cache with TTL support for directory listings
 */
class DirectoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;

  constructor(ttlSeconds: number = 30) {
    this.ttlMs = ttlSeconds * 1000;
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
 * Represents a single file or directory entry
 */
export interface FileEntry {
  /** File or directory name */
  name: string;
  /** Type: 'file' or 'directory' */
  type: "file" | "directory";
  /** Absolute path to the file or directory */
  path: string;
  /** Size in bytes (only for files) */
  size?: number;
  /** True if directory is a git repository (only for directories) */
  isGitRepo?: boolean;
}

/**
 * Response structure for directory listing
 */
export interface FilesResponse {
  /** Array of file and directory entries */
  files: FileEntry[];
  /** Current directory path */
  currentPath: string;
  /** Parent directory path (undefined if at root) */
  parentPath?: string;
  /** True if current directory is inside a git repository */
  isGitRepo: boolean;
}

/**
 * Error thrown when path validation fails.
 */
export class PathValidationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_PATH"
      | "NOT_ABSOLUTE"
      | "PATH_TRAVERSAL"
      | "DANGEROUS_CHARS"
      | "NOT_FOUND"
      | "NOT_A_DIRECTORY"
      | "IS_SYMLINK"
  ) {
    super(message);
    this.name = "PathValidationError";
  }
}

/**
 * Zod schema for validating directory paths.
 * - Must be a non-empty string
 * - Must be an absolute path (starts with /)
 * - Must not contain dangerous characters
 * - Must not contain path traversal sequences
 */
export const directoryPathSchema = z
  .string()
  .min(1, "Directory path is required")
  .refine((p) => p.startsWith("/"), {
    message: "Directory path must be an absolute path",
  })
  .refine((p) => !DANGEROUS_CHARS_PATTERN.test(p), {
    message: "Directory path contains invalid characters",
  })
  .refine((p) => !PATH_TRAVERSAL_PATTERN.test(p), {
    message: "Directory path must not contain path traversal sequences",
  });

/**
 * Validates directory path using Zod schema.
 *
 * TASK-112: Security - validate paths
 * - Must be absolute path
 * - No path traversal (../)
 * - No dangerous characters
 *
 * @param dirPath - Directory path to validate
 * @throws PathValidationError if validation fails
 */
export function validateDirectoryPath(dirPath: string): void {
  const result = directoryPathSchema.safeParse(dirPath);

  if (!result.success) {
    const issue = result.error.issues[0];
    let code: PathValidationError["code"] = "INVALID_PATH";

    if (issue.message.includes("absolute")) {
      code = "NOT_ABSOLUTE";
    } else if (issue.message.includes("traversal")) {
      code = "PATH_TRAVERSAL";
    } else if (issue.message.includes("invalid characters")) {
      code = "DANGEROUS_CHARS";
    }

    throw new PathValidationError(issue.message, code);
  }
}

/**
 * Normalizes and validates the resolved path.
 * Ensures the normalized path doesn't escape via symlinks.
 *
 * @param dirPath - Original directory path
 * @returns Normalized absolute path
 * @throws PathValidationError if path normalization reveals traversal
 */
export function normalizePath(dirPath: string): string {
  const normalized = path.normalize(dirPath);

  // Check if normalization changed the path in a suspicious way
  // (e.g., /path/to/dir/../../../etc would normalize to /etc)
  if (PATH_TRAVERSAL_PATTERN.test(normalized)) {
    throw new PathValidationError(
      "Path normalization detected traversal attempt",
      "PATH_TRAVERSAL"
    );
  }

  return normalized;
}

/**
 * Checks if a path is a symlink.
 *
 * TASK-113: Security - block symlinks
 * Don't follow symlinks to prevent escape
 *
 * @param targetPath - Path to check
 * @returns True if path is a symbolic link
 */
export async function isSymlink(targetPath: string): Promise<boolean> {
  try {
    const stats = await fs.lstat(targetPath);
    return stats.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Validates that a directory exists and is accessible.
 *
 * @param dirPath - Absolute path to the directory
 * @throws PathValidationError if directory doesn't exist or is not accessible
 */
export async function validateDirectoryExists(dirPath: string): Promise<void> {
  // TASK-113: Check if path is a symlink first
  if (await isSymlink(dirPath)) {
    throw new PathValidationError(
      `Path is a symbolic link and cannot be accessed: ${dirPath}`,
      "IS_SYMLINK"
    );
  }

  try {
    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      throw new PathValidationError(
        `Path is not a directory: ${dirPath}`,
        "NOT_A_DIRECTORY"
      );
    }
  } catch (error) {
    if (error instanceof PathValidationError) {
      throw error;
    }
    throw new PathValidationError(
      `Directory not found: ${dirPath}`,
      "NOT_FOUND"
    );
  }
}

/**
 * Checks if a directory is inside a git repository.
 *
 * TASK-111: Git repo detection
 * Check if directory is git repo (has .git or git rev-parse works)
 *
 * @param dirPath - Absolute path to the directory
 * @returns True if directory is inside a git repository
 */
export async function isGitRepository(dirPath: string): Promise<boolean> {
  try {
    // Use git rev-parse to check if we're in a git repo
    await execAsync("git rev-parse --is-inside-work-tree", {
      cwd: dirPath,
      encoding: "utf-8",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a specific directory is the root of a git repository.
 * (i.e., contains a .git directory or .git file)
 *
 * @param dirPath - Absolute path to the directory
 * @returns True if directory is a git repository root
 */
export async function isGitRepoRoot(dirPath: string): Promise<boolean> {
  try {
    const gitPath = path.join(dirPath, ".git");
    const stats = await fs.stat(gitPath);
    // .git can be a directory (regular repo) or file (worktree/submodule)
    return stats.isDirectory() || stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Gets file stats without following symlinks.
 *
 * @param filePath - Path to the file
 * @returns File stats or null if file doesn't exist
 */
async function getFileStats(filePath: string): Promise<Stats | null> {
  try {
    return await fs.lstat(filePath);
  } catch {
    return null;
  }
}

/**
 * Creates a FileEntry from a directory entry.
 *
 * TASK-113: Security - block symlinks
 * Symlinks are skipped to prevent escape
 *
 * @param dirPath - Parent directory path
 * @param name - File/directory name
 * @returns FileEntry or null if entry should be skipped (e.g., symlink)
 */
async function createFileEntry(
  dirPath: string,
  name: string
): Promise<FileEntry | null> {
  const fullPath = path.join(dirPath, name);
  const stats = await getFileStats(fullPath);

  if (!stats) {
    return null;
  }

  // TASK-113: Skip symlinks to prevent escape
  if (stats.isSymbolicLink()) {
    return null;
  }

  if (stats.isDirectory()) {
    const entry: FileEntry = {
      name,
      type: "directory",
      path: fullPath,
    };

    // TASK-111: Check if directory is a git repo root
    if (await isGitRepoRoot(fullPath)) {
      entry.isGitRepo = true;
    }

    return entry;
  }

  if (stats.isFile()) {
    return {
      name,
      type: "file",
      path: fullPath,
      size: stats.size,
    };
  }

  // Skip other types (sockets, devices, etc.)
  return null;
}

/**
 * Directory listing cache with 30-second TTL
 * TASK-114: Cache directory listings
 */
const directoryListingCache = new DirectoryCache<FilesResponse>(30);

/**
 * Build cache key for directory listing
 */
export function buildDirectoryCacheKey(dirPath: string): string {
  return `dir:${dirPath}`;
}

/**
 * Get cached directory listing if available
 */
export function getCachedDirectoryListing(
  dirPath: string
): FilesResponse | undefined {
  const key = buildDirectoryCacheKey(dirPath);
  return directoryListingCache.get(key);
}

/**
 * Cache directory listing result
 */
export function cacheDirectoryListing(
  dirPath: string,
  listing: FilesResponse
): void {
  const key = buildDirectoryCacheKey(dirPath);
  directoryListingCache.set(key, listing);
}

/**
 * Clear the directory listing cache
 */
export function clearDirectoryListingCache(): void {
  directoryListingCache.clear();
}

/**
 * Lists the contents of a directory with security checks.
 *
 * TASK-109: Create /api/files endpoint
 * TASK-110: List directory contents
 * TASK-111: Git repo detection
 * TASK-112: Security - validate paths
 * TASK-113: Security - block symlinks
 * TASK-114: Cache directory listings
 *
 * @param dirPath - Absolute path to the directory
 * @returns FilesResponse with directory contents
 * @throws PathValidationError if validation fails
 */
export async function listDirectory(dirPath: string): Promise<FilesResponse> {
  // TASK-112: Validate path security
  validateDirectoryPath(dirPath);

  // Normalize the path
  const normalizedPath = normalizePath(dirPath);

  // TASK-114: Check cache first
  const cached = getCachedDirectoryListing(normalizedPath);
  if (cached) {
    return cached;
  }

  // TASK-113: Check for symlink
  // TASK-112: Validate directory exists
  await validateDirectoryExists(normalizedPath);

  // TASK-110: Read directory contents
  const entries = await fs.readdir(normalizedPath);

  // Build file entries, filtering out symlinks and unreadable files
  const fileEntries: FileEntry[] = [];

  for (const name of entries) {
    const entry = await createFileEntry(normalizedPath, name);
    if (entry) {
      fileEntries.push(entry);
    }
  }

  // Sort: directories first, then files, alphabetically within each group
  fileEntries.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  // TASK-111: Check if current directory is inside a git repo
  const isGitRepo = await isGitRepository(normalizedPath);

  // Calculate parent path (undefined if at root)
  const parentPath =
    normalizedPath === "/" ? undefined : path.dirname(normalizedPath);

  const response: FilesResponse = {
    files: fileEntries,
    currentPath: normalizedPath,
    parentPath,
    isGitRepo,
  };

  // TASK-114: Cache the result
  cacheDirectoryListing(normalizedPath, response);

  return response;
}
