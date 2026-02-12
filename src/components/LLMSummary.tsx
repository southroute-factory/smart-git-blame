'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useApiKey } from '@/contexts/ApiKeyContext';

/**
 * Props for the LLMSummary component
 */
export interface LLMSummaryProps {
  /** Repository path for context */
  repo: string;
  /** File path for context */
  file: string;
  /** Commit SHA to explain */
  commitSha: string;
  /** Commit message for context */
  commitMessage?: string;
  /** Author name for context */
  author?: string;
  /** Commit date for context */
  date?: string;
}

/**
 * Error types for better user feedback
 */
type LLMErrorType = 
  | 'missing_key'
  | 'invalid_key'
  | 'rate_limit'
  | 'network'
  | 'unknown';

/**
 * Error state with type for appropriate messaging
 */
interface LLMError {
  type: LLMErrorType;
  message: string;
}

/**
 * Parses API error responses to determine error type
 */
function parseError(error: unknown): LLMError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Check for rate limiting
    if (message.includes('rate') || message.includes('429') || message.includes('too many')) {
      return {
        type: 'rate_limit',
        message: 'Rate limit exceeded. Please wait a moment before trying again.',
      };
    }
    
    // Check for invalid API key
    if (message.includes('invalid') && (message.includes('key') || message.includes('api'))) {
      return {
        type: 'invalid_key',
        message: 'Your API key appears to be invalid. Please check your settings.',
      };
    }
    
    if (message.includes('401') || message.includes('unauthorized') || message.includes('authentication')) {
      return {
        type: 'invalid_key',
        message: 'Authentication failed. Please verify your API key is correct.',
      };
    }
    
    // Check for network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        type: 'network',
        message: 'Network error. Please check your internet connection and try again.',
      };
    }
    
    // Return the original message for unknown errors
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred. Please try again.',
    };
  }
  
  return {
    type: 'unknown',
    message: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Loading indicator with pulsing animation
 */
function LoadingIndicator() {
  return (
    <div className="flex items-center gap-2" role="status" aria-label="Generating summary">
      <svg
        className="h-4 w-4 animate-spin text-zinc-500"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Generating summary...
      </span>
    </div>
  );
}

/**
 * Missing API key prompt with link to settings
 */
function MissingKeyPrompt() {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950"
      role="alert"
    >
      <div className="flex items-start gap-2">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            API Key Required
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            To use AI-powered summaries, please configure your Anthropic API key in settings.
          </p>
        </div>
      </div>
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 self-start rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Go to Settings
      </Link>
    </div>
  );
}

/**
 * Error display with appropriate messaging based on error type
 */
function ErrorDisplay({ error, onRetry }: { error: LLMError; onRetry: () => void }) {
  const isRetryable = error.type === 'network' || error.type === 'rate_limit';
  
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950"
      role="alert"
    >
      <div className="flex items-start gap-2">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error.type === 'invalid_key' ? 'Invalid API Key' : 
             error.type === 'rate_limit' ? 'Rate Limited' :
             error.type === 'network' ? 'Connection Error' : 'Error'}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            {error.message}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        {isRetryable && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        )}
        
        {error.type === 'invalid_key' && (
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          >
            Check Settings
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Streaming text display with cursor animation
 */
function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-start gap-2">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <div className="flex-1">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            AI Summary
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {text}
            {isStreaming && (
              <span className="inline-block h-4 w-1 animate-pulse bg-zinc-400 dark:bg-zinc-500" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * LLMSummary component provides AI-powered explanations of commit changes.
 * 
 * Features:
 * - "Explain History" button to trigger summary generation (TASK-099)
 * - Loading state with streaming text display (TASK-100)
 * - Handles missing API key with prompt to configure (TASK-102)
 * - Error handling with friendly messages for various error types (TASK-103)
 *
 * @example
 * ```tsx
 * <LLMSummary
 *   repo="/path/to/repo"
 *   file="src/component.tsx"
 *   commitSha="abc123"
 *   commitMessage="Fix bug in component"
 *   author="John Doe"
 *   date="2024-01-15"
 * />
 * ```
 */
export default function LLMSummary({
  repo,
  file,
  commitSha,
  commitMessage,
  author,
  date,
}: LLMSummaryProps) {
  const { apiKey, hasValidKey } = useApiKey();
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<LLMError | null>(null);
  const [showMissingKey, setShowMissingKey] = useState(false);

  const handleExplainHistory = useCallback(async () => {
    // TASK-102: Handle missing API key
    if (!hasValidKey || !apiKey) {
      setShowMissingKey(true);
      return;
    }

    setShowMissingKey(false);
    setError(null);
    setSummary(null);
    setIsLoading(true);
    setIsStreaming(true);

    try {
      // Call the LLM API endpoint
      const response = await fetch('/api/llm/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo,
          file,
          commitSha,
          commitMessage,
          author,
          date,
          apiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body available');
      }

      let accumulatedText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setSummary(accumulatedText);
      }

      setIsStreaming(false);
    } catch (err) {
      // TASK-103: Handle API errors with appropriate messages
      const parsedError = parseError(err);
      setError(parsedError);
      setSummary(null);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [apiKey, hasValidKey, repo, file, commitSha, commitMessage, author, date]);

  const handleRetry = useCallback(() => {
    handleExplainHistory();
  }, [handleExplainHistory]);

  // TASK-102: Show missing key prompt
  if (showMissingKey) {
    return (
      <div className="space-y-3">
        <MissingKeyPrompt />
        <button
          onClick={() => setShowMissingKey(false)}
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          ← Back
        </button>
      </div>
    );
  }

  // TASK-103: Show error state
  if (error) {
    return (
      <div className="space-y-3">
        <ErrorDisplay error={error} onRetry={handleRetry} />
        <button
          onClick={() => setError(null)}
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          ← Dismiss
        </button>
      </div>
    );
  }

  // TASK-100: Show loading/streaming state
  if (isLoading && !summary) {
    return <LoadingIndicator />;
  }

  // Show summary with streaming effect
  if (summary) {
    return <StreamingText text={summary} isStreaming={isStreaming} />;
  }

  // TASK-099: Default state - show "Explain History" button
  return (
    <button
      onClick={handleExplainHistory}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900 dark:hover:border-purple-700"
      aria-label="Generate AI explanation of this commit"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      Explain History
    </button>
  );
}
