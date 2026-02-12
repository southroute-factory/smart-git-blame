'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { highlightCode, type HighlightResult } from '@/lib/highlighter';
import { ProgressBar } from '@/components/ProgressIndicator';
import { Tooltip } from '@/components/Tooltip';

/**
 * Line movement information when a line was moved within the file
 */
export interface LineMovement {
  /** Original line number before movement */
  movedFrom: number;
  /** SHA of commit where movement occurred */
  movedInCommit?: string;
  /** Number of lines moved (+/-) */
  delta: number;
}

/**
 * Represents a single line of blame data from the API
 */
export interface BlameLine {
  lineNumber: number;
  content: string;
  sha: string;
  author: string;
  authorEmail: string;
  timestamp: number;
  /** Movement information if line was moved */
  movement?: LineMovement;
}

/**
 * Merge context response for determining if a commit is a direct commit
 */
interface MergeContextResponse {
  sha: string;
  isDirectCommit: boolean;
  isMergeCommit: boolean;
}

/**
 * API response format for blame data
 */
export interface BlameResponse {
  lines: BlameLine[];
  file: string;
  repo: string;
  /** Previous filename if the file was renamed */
  previousFilename?: string;
}

/**
 * Props for the BlameView component
 */
export interface BlameViewProps {
  /** Repository path */
  repo: string;
  /** File path within the repository */
  file: string;
  /** Optional callback when a line is clicked */
  onLineClick?: (line: BlameLine) => void;
  /** Optional callback when previous filename is detected, passes the filename */
  onPreviousFilename?: (filename: string) => void;
}

/**
 * Loading skeleton for the blame view
 * Matches the layout of the actual BlameView table with pulsing placeholder rows
 * Includes fade-in animation for smooth appearance
 */
