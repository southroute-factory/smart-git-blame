/**
 * LLM integration for code history explanations using Anthropic API.
 *
 * TASK-095: Design prompt template
 * TASK-097: Implement Anthropic client
 * TASK-098: Handle streaming response
 * TASK-101: Response caching
 *
 * This module provides client-side Anthropic API calls for generating
 * concise explanations of code history/lineage.
 */

import type { LineageContext } from "./lineage";
import { formatDateForPrompt, getTimeAgo } from "./lineage";

// ============================================================================
// Types
// ============================================================================

/**
 * Streaming callback for progressive response updates
 */
export type StreamCallback = (chunk: string, done: boolean) => void;

/**
 * Options for LLM explanation requests
 */
export interface ExplanationOptions {
  /** Anthropic API key */
  apiKey: string;
  /** Maximum tokens in response (default: 150) */
  maxTokens?: number;
  /** Model to use (default: claude-3-haiku-20240307) */
  model?: string;
  /** Temperature for response (default: 0.3) */
  temperature?: number;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * Result of an LLM explanation request
 */
export interface ExplanationResult {
  /** The generated explanation text */
  explanation: string;
  /** Whether this result came from cache */
  cached: boolean;
  /** Timestamp when the response was generated/cached */
  timestamp: number;
}

/**
 * Error types for LLM operations
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "API_KEY_MISSING"
      | "API_KEY_INVALID"
      | "RATE_LIMITED"
      | "NETWORK_ERROR"
      | "API_ERROR"
      | "ABORTED",
    public readonly status?: number
  ) {
    super(message);
    this.name = "LLMError";
  }
}

// ============================================================================
// TASK-101: Response Caching
// ============================================================================

/**
 * Cache entry for LLM responses
 */
interface CacheEntry {
  explanation: string;
  timestamp: number;
}

/**
 * In-memory cache for LLM responses.
 * Key format: `${filePath}:${lineNumber}:${sha}`
 */
const responseCache = new Map<string, CacheEntry>();

/**
 * Maximum cache size (entries)
 */
const MAX_CACHE_SIZE = 500;

/**
 * Cache TTL in milliseconds (30 minutes)
 */
const CACHE_TTL_MS = 30 * 60 * 1000;

/**
 * Builds a cache key for LLM response caching.
 *
 * TASK-101: Cache key based on file + line + sha to ensure
 * we don't make repeated API calls for the same context.
 */
export function buildCacheKey(
  filePath: string,
  lineNumber: number,
  sha: string
): string {
  return `${filePath}:${lineNumber}:${sha}`;
}

/**
 * Gets a cached response if available and not expired.
 */
export function getCachedResponse(cacheKey: string): CacheEntry | undefined {
  const entry = responseCache.get(cacheKey);
  if (!entry) {
    return undefined;
  }

  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(cacheKey);
    return undefined;
  }

  return entry;
}

/**
 * Stores a response in the cache.
 */
export function cacheResponse(cacheKey: string, explanation: string): void {
  // Evict oldest entries if cache is full
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) {
      responseCache.delete(oldestKey);
    }
  }

  responseCache.set(cacheKey, {
    explanation,
    timestamp: Date.now(),
  });
}

/**
 * Clears the entire response cache.
 */
export function clearResponseCache(): void {
  responseCache.clear();
}

/**
 * Gets the current cache size.
 */
export function getCacheSize(): number {
  return responseCache.size;
}

// ============================================================================
// TASK-095: Prompt Template
// ============================================================================

/**
 * System prompt for code history explanations.
 * Instructs the model to provide concise, technical summaries.
 */
const SYSTEM_PROMPT = `You are a git history analyst. Given information about a line of code and its history, provide a brief 1-2 sentence explanation of the line's origin and significance.

Focus on:
- Who wrote/modified the code and when
- Whether it was part of a merge or direct commit
- If the code was moved/copied from another file
- Any relevant file rename history

Be concise and technical. Do not include greetings or unnecessary commentary.`;

/**
 * Builds the user prompt from lineage context.
 *
 * TASK-095: Includes file path, line content, blame info,
 * rename history, and cross-file origins.
 */
