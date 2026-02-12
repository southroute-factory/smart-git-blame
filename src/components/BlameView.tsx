'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { highlightCode, type HighlightResult } from '@/lib/highlighter';

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
}

/**
 * Loading skeleton for the blame view
 */
function BlameViewSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex h-6 border-b border-zinc-200 dark:border-zinc-800"
        >
          <div className="w-32 bg-zinc-100 dark:bg-zinc-900" />
          <div className="flex-1 bg-zinc-50 dark:bg-zinc-950" />
        </div>
      ))}
    </div>
  );
}

/**
 * Error display component
 */
function BlameViewError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950"
    >
      <svg
        className="h-8 w-8 text-red-500"
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
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
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
 * BlameView component displays file content with syntax highlighting
 * and blame information (commit SHA, author) for each line.
 * 
 * Features:
 * - Syntax highlighting based on file extension
 * - Blame gutter showing commit SHA and author
 * - Visual grouping for consecutive lines from the same commit
 * - Clickable lines for interaction
 */
export default function BlameView({ repo, file, onLineClick }: BlameViewProps) {
  const [blameData, setBlameData] = useState<BlameResponse | null>(null);
  const [highlightResult, setHighlightResult] = useState<HighlightResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track which commits are direct commits (not part of a merge)
  const [directCommits, setDirectCommits] = useState<Set<string>>(new Set());

  // Fetch blame data from API
  useEffect(() => {
    const fetchBlameData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ repo, file });
        const response = await fetch(`/api/blame?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch blame data: ${response.status}`);
        }

        const data: BlameResponse = await response.json();
        setBlameData(data);

        // Apply syntax highlighting
        const code = data.lines.map((line) => line.content).join('\n');
        const highlighted = await highlightCode(code, { filename: file });
        setHighlightResult(highlighted);

        // Fetch merge context for unique commits to identify direct commits
        const uniqueShas = [...new Set(data.lines.map((line) => line.sha))];
        const directCommitSet = new Set<string>();
        
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
            }
          })
        );
        
        setDirectCommits(directCommitSet);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlameData();
  }, [repo, file]);

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
    return <BlameViewSkeleton />;
  }

  if (error) {
    return <BlameViewError message={error} />;
  }

  if (!blameData || !highlightResult) {
    return <BlameViewError message="No blame data available" />;
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table
        className="w-full border-collapse font-mono text-sm"
        role="grid"
        aria-label={`Blame view for ${file}`}
      >
        <thead className="sr-only">
          <tr>
            <th scope="col">Type</th>
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
                aria-label={onLineClick ? `Line ${line.lineNumber}, commit ${shortenSha(line.sha)} by ${line.author}${isDirectCommit ? ', direct commit' : ''}` : undefined}
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
