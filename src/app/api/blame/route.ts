import { NextRequest, NextResponse } from "next/server";
import { execGitBlame, GitBlameResult, GitError } from "@/lib/git";
import {
  validateBlameParams,
  validateRepoExists,
  ValidationError,
  RepoValidationError,
} from "@/lib/validation";

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GitBlameResult | ErrorResponse>> {
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
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Invalid request parameters" },
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
        { error: error.message },
        { status }
      );
    }
    return NextResponse.json(
      { error: "Repository validation failed" },
      { status: 500 }
    );
  }

  try {
    const result = await execGitBlame(repo, file);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof GitError) {
      // Determine appropriate HTTP status code based on error
      if (error.stderr?.includes("fatal: no such path") || error.message.includes("File not found")) {
        return NextResponse.json(
          { error: `File not found: ${file}` },
          { status: 404 }
        );
      }

      if (error.stderr?.includes("fatal: not a git repository") || error.message.includes("Not a git repository")) {
        return NextResponse.json(
          { error: `Invalid repository: ${repo}` },
          { status: 400 }
        );
      }

      if (error.message.includes("Invalid characters in path")) {
        return NextResponse.json(
          { error: "Invalid characters in path" },
          { status: 400 }
        );
      }

      // Other git errors
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Unexpected errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
