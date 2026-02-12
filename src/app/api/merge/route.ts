import { NextRequest, NextResponse } from "next/server";
import { getMergeContext, MergeContext, MergeCommitInfo, GitError } from "@/lib/git";

/**
 * Response type for merge details API
 */
interface MergeDetailsResponse {
  sha: string;
  isMergeCommit: boolean;
  isDirectCommit: boolean;
  mergeCommit?: {
    sha: string;
    message: string;
    date: string;
  };
  commitsInMerge?: MergeCommitInfo[];
}

interface ErrorResponse {
  error: string;
}

/**
 * GET /api/merge
 *
 * Returns merge context information for a commit, including whether it's a
 * merge commit, a direct commit to main, or was merged via a PR.
 *
 * Query Parameters:
 *   - repo: Absolute path to the git repository
 *   - sha: Commit SHA to analyze
 *
 * Response:
 *   - 200: MergeDetailsResponse
 *   - 400: Missing params, invalid repo, or invalid SHA format
 *   - 404: Commit not found
 *   - 500: Internal server error
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<MergeDetailsResponse | ErrorResponse>> {
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
    const context: MergeContext = await getMergeContext(repo, sha);

    // Build the response
    const response: MergeDetailsResponse = {
      sha,
      isMergeCommit: context.isMergeCommit,
      isDirectCommit: context.isDirectCommit,
    };

    if (context.mergeCommit) {
      response.mergeCommit = context.mergeCommit;
    }

    if (context.commitsInMerge) {
      response.commitsInMerge = context.commitsInMerge;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof GitError) {
      // Determine appropriate HTTP status code based on error
      if (
        error.stderr?.includes("fatal: bad object") ||
        error.stderr?.includes("unknown revision") ||
        error.message.includes("Commit not found")
      ) {
        return NextResponse.json(
          { error: `Commit not found: ${sha}` },
          { status: 404 }
        );
      }

      if (
        error.stderr?.includes("fatal: not a git repository") ||
        error.message.includes("Not a git repository")
      ) {
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