export function buildExplanationPrompt(context: LineageContext): string {
  const parts: string[] = [];

  // File and line info
  parts.push(`File: ${context.filePath}`);
  parts.push(`Line ${context.blame.lineNumber}: \`${context.blame.content.trim()}\``);
  parts.push("");

  // Blame info
  parts.push("## Blame Information");
  parts.push(`- Commit: ${context.blame.shortSha}`);
  parts.push(`- Author: ${context.blame.author} <${context.blame.authorEmail}>`);
  parts.push(
    `- Date: ${formatDateForPrompt(context.blame.date)} (${getTimeAgo(context.blame.date)})`
  );

  // Line movement within file
  if (context.blame.originalLine !== undefined) {
    parts.push(
      `- Line was moved from line ${context.blame.originalLine} within this file`
    );
  }
  parts.push("");

  // File rename history
  if (context.renames.renameCount > 0) {
    parts.push("## File Rename History");
    parts.push(`This file has been renamed ${context.renames.renameCount} time(s).`);
    if (context.renames.previousPath) {
      parts.push(`Most recent previous name: ${context.renames.previousPath}`);
    }
    // Include up to 3 recent renames
    const recentRenames = context.renames.renames.slice(0, 3);
    for (const rename of recentRenames) {
      parts.push(`- ${rename.from} → ${rename.to} (${formatDateForPrompt(rename.date)})`);
    }
    parts.push("");
  }

  // Cross-file origins
  if (context.crossFile.hasOrigin) {
    parts.push("## Cross-File Origin");
    parts.push(
      `This code was ${context.crossFile.operationType} from: ${context.crossFile.sourceFile}`
    );
    parts.push(`- Detection confidence: ${context.crossFile.confidence}`);
    if (context.crossFile.originalAuthor) {
      parts.push(`- Original author: ${context.crossFile.originalAuthor}`);
    }
    parts.push("");
  }

  // Merge context
  parts.push("## Commit Context");
  if (context.merge.isMergeCommit) {
    parts.push("This commit is itself a merge commit.");
  } else if (context.merge.isDirectCommit) {
    parts.push("This was a direct commit to the main branch (not via PR/merge).");
  } else if (context.merge.mergeCommit) {
    parts.push(`This commit was brought to main via merge: ${context.merge.mergeCommit.shortSha}`);
    parts.push(`Merge message: "${context.merge.mergeCommit.message}"`);
    if (context.merge.commitsInMerge) {
      parts.push(`Total commits in that merge: ${context.merge.commitsInMerge}`);
    }
  } else {
    parts.push("Merge context unknown.");
  }
  parts.push("");

  // Request for explanation
  parts.push("---");
  parts.push(
    "Please provide a 1-2 sentence summary explaining this line's history and origin."
  );

  return parts.join("\n");
}

// ============================================================================
// TASK-097: Anthropic Client
// TASK-098: Streaming Support
// ============================================================================

/**
 * Anthropic API endpoint
 */
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

/**
 * Default model for explanations (fast and cost-effective)
 */
const DEFAULT_MODEL = "claude-3-haiku-20240307";

/**
 * Validates API key format
 */
function validateApiKey(apiKey: string): void {
  if (!apiKey || typeof apiKey !== "string") {
    throw new LLMError("API key is required", "API_KEY_MISSING");
  }
  if (!apiKey.startsWith("sk-ant-")) {
    throw new LLMError(
      "Invalid API key format (must start with sk-ant-)",
      "API_KEY_INVALID"
    );
  }
}

/**
 * Makes a streaming request to Anthropic API.
 *
 * TASK-097: Client-side Anthropic API call
 * TASK-098: Streaming response handling
 *
 * @param prompt - User prompt
 * @param options - Request options
 * @param onChunk - Callback for streaming chunks
 * @returns Complete explanation text
 */
export async function streamExplanation(
  prompt: string,
  options: ExplanationOptions,
  onChunk?: StreamCallback
): Promise<string> {
  validateApiKey(options.apiKey);

  const model = options.model ?? DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? 150;
  const temperature = options.temperature ?? 0.3;

  const requestBody = {
    model,
    max_tokens: maxTokens,
    temperature,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  };

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": options.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(requestBody),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new LLMError("Request was aborted", "ABORTED");
    }
    throw new LLMError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "NETWORK_ERROR"
    );
  }

  // Handle error responses
  if (!response.ok) {
    const status = response.status;
    let errorMessage = `API error (${status})`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }

    if (status === 401) {
      throw new LLMError("Invalid API key", "API_KEY_INVALID", status);
    }
    if (status === 429) {
      throw new LLMError("Rate limited, please try again later", "RATE_LIMITED", status);
    }
    throw new LLMError(errorMessage, "API_ERROR", status);
  }

  // Process streaming response
  if (!response.body) {
    throw new LLMError("No response body", "API_ERROR");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onChunk?.("", true);
        break;
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith("data: ")) {
          continue;
        }

        const data = line.slice(6); // Remove "data: " prefix

        if (data === "[DONE]") {
          onChunk?.("", true);
          continue;
        }

        try {
          const event = JSON.parse(data);

          // Handle content_block_delta events (streaming text)
          if (
            event.type === "content_block_delta" &&
            event.delta?.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullText += text;
            onChunk?.(text, false);
          }

          // Handle errors in stream
          if (event.type === "error") {
            throw new LLMError(
              event.error?.message || "Streaming error",
              "API_ERROR"
            );
          }
        } catch (parseError) {
          // Skip malformed JSON (may be partial data)
          if (parseError instanceof LLMError) {
            throw parseError;
          }
        }
      }
    }
  } catch (error) {
    reader.cancel();
    if (error instanceof LLMError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new LLMError("Request was aborted", "ABORTED");
    }
    throw error;
  }

  return fullText;
}

