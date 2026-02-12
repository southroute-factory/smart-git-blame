'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Represents a single file rename event
 */
export interface FileRename {
  fromPath: string;
  toPath: string;
  commitSha: string;
  date: string;
}

/**
 * File history response from the API
 */
export interface FileHistoryData {
  currentPath: string;
  renames: FileRename[];
}

/**
 * Props for FileHistory component
 */
export interface FileHistoryProps {
  /** Repository path */
  repo: string;
  /** Current file path */
  file: string;
}

/**
 * Shortens a SHA to the first 7 characters
 */
function shortenSha(sha: string): string {
  return sha.slice(0, 7);
}

/**
 * Formats a date string to a readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Loading skeleton for the file history component
 */
export function FileHistorySkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
}

/**
 * FileHistory component displays the rename history of a file.
 * 
 * TASK-053: Create FileHistory component
 * - Shows file rename history as a collapsible timeline
 * - Fetches from /api/history endpoint
 * - Displays previous file paths with dates and commit info
 */
export default function FileHistory({ repo, file }: FileHistoryProps) {
  const [history, setHistory] = useState<FileHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch file history from API
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ repo, file });
        const response = await fetch(`/api/history?${params.toString()}`);

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError(data.error || `Failed to fetch history: ${response.status}`);
          return;
        }

        const data: FileHistoryData = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch file history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [repo, file]);

  // Toggle expanded state
  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Handle keyboard interaction for accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  if (isLoading) {
    return <FileHistorySkeleton />;
  }

  if (error) {
    return null; // Don't show errors - silently fail for history
  }

  // Don't render if no renames
  if (!history || history.renames.length === 0) {
    return null;
  }

  return (
    <div
      className="animate-fade-in rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      role="region"
      aria-label="File rename history"
    >
      {/* Header / Toggle Button */}
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:hover:bg-zinc-900"
        aria-expanded={isExpanded}
        aria-controls="file-history-content"
      >
        <div className="flex items-center gap-2">
          {/* History icon */}
          <svg
            className="h-4 w-4 text-zinc-500 dark:text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            File History
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {history.renames.length} {history.renames.length === 1 ? 'rename' : 'renames'}
          </span>
        </div>
        {/* Chevron icon */}
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div
          id="file-history-content"
          className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800"
        >
          {/* Timeline */}
          <div className="relative space-y-4 pl-6">
            {/* Current file indicator */}
            <div className="relative">
              {/* Timeline dot - current */}
              <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {history.currentPath}
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  Current
                </span>
              </div>
            </div>

            {/* Rename events - reverse chronological order */}
            {history.renames.map((rename, index) => (
              <div key={`${rename.commitSha}-${index}`} className="relative">
                {/* Timeline line */}
                {index < history.renames.length && (
                  <div
                    className="absolute -left-[14px] -top-4 h-4 w-0.5 bg-zinc-300 dark:bg-zinc-700"
                    aria-hidden="true"
                  />
                )}
                {/* Timeline dot */}
                <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                </div>
                
                <div className="flex flex-col gap-1">
                  {/* Rename indicator */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
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
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                    <span>Renamed</span>
                  </div>
                  
                  {/* Previous path */}
                  <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                    {rename.fromPath}
                  </span>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span
                      className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono dark:bg-zinc-800"
                      title={rename.commitSha}
                    >
                      {shortenSha(rename.commitSha)}
                    </span>
                    <span>{formatDate(rename.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Props for RenameIndicator component
 */
export interface RenameIndicatorProps {
  /** Previous filename before rename */
  previousFilename: string;
  /** Callback when user clicks to view history */
  onViewHistory?: () => void;
}

/**
 * RenameIndicator displays a banner when a file has been renamed.
 * 
 * TASK-054: Add "renamed from" indicator in UI
 * - Shows as a banner above the blame view
 * - Displays the previous filename
 * - Optionally links to view full history
 */
export function RenameIndicator({ previousFilename, onViewHistory }: RenameIndicatorProps) {
  return (
    <div
      className="animate-fade-in flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        {/* Rename icon */}
        <svg
          className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
            File was renamed
          </span>
          <span className="text-xs text-amber-700 dark:text-amber-300">
            Previously: <code className="rounded bg-amber-200/50 px-1 font-mono dark:bg-amber-800/50">{previousFilename}</code>
          </span>
        </div>
      </div>
      
      {onViewHistory && (
        <button
          onClick={onViewHistory}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 dark:text-amber-300 dark:hover:bg-amber-800/50"
        >
          <span>View history</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