export function BlameViewSkeleton({ rows = 15 }: { rows?: number }) {
  return (
    <div className="animate-fade-in w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table
        className="w-full border-collapse font-mono text-sm"
        role="grid"
        aria-label="Loading blame view"
        aria-busy="true"
      >
        <thead className="sr-only">
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Movement</th>
            <th scope="col">Commit</th>
            <th scope="col">Author</th>
            <th scope="col">Line</th>
            <th scope="col">Code</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => {
            // Simulate visual grouping - show gutter info every 3-5 lines
            const isGroupStart = i === 0 || i % 4 === 0;
            const isEvenGroup = Math.floor(i / 4) % 2 === 0;
            // Vary code line widths for realistic appearance
            const codeWidth = [60, 75, 45, 90, 55, 80, 40, 70, 85, 50][i % 10];

            return (
              <tr
                key={i}
                className={`
                  animate-pulse
                  ${isEvenGroup ? 'bg-zinc-50 dark:bg-zinc-900/50' : 'bg-white dark:bg-zinc-950'}
                  ${isGroupStart ? 'border-t border-zinc-200 dark:border-zinc-700' : ''}
                `}
              >
                {/* Direct commit indicator skeleton */}
                <td className="w-6 border-r border-zinc-200 px-1 py-0.5 dark:border-zinc-800">
                  {isGroupStart && (
                    <div className="mx-auto h-3.5 w-3.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  )}
                </td>

                {/* Movement indicator skeleton */}
                <td className="w-10 border-r border-zinc-200 px-1 py-0.5 dark:border-zinc-800">
                  {/* Only show movement placeholder occasionally for realistic appearance */}
                  {i % 7 === 2 && (
                    <div className="mx-auto h-3 w-6 rounded bg-zinc-200 dark:bg-zinc-700" />
                  )}
                </td>

                {/* SHA skeleton */}
                <td className="whitespace-nowrap border-r border-zinc-200 px-2 py-0.5 dark:border-zinc-800">
                  {isGroupStart ? (
                    <div className="h-3 w-14 rounded bg-zinc-200 dark:bg-zinc-700" />
                  ) : (
                    <div className="h-3 w-14" />
                  )}
                </td>

                {/* Author skeleton */}
                <td className="whitespace-nowrap border-r border-zinc-200 px-2 py-0.5 dark:border-zinc-800">
                  {isGroupStart ? (
                    <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
                  ) : (
                    <div className="h-3 w-20" />
                  )}
                </td>

                {/* Line number skeleton */}
                <td className="whitespace-nowrap border-r border-zinc-200 px-3 py-0.5 text-right dark:border-zinc-800">
                  <div className="ml-auto h-3 w-6 rounded bg-zinc-100 dark:bg-zinc-800" />
                </td>

                {/* Code content skeleton */}
                <td className="px-4 py-0.5">
                  <div
                    className="h-3 rounded bg-zinc-100 dark:bg-zinc-800"
                    style={{ width: `${codeWidth}%` }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Structured API error with field-specific errors
 */
interface ApiErrorDetails {
  message: string;
  code?: string;
  field?: string;
  status?: number;
}

/**
 * Parse error message and detect error type
 */
function parseErrorType(message: string): 'not_found' | 'validation' | 'server' | 'network' {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('not found') || lowerMessage.includes('does not exist')) {
    return 'not_found';
  }
  if (
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('required') ||
    lowerMessage.includes('must be') ||
    lowerMessage.includes('validation')
  ) {
    return 'validation';
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'network';
  }
  return 'server';
}

/**
 * Error display component with support for structured errors and retry
 */
function BlameViewError({
  error,
  onRetry,
}: {
  error: ApiErrorDetails;
  onRetry?: () => void;
}) {
  const errorType = parseErrorType(error.message);
  const isRetryable = errorType === 'network' || errorType === 'server';

  // Determine styling based on error type
  const styles = {
    not_found: {
      border: 'border-amber-200 dark:border-amber-800',
      bg: 'bg-amber-50 dark:bg-amber-950',
      text: 'text-amber-700 dark:text-amber-300',
      icon: 'text-amber-500',
    },
    validation: {
      border: 'border-orange-200 dark:border-orange-800',
      bg: 'bg-orange-50 dark:bg-orange-950',
      text: 'text-orange-700 dark:text-orange-300',
      icon: 'text-orange-500',
    },
    server: {
      border: 'border-red-200 dark:border-red-800',
      bg: 'bg-red-50 dark:bg-red-950',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-500',
    },
    network: {
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-950',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-500',
    },
  }[errorType];

  const errorTitles = {
    not_found: 'File Not Found',
    validation: 'Invalid Request',
    server: 'Server Error',
    network: 'Connection Error',
  };

  const errorIcons = {
    not_found: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    validation: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    server: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    ),
    network: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
      />
    ),
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`animate-fade-in flex flex-col items-center gap-4 rounded-lg border ${styles.border} ${styles.bg} p-8 text-center transition-all duration-300 ease-out`}
    >
      {/* Icon */}
      <svg
        className={`h-10 w-10 ${styles.icon}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {errorIcons[errorType]}
      </svg>

      {/* Title */}
      <h3 className={`text-lg font-semibold ${styles.text}`}>
        {errorTitles[errorType]}
      </h3>

      {/* Message */}
      <p className={`max-w-md text-sm ${styles.text}`}>
        {error.message}
      </p>

      {/* Field-specific error if available */}
      {error.field && (
        <p className={`text-xs ${styles.text} opacity-80`}>
          Field: <span className="font-medium">{error.field}</span>
        </p>
      )}

      {/* Retry button for retryable errors */}
      {isRetryable && onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * Shortens a SHA to the first 7 characters
 */
function shortenSha(sha: string): string {
  return sha.slice(0, 7);
}

/**
 * Props for the LineMovementIndicator component
 */
interface LineMovementIndicatorProps {
  /** Movement information for the line */
  movement?: LineMovement;
  /** Optional callback when navigating to original line */
  onNavigateToOriginal?: (lineNumber: number) => void;
}

/**
 * Tooltip content for line movement information.
 * Displays detailed movement info with accessible, interactive content.
 */
function MovementTooltipContent({
  movement,
  onJumpToOriginal,
}: {
  movement: LineMovement;
  onJumpToOriginal?: () => void;
}) {
  const direction = movement.delta > 0 ? 'down' : 'up';
  const absoluteDelta = Math.abs(movement.delta);

  return (
    <div className="min-w-[160px] space-y-1.5 text-left">
      <p className="font-medium">
        Moved from line {movement.movedFrom}
      </p>
      <p className="text-zinc-300 dark:text-zinc-600">
        {direction === 'down'
          ? `Moved down ${absoluteDelta} line${absoluteDelta !== 1 ? 's' : ''}`
          : `Moved up ${absoluteDelta} line${absoluteDelta !== 1 ? 's' : ''}`}
      </p>
      {movement.movedInCommit && (
        <p className="text-zinc-400 dark:text-zinc-500">
          In commit{' '}
          <code className="rounded bg-zinc-700 px-1 dark:bg-zinc-300">
            {shortenSha(movement.movedInCommit)}
          </code>
        </p>
      )}
      {onJumpToOriginal && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onJumpToOriginal();
          }}
          className="mt-1 text-purple-300 hover:text-purple-200 hover:underline dark:text-purple-600 dark:hover:text-purple-700"
        >
          Jump to original position →
        </button>
      )}
    </div>
  );
}

/**
 * Visual indicator for lines that have been moved within the file.
 * Shows direction (up/down arrow) and delta, with tooltip showing original line number.
 */
function LineMovementIndicator({ movement, onNavigateToOriginal }: LineMovementIndicatorProps) {
  const handleJumpToOriginal = useCallback(() => {
    if (movement) {
      onNavigateToOriginal?.(movement.movedFrom);
    }
  }, [movement, onNavigateToOriginal]);

  if (!movement) return null;

  const direction = movement.delta > 0 ? 'down' : 'up';
  const absoluteDelta = Math.abs(movement.delta);

  const tooltipContent = (
    <MovementTooltipContent
      movement={movement}
      onJumpToOriginal={onNavigateToOriginal ? handleJumpToOriginal : undefined}
    />
  );

  return (
    <Tooltip content={tooltipContent} position="right" delay={300} interactive>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleJumpToOriginal();
        }}
        className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-xs text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
        aria-label={`Line moved ${direction} from line ${movement.movedFrom}, ${absoluteDelta} line${absoluteDelta !== 1 ? 's' : ''} ${direction}. Click to jump to original position.`}
        aria-describedby={`movement-tooltip-${movement.movedFrom}`}
      >
        {direction === 'down' ? (
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        ) : (
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        )}
        <span className="text-[10px] font-medium tabular-nums">
          {absoluteDelta}
        </span>
      </button>
    </Tooltip>
  );
}

/**
 * BlameView component displays file content with syntax highlighting
 * and blame information (commit SHA, author) for each line.
 * 
 * Features:
 * - Syntax highlighting based on file extension
 * - Blame gutter showing commit SHA and author
 * - Visual grouping for consecutive lines from the same commit
 * - Clickable lines for interaction
 */
export default function BlameView({ repo, file, onLineClick, onPreviousFilename }: BlameViewProps) {
  const [blameData, setBlameData] = useState<BlameResponse | null>(null);
  const [highlightResult, setHighlightResult] = useState<HighlightResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiErrorDetails | null>(null);
  // Track which commits are direct commits (not part of a merge)
  const [directCommits, setDirectCommits] = useState<Set<string>>(new Set());
  // Track retry attempts for refetching
  const [retryCount, setRetryCount] = useState(0);
  // Track loading progress for large files (TASK-046)
  const [loadingProgress, setLoadingProgress] = useState<number | undefined>(undefined);
  const [loadingStage, setLoadingStage] = useState<string>('');

  // Fetch blame data from API
  useEffect(() => {
    const fetchBlameData = async () => {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingStage('Fetching blame data...');

      try {
        const params = new URLSearchParams({ repo, file });
        setLoadingProgress(10);
        const response = await fetch(`/api/blame?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `Failed to fetch blame data: ${response.status}`;
          setError({
            message: errorMessage,
            code: errorData.code,
            field: errorData.field,
            status: response.status,
          });
          setIsLoading(false);
          setLoadingProgress(undefined);
          setLoadingStage('');
          return;
        }

        setLoadingProgress(30);
        setLoadingStage('Processing response...');
        const data: BlameResponse = await response.json();
        setBlameData(data);

        // TASK-054: Notify parent of previous filename if present
        if (data.previousFilename && onPreviousFilename) {
          onPreviousFilename(data.previousFilename);
        }

        // Apply syntax highlighting
        setLoadingProgress(50);
        setLoadingStage('Highlighting syntax...');
        const code = data.lines.map((line) => line.content).join('\n');
        const highlighted = await highlightCode(code, { filename: file });
        setHighlightResult(highlighted);

        // Fetch merge context for unique commits to identify direct commits
        setLoadingProgress(70);
        setLoadingStage('Loading commit context...');
        const uniqueShas = [...new Set(data.lines.map((line) => line.sha))];
        const directCommitSet = new Set<string>();
        const totalCommits = uniqueShas.length;
        let completedCommits = 0;
        
        // Fetch merge context for each unique commit in parallel
        await Promise.all(
          uniqueShas.map(async (sha) => {
            try {
              const params = new URLSearchParams({ repo, sha });
              const response = await fetch(`/api/merge?${params.toString()}`);
              if (response.ok) {
                const mergeContext: MergeContextResponse = await response.json();
                if (mergeContext.isDirectCommit) {
                  directCommitSet.add(sha);
                }
              }
            } catch {
              // Silently ignore merge context fetch failures for individual commits
            } finally {
              // Update progress as each commit context is fetched
              completedCommits++;
              const commitProgress = 70 + Math.round((completedCommits / totalCommits) * 25);
              setLoadingProgress(commitProgress);
            }
          })
        );
        
        setDirectCommits(directCommitSet);
        setLoadingProgress(100);
        setLoadingStage('Complete');
      } catch (err) {
        setError({
          message: err instanceof Error ? err.message : 'An unexpected error occurred',
          code: 'NETWORK_ERROR',
        });
      } finally {
        setIsLoading(false);
        // Reset progress after a brief delay to allow completion animation
        setTimeout(() => {
          setLoadingProgress(undefined);
          setLoadingStage('');
        }, 300);
      }
    };

    fetchBlameData();
  }, [repo, file, retryCount, onPreviousFilename]);

  // Retry handler for error recovery
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  // Handle line click
  const handleLineClick = useCallback(
    (line: BlameLine) => {
      onLineClick?.(line);
    },
    [onLineClick]
  );

  // Compute visual groupings - determine if a line starts a new commit group
  const lineGroupInfo = useMemo(() => {
    if (!blameData) return new Map<number, { isGroupStart: boolean; groupIndex: number }>();

    const info = new Map<number, { isGroupStart: boolean; groupIndex: number }>();
    let currentSha = '';
    let groupIndex = 0;

    blameData.lines.forEach((line) => {
      const isGroupStart = line.sha !== currentSha;
      if (isGroupStart) {
        groupIndex++;
        currentSha = line.sha;
      }
      info.set(line.lineNumber, { isGroupStart, groupIndex });
    });

    return info;
  }, [blameData]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {/* Progress indicator for large file loading (TASK-046) */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar progress={loadingProgress} />
          </div>
          {loadingStage && (
            <span className="animate-fade-in text-xs text-zinc-500 dark:text-zinc-400">
              {loadingStage}
            </span>
          )}
        </div>
        <BlameViewSkeleton />
      </div>
    );
  }

  if (error) {
    return <BlameViewError error={error} onRetry={handleRetry} />;
  }

  if (!blameData || !highlightResult) {
    return <BlameViewError error={{ message: 'No blame data available' }} />;
  }

  return (
    <div className="animate-fade-in w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table
        className="w-full border-collapse font-mono text-sm"
        role="grid"
        aria-label={`Blame view for ${file}`}
      >
        <thead className="sr-only">
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Movement</th>
            <th scope="col">Commit</th>
            <th scope="col">Author</th>
            <th scope="col">Line</th>
            <th scope="col">Code</th>
          </tr>
        </thead>
        <tbody>
          {blameData.lines.map((line, index) => {
            const groupInfo = lineGroupInfo.get(line.lineNumber);
            const isEvenGroup = groupInfo ? groupInfo.groupIndex % 2 === 0 : false;
            const isGroupStart = groupInfo?.isGroupStart ?? false;
            const highlightedLine = highlightResult.lines[index];
            const isDirectCommit = directCommits.has(line.sha);

            return (
              <tr
                key={line.lineNumber}
                onClick={() => handleLineClick(line)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLineClick(line);
                  }
                }}
                tabIndex={onLineClick ? 0 : undefined}
                role={onLineClick ? 'button' : undefined}
                aria-label={onLineClick ? `Line ${line.lineNumber}, commit ${shortenSha(line.sha)} by ${line.author}${isDirectCommit ? ', direct commit' : ''}${line.movement ? `, moved from line ${line.movement.movedFrom}` : ''}` : undefined}
                className={`
                  group
                  ${isEvenGroup ? 'bg-zinc-50 dark:bg-zinc-900/50' : 'bg-white dark:bg-zinc-950'}
                  ${isGroupStart ? 'border-t border-zinc-200 dark:border-zinc-700' : ''}
                  ${onLineClick ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800' : ''}
                  transition-colors
                `}
              >
                {/* Direct commit indicator */}
                <td
                  className={`
                    w-6 border-r border-zinc-200 px-1 py-0.5 text-center
                    dark:border-zinc-800
                    ${isGroupStart ? '' : 'opacity-0'}
                  `}
                  aria-hidden={!isGroupStart}
                >
                  {isDirectCommit ? (
                    <span
                      title="Direct commit"
                      className="inline-flex items-center justify-center"
                    >
                      <svg
                        className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-label="Direct commit"
                        role="img"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span
                      title="Part of merge"
                      className="inline-flex items-center justify-center"
                    >
                      <svg
                        className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-label="Part of merge"
                        role="img"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </span>
                  )}
                </td>

                {/* Line movement indicator */}
                <td className="w-10 border-r border-zinc-200 px-1 py-0.5 text-center dark:border-zinc-800">
                  <LineMovementIndicator movement={line.movement} />
                </td>

                {/* Blame gutter: SHA */}
                <td
                  className={`
                    whitespace-nowrap border-r border-zinc-200 px-2 py-0.5 text-xs
                    dark:border-zinc-800
                    ${isGroupStart ? 'text-zinc-700 dark:text-zinc-300' : 'text-transparent'}
                  `}
                  aria-hidden={!isGroupStart}
                >
                  <span
                    className="inline-block w-16 truncate"
                    title={line.sha}
                  >
                    {shortenSha(line.sha)}
                  </span>
                </td>

                {/* Blame gutter: Author */}
                <td
                  className={`
                    whitespace-nowrap border-r border-zinc-200 px-2 py-0.5 text-xs
                    dark:border-zinc-800
                    ${isGroupStart ? 'text-zinc-600 dark:text-zinc-400' : 'text-transparent'}
                  `}
                  aria-hidden={!isGroupStart}
                >
                  <span
                    className="inline-block w-24 truncate"
                    title={`${line.author} <${line.authorEmail}>`}
                  >
                    {line.author}
                  </span>
                </td>

                {/* Line number */}
                <td
                  className="select-none whitespace-nowrap border-r border-zinc-200 px-3 py-0.5 text-right text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                  aria-label={`Line ${line.lineNumber}`}
                >
                  {line.lineNumber}
                </td>

                {/* Code content */}
                <td className="whitespace-pre px-4 py-0.5">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlightedLine?.html || escapeHtml(line.content),
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Escapes HTML special characters for safe rendering
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
