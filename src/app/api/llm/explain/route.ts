import { NextRequest, NextResponse } from "next/server";

/**
 * API route for LLM-powered commit explanation.
 *
 * BUG-006: Create missing /api/llm/explain endpoint
 * TASK-105: Implement streaming response for LLM explanations
 *
 * This endpoint accepts commit context and returns a streaming explanation
 * using the Anthropic API.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Request body for the explain endpoint
 */
interface ExplainRequestBody {
  /** Repository path */
  repo: string;
  /** File path within the repository */
  file: string;
  /** Commit SHA to explain */
  commitSha: string;
  /** Commit message for context */
  commitMessage?: string;
  /** Author name */
  author?: string;
  /** Commit date */
  date?: string;
  /** Anthropic API key from client */
  apiKey: string;
}

/**
 * Error response structure
 */
interface ErrorResponse {
  error: string;
  code: string;
}

// ============================================================================
// Constants
// ============================================================================

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-3-haiku-20240307";
const MAX_TOKENS = 300;
const TEMPERATURE = 0.3;

/**
 * System prompt for commit explanations
 */
const SYSTEM_PROMPT = `You are a git history analyst. Given information about a commit and file, provide a brief 1-2 sentence explanation of what this commit does and why it might be significant.

Focus on:
- What changes were made in this commit
- The purpose or intent behind the changes
- Any relevant context about the author or timing

Be concise and technical. Do not include greetings or unnecessary commentary.`;

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates the API key format
 */
function validateApiKey(apiKey: unknown): apiKey is string {
  if (!apiKey || typeof apiKey !== "string") {
    return false;
  }
  // Anthropic API keys start with "sk-ant-"
  return apiKey.startsWith("sk-ant-");
}

/**
 * Validates required request fields
 */
function validateRequest(body: unknown): body is ExplainRequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }
  const b = body as Record<string, unknown>;
  return (
    typeof b.repo === "string" &&
    typeof b.file === "string" &&
    typeof b.commitSha === "string" &&
    typeof b.apiKey === "string"
  );
}

// ============================================================================
// Prompt Building
// ============================================================================

/**
 * Builds the user prompt from commit context
 */
function buildPrompt(body: ExplainRequestBody): string {
  const parts: string[] = [];

  parts.push(`File: ${body.file}`);
  parts.push(`Commit SHA: ${body.commitSha.slice(0, 7)}`);

  if (body.commitMessage) {
    parts.push(`Commit Message: "${body.commitMessage}"`);
  }

  if (body.author) {
    parts.push(`Author: ${body.author}`);
  }

  if (body.date) {
    parts.push(`Date: ${body.date}`);
  }

  parts.push("");
  parts.push(
    "Please provide a brief 1-2 sentence summary explaining what this commit does and its significance."
  );

  return parts.join("\n");
}

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ErrorResponse> | Response> {
  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  // Validate request structure
  if (!validateRequest(body)) {
    return NextResponse.json(
      {
        error: "Missing required fields: repo, file, commitSha, apiKey",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  // Validate API key format
  if (!validateApiKey(body.apiKey)) {
    return NextResponse.json(
      {
        error: "Invalid API key format (must start with sk-ant-)",
        code: "INVALID_API_KEY",
      },
      { status: 401 }
    );
  }

  // Build prompt
  const prompt = buildPrompt(body);

  // Make streaming request to Anthropic
  const requestBody = {
    model: DEFAULT_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  };

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": body.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        code: "NETWORK_ERROR",
      },
      { status: 502 }
    );
  }

  // Handle Anthropic API errors
  if (!anthropicResponse.ok) {
    const status = anthropicResponse.status;

    // Try to get error details
    let errorMessage = `API error (${status})`;
    try {
      const errorData = await anthropicResponse.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }

    if (status === 401) {
      return NextResponse.json(
        { error: "Invalid API key", code: "INVALID_API_KEY" },
        { status: 401 }
      );
    }

    if (status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: errorMessage, code: "API_ERROR" },
      { status: status >= 500 ? 502 : status }
    );
  }

  // Stream the response to the client
  if (!anthropicResponse.body) {
    return NextResponse.json(
      { error: "No response body from API", code: "NO_RESPONSE_BODY" },
      { status: 502 }
    );
  }

  // Create a transform stream to extract text from SSE events
  const transformStream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      const text = decoder.decode(chunk, { stream: true });

      // Process SSE events line by line
      const lines = text.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) {
          continue;
        }

        const data = line.slice(6); // Remove "data: " prefix

        if (data === "[DONE]") {
          continue;
        }

        try {
          const event = JSON.parse(data);

          // Extract text from content_block_delta events
          if (
            event.type === "content_block_delta" &&
            event.delta?.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        } catch {
          // Skip malformed JSON (may be partial data)
        }
      }
    },
  });

  // Pipe the Anthropic response through our transform stream
  const readableStream = anthropicResponse.body.pipeThrough(transformStream);

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
