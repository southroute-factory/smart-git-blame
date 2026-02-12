import { NextRequest, NextResponse } from "next/server";
import { execGitShow, CommitDetails, GitError } from "@/lib/git";

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<CommitDetails | ErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const repo = searchParams.get("repo");
  const sha = searchParams.get("sha");

  // Validate required query parameters
  if (!repo || !sha) {
    const missingParams: string[] = [];
    if (!repo) missingParams.push("repo");
    if (!sha) missingParams.push("sha");

    return NextResponse.json(
      { error: `Missing required query parameters: ${missingParams.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const result = await execGitShow(repo, sha);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof GitError) {
      // Determine appropriate HTTP status code based on error
      if (error.stderr?.includes("fatal: bad object") || error.message.includes("Commit not found")) {
        return NextResponse.json(
          { error: `Commit not found: ${sha}` },
          { status: 404 }
        );
      }

      if (error.stderr?.includes("fatal: not a git repository") || error.message.includes("Not a git repository")) {
        return NextResponse.json(
          { error: `Invalid repository: ${repo}` },
          { status: 400 }
        );
      }

      if (error.message.includes("Invalid characters")) {
        return NextResponse.json(
          { error: "Invalid characters in path" },
          { status: 400 }
        );
      }

      if (error.message.includes("Invalid commit SHA")) {
        return NextResponse.json(
          { error: "Invalid commit SHA format" },
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
