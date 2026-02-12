import { NextRequest, NextResponse } from "next/server";

interface BlameResponse {
  lines: unknown[];
  repo: string;
  file: string;
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<BlameResponse | ErrorResponse>> {
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

  // Return placeholder response
  const response: BlameResponse = {
    lines: [],
    repo,
    file,
  };

  return NextResponse.json(response, { status: 200 });
}
