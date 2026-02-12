import { NextRequest, NextResponse } from "next/server";
import {
  listDirectory,
  PathValidationError,
  FilesResponse,
} from "@/lib/files";

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

/**
 * GET /api/files
 *
 * Returns the contents of a directory including files and subdirectories.
 *
 * TASK-109: Create /api/files endpoint
 * TASK-110: List directory contents
 * TASK-111: Git repo detection
 * TASK-112: Security - validate paths
 * TASK-113: Security - block symlinks
 * TASK-114: Cache directory listings
 *
 * Query parameters:
 * - path: Absolute path to the directory to list
 *
 * @returns FilesResponse with directory contents
 *
 * @example
 * GET /api/files?path=/home/user/projects
 *
 * Response:
 * {
 *   "files": [
 *     {
 *       "name": "src",
 *       "type": "directory",
 *       "path": "/home/user/projects/src",
 *       "isGitRepo": false
 *     },
 *     {
 *       "name": "package.json",
 *       "type": "file",
 *       "path": "/home/user/projects/package.json",
 *       "size": 1234
 *     }
 *   ],
 *   "currentPath": "/home/user/projects",
 *   "parentPath": "/home/user",
 *   "isGitRepo": true
 * }
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<FilesResponse | StructuredErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const pathParam = searchParams.get("path");

  // Validate path parameter is provided
  if (!pathParam) {
    return NextResponse.json(
      {
        error: "Directory path is required",
        code: "VALIDATION_ERROR",
        field: "path",
      },
      { status: 400 }
    );
  }

  try {
    const result = await listDirectory(pathParam);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof PathValidationError) {
      // Map error codes to appropriate HTTP status codes
      let status = 400;

      switch (error.code) {
        case "NOT_FOUND":
        case "NOT_A_DIRECTORY":
          status = 404;
          break;
        case "INVALID_PATH":
        case "NOT_ABSOLUTE":
        case "PATH_TRAVERSAL":
        case "DANGEROUS_CHARS":
        case "IS_SYMLINK":
          status = 400;
          break;
      }

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          field: "path",
        },
        { status }
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error in /api/files:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
