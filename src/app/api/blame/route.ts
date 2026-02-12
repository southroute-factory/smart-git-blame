import { NextRequest, NextResponse } from "next/server";
import { execGitBlame, GitBlameResult, GitError, getPreviousFilename, hasUncommittedChanges, UncommittedChangesResult } from "@/lib/git";
import {
  validateBlameParams,
  validateRepoExists,
  validateFileExists,
  ValidationError,
  RepoValidationError,
  FileValidationError,
} from "@/lib/validation";

/**
 * Extended GitBlameResult with rename detection and uncommitted status.
 * TASK-052: Add rename detection to blame response
 * TASK-072: Add uncommitted changes status to blame response
 */
interface GitBlameResultWithRename extends GitBlameResult {
  /** Previous filename if the file was renamed, undefined otherwise */
  previousFilename?: string;
  /** Uncommitted changes status for the file (TASK-072) */
  uncommittedChanges?: UncommittedChangesResult;
}

/**
 * Structured error response format for API errors.
 * Provides consistent error information for clients.
 */
interface StructuredErrorResponse {
  /** Human-readable error message */
  error: string;
  /** Machine-readable error code */
  code: string;
  /** Optional field name that caused the error */
  field?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GitBlameResultWithRename | StructuredErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;

  // Validate query parameters with Zod
  let repo: string;
  let file: string;

  try {
    const params = validateBlameParams(searchParams);
    repo = params.repo;
    file = params.file;
  } catch (error) {
    if (error instanceof ValidationError) {
      // Extract the field name from the first Zod issue if available
      const firstIssue = error.errors[0];
      const field = firstIssue?.path?.[0]?.toString();
      return NextResponse.json(
        {
          error: error.message,
          code: "VALIDATION_ERROR",
          ...(field && { field }),
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Invalid request parameters", code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  // Validate repository exists and is a git repo
  try {
    await validateRepoExists(repo);
  } catch (error) {
    if (error instanceof RepoValidationError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code, field: "repo" },
        { status }
      );
    }
    return NextResponse.json(
      { error: "Repository validation failed", code: "REPO_VALIDATION_FAILED" },
      { status: 500 }
    );
  }

  // Validate file exists in the repository
  try {
    await validateFileExists(repo, file);
  } catch (error) {
    if (error instanceof FileValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code, field: "file" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "File validation failed", code: "FILE_VALIDATION_FAILED" },
      { status: 500 }
    );
  }

  try {
    const result = await execGitBlame(repo, file);

    // TASK-052: Add rename detection to blame response
    const previousFilename = await getPreviousFilename(repo, file);

    // TASK-072: Add uncommitted changes status to blame response
    const uncommittedChanges = await hasUncommittedChanges(repo, file);

    const response: GitBlameResultWithRename = {
      ...result,
      ...(previousFilename && { previousFilename }),
      uncommittedChanges,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof GitError) {
      // Determine appropriate HTTP status code based on error
      if (error.stderr?.includes("fatal: no such path") || error.message.includes("File not found")) {
        return NextResponse.json(
          { error: `File not found: ${file}`, code: "FILE_NOT_FOUND", field: "file" },
          { status: 404 }
        );
      }

      if (error.stderr?.includes("fatal: not a git repository") || error.message.includes("Not a git repository")) {
        return NextResponse.json(
          { error: `Invalid repository: ${repo}`, code: "NOT_A_GIT_REPO", field: "repo" },
          { status: 400 }
        );
      }

      if (error.message.includes("Invalid characters in path")) {
        return NextResponse.json(
          { error: "Invalid characters in path", code: "INVALID_PATH_CHARS" },
          { status: 400 }
        );
      }

      // Other git errors
      return NextResponse.json(
        { error: error.message, code: "GIT_ERROR" },
        { status: 500 }
      );
    }

    // Unexpected errors
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
