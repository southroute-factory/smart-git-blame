import { NextRequest, NextResponse } from "next/server";
import { execGitBlame, GitBlameResult, GitError } from "@/lib/git";

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GitBlameResult | ErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const repo = searchParams.get("repo");
  const file = searchParams.get("file");

  // Validate required query parameters
  if (!repo || !file) {
    const missingParams: string[] = [];
    if (!repo) missingParams.push("repo");
    if (!file) missingParams.push("file");

    return NextResponse.json(
      { error: `Missing required query parameters: ${missingParams.join(", ")}` },
      { status: 400 }
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