/**
 * Makes a non-streaming request to Anthropic API.
 *
 * @param prompt - User prompt
 * @param options - Request options
 * @returns Complete explanation text
 */
export async function fetchExplanation(
  prompt: string,
  options: ExplanationOptions
): Promise<string> {
  validateApiKey(options.apiKey);

  const model = options.model ?? DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? 150;
  const temperature = options.temperature ?? 0.3;

  const requestBody = {
    model,
    max_tokens: maxTokens,
    temperature,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": options.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(requestBody),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new LLMError("Request was aborted", "ABORTED");
    }
    throw new LLMError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "NETWORK_ERROR"
    );
  }

  if (!response.ok) {
    const status = response.status;
    let errorMessage = `API error (${status})`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }

    if (status === 401) {
      throw new LLMError("Invalid API key", "API_KEY_INVALID", status);
    }
    if (status === 429) {
      throw new LLMError("Rate limited, please try again later", "RATE_LIMITED", status);
    }
    throw new LLMError(errorMessage, "API_ERROR", status);
  }

  const data = await response.json();
  const content = data.content?.[0];

  if (!content || content.type !== "text") {
    throw new LLMError("Unexpected response format", "API_ERROR");
  }

  return content.text;
}

// ============================================================================
// Main API
// ============================================================================

/**
 * Gets an explanation for a line's history, with caching and optional streaming.
 *
 * TASK-095: Uses designed prompt template
 * TASK-097: Uses Anthropic client
 * TASK-098: Supports streaming
 * TASK-101: Uses response caching
 *
 * @param context - Lineage context for the line
 * @param options - Request options including API key
 * @param onChunk - Optional callback for streaming updates
 * @returns ExplanationResult with explanation and cache status
 *
 * @example
 * ```typescript
 * // Non-streaming with caching
 * const result = await getExplanation(context, { apiKey: 'sk-ant-...' });
 * console.log(result.explanation);
 * console.log('From cache:', result.cached);
 *
 * // Streaming
 * const result = await getExplanation(
 *   context,
 *   { apiKey: 'sk-ant-...' },
 *   (chunk, done) => {
 *     if (!done) {
 *       updateUI(chunk);
 *     }
 *   }
 * );
 * ```
 */
export async function getExplanation(
  context: LineageContext,
  options: ExplanationOptions,
  onChunk?: StreamCallback
): Promise<ExplanationResult> {
  // TASK-101: Check cache first
  const cacheKey = buildCacheKey(
    context.filePath,
    context.blame.lineNumber,
    context.blame.sha
  );

  const cached = getCachedResponse(cacheKey);
  if (cached) {
    // For cached responses, simulate completion callback
    onChunk?.(cached.explanation, false);
    onChunk?.("", true);

    return {
      explanation: cached.explanation,
      cached: true,
      timestamp: cached.timestamp,
    };
  }

  // Build prompt and make request
  const prompt = buildExplanationPrompt(context);

  let explanation: string;
  if (onChunk) {
    // TASK-098: Stream response
    explanation = await streamExplanation(prompt, options, onChunk);
  } else {
    // Non-streaming request
    explanation = await fetchExplanation(prompt, options);
  }

  // TASK-101: Cache the response
  cacheResponse(cacheKey, explanation);

  return {
    explanation,
    cached: false,
    timestamp: Date.now(),
  };
}

/**
 * Prefetches an explanation into the cache without returning it.
 * Useful for preloading expected explanations.
 *
 * @param context - Lineage context
 * @param options - Request options
 */
export async function prefetchExplanation(
  context: LineageContext,
  options: ExplanationOptions
): Promise<void> {
  const cacheKey = buildCacheKey(
    context.filePath,
    context.blame.lineNumber,
    context.blame.sha
  );

  // Skip if already cached
  if (getCachedResponse(cacheKey)) {
    return;
  }

  const prompt = buildExplanationPrompt(context);
  const explanation = await fetchExplanation(prompt, options);
  cacheResponse(cacheKey, explanation);
}
