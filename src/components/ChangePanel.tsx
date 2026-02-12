'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Commit details from the API
 */
interface CommitDetails {
  sha: string;
  author: string;
  authorEmail: string;
  date: string;
  message: string;
  stats: {
    filesChanged: number;
    insertions: number;
    deletions: number;
  };
}

/**
 * Commit info within a merge
 */
interface MergeCommitInfo {
  sha: string;
  message: string;
  author: string;
}

/**
 * Merge context from the API
 */
interface MergeContext {
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

/**
 * Formats a date as relative time (e.g., "3 days ago")
 */
function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
  } catch {
    return dateStr;
  }
}

/**
 * Props for the ChangePanel component
 */
export interface ChangePanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback to close the panel */
  onClose: () => void;
  /** Commit SHA to display details for */
  commitSha: string | null;
  /** Repository path */
  repo: string;
}

/**
 * Loading skeleton for the change panel
 * Matches the layout of the actual ChangePanel content with pulsing placeholders
 * Uses fade-in animation for smooth appearance (TASK-045)
 */
export function ChangePanelSkeleton() {
  return (
    <div
      className="animate-fade-in animate-pulse space-y-6"
      role="status"
      aria-label="Loading commit details"
    >
      {/* SHA Section */}
      <div>
        <div className="mb-1 h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-64 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-6 w-6 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>

      {/* Author Section */}
      <div>
        <div className="mb-1 h-3 w-14 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-1 h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>

      {/* Date Section */}
      <div>
        <div className="mb-1 h-3 w-10 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-1 h-3 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>

      {/* Message Section */}
      <div>
        <div className="mb-2 h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-4/5 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-3/5 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>

      {/* Changes Stats Section */}
      <div>
        <div className="mb-2 h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex flex-wrap gap-3">
          {/* Files changed */}
          <div className="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
            <div className="mb-1 h-3 w-10 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-6 w-6 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          {/* Additions */}
          <div className="rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950">
            <div className="mb-1 h-3 w-16 rounded bg-green-200 dark:bg-green-800" />
            <div className="h-6 w-8 rounded bg-green-200 dark:bg-green-800" />
          </div>
          {/* Deletions */}
          <div className="rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950">
            <div className="mb-1 h-3 w-16 rounded bg-red-200 dark:bg-red-800" />
            <div className="h-6 w-8 rounded bg-red-200 dark:bg-red-800" />
          </div>
        </div>
      </div>

      {/* Merge Context Section */}
      <div>
        <div className="mb-2 h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-10 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading commit details...</span>
    </div>
  );
}

/**
 * Error display for the change panel
 * Includes fade animation for smooth appearance (TASK-045)
 */
function ChangePanelError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="animate-fade-in flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950"
    >
      <svg
        className="h-6 w-6 text-red-500"
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
 * Formats a date string for display
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * CopyButton component for copying text to clipboard
 */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : label}
      title={copied ? 'Copied!' : label}
      className="ml-2 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
    >
      {copied ? (
        <svg
          className="h-4 w-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
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
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * ChangePanel is a slide-out drawer component that displays commit details.
 * It slides in from the right side of the screen with a dark overlay.
 *
 * Features:
 * - Fetches commit details from the API
 * - Displays SHA, author, date, message, and diff stats
 * - Smooth slide animation
 * - Close via button or ESC key
 * - Accessible with proper ARIA attributes
 */
export default function ChangePanel({
  isOpen,
  onClose,
  commitSha,
  repo,
}: ChangePanelProps) {
  const [commitDetails, setCommitDetails] = useState<CommitDetails | null>(null);
  const [mergeContext, setMergeContext] = useState<MergeContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMergeLoading, setIsMergeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [isMergeCommitsExpanded, setIsMergeCommitsExpanded] = useState(false);
  // Track which SHA we've loaded to avoid redundant fetches and detect switching
  const [loadedSha, setLoadedSha] = useState<string | null>(null);

  // Determine if we're switching to a different commit (show loading overlay)
  const isSwitchingCommit = isOpen && commitSha && loadedSha && commitSha !== loadedSha && isLoading;

  // Fetch commit details and merge context when panel opens and SHA is provided
  useEffect(() => {
    if (!isOpen || !commitSha) {
      return;
    }

    // Skip fetch if we already have details for this exact commit
    if (commitDetails && commitSha === loadedSha && !error) {
      return;
    }

    const fetchCommitDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ repo, sha: commitSha });
        const response = await fetch(`/api/commit?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch commit: ${response.status}`);
        }

        const data: CommitDetails = await response.json();
        setCommitDetails(data);
        setLoadedSha(commitSha);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setLoadedSha(null);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMergeContext = async () => {
      setIsMergeLoading(true);
      setMergeError(null);
      setIsMergeCommitsExpanded(false);

      try {
        const params = new URLSearchParams({ repo, sha: commitSha });
        const response = await fetch(`/api/merge?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch merge context: ${response.status}`);
        }

        const data: MergeContext = await response.json();
        setMergeContext(data);
      } catch (err) {
        setMergeError(err instanceof Error ? err.message : 'Failed to load merge context');
      } finally {
        setIsMergeLoading(false);
      }
    };

    fetchCommitDetails();
    fetchMergeContext();
  }, [isOpen, commitSha, repo, loadedSha, commitDetails, error]);

  // Reset state when panel closes to ensure fresh state on next open
  useEffect(() => {
    if (!isOpen) {
      // Delay reset to allow close animation to complete
      const timeout = setTimeout(() => {
        setCommitDetails(null);
        setLoadedSha(null);
        setError(null);
        setMergeContext(null);
        setMergeError(null);
        setIsMergeCommitsExpanded(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click to close
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}
        `}
        onClick={handleOverlayClick}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Commit details"
        aria-hidden={!isOpen}
        className={`
          fixed right-0 top-0 z-50 h-full w-[400px] max-w-full
          bg-white shadow-2xl dark:bg-zinc-900
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Commit Details
            </h2>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          {/* Content */}
          <div className="relative flex-1 overflow-y-auto px-6 py-6">
            {/* Loading overlay when switching commits (shows over existing content) */}
            {isSwitchingCommit && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity dark:bg-zinc-900/80"
                aria-label="Loading new commit details"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="h-6 w-6 animate-spin text-zinc-500"
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
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Switching commit...</span>
                </div>
              </div>
            )}

            {/* Initial loading skeleton (no existing content) */}
            {isLoading && !commitDetails && <ChangePanelSkeleton />}

            {error && <ChangePanelError message={error} />}

            {!error && commitDetails && (
              <div className="animate-slide-in-up space-y-6">
                {/* SHA - Full, copyable */}
                <div>
                  <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Commit SHA
                  </h3>
                  <div className="flex items-center">
                    <code
                      className="inline-block break-all rounded bg-zinc-100 px-2 py-1 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                      title="Full commit SHA"
                    >
                      {commitDetails.sha}
                    </code>
                    <CopyButton text={commitDetails.sha} label="Copy SHA" />
                  </div>
                </div>

                {/* Author */}
                <div>
                  <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Author
                  </h3>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">
                    {commitDetails.author}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {commitDetails.authorEmail}
                  </p>
                </div>

                {/* Date - Relative + absolute */}
                <div>
                  <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Date
                  </h3>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">
                    {formatRelativeDate(commitDetails.date)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(commitDetails.date)}
                  </p>
                </div>

                {/* Message */}
                <div>
                  <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Message
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {commitDetails.message || '(No message)'}
                  </p>
                </div>

                {/* Diff Stats */}
                <div>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Changes
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Files</p>
                      <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                        {commitDetails.stats.filesChanged}
                      </p>
                    </div>
                    <div className="rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950">
                      <p className="text-xs text-green-600 dark:text-green-400">Additions</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                        +{commitDetails.stats.insertions}
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950">
                      <p className="text-xs text-red-600 dark:text-red-400">Deletions</p>
                      <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                        -{commitDetails.stats.deletions}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Merge Context */}
                <div>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Merge Context
                  </h3>
                  {isMergeLoading && (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                  )}
                  {mergeError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{mergeError}</p>
                  )}
                  {!isMergeLoading && !mergeError && mergeContext && (
                    <div className="space-y-3">
                      {mergeContext.isDirectCommit && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <svg
                              className="mr-1 h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Direct commit
                          </span>
                        </div>
                      )}
                      {!mergeContext.isDirectCommit && mergeContext.mergeCommit && (
                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950">
                          <div className="mb-2 flex items-center gap-2">
                            <svg
                              className="h-4 w-4 text-purple-600 dark:text-purple-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                              Part of merge: {mergeContext.mergeCommit.sha.slice(0, 7)}
                            </span>
                            <CopyButton text={mergeContext.mergeCommit.sha} label="Copy merge SHA" />
                          </div>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            {mergeContext.mergeCommit.message.split('\n')[0]}
                          </p>
                        </div>
                      )}
                      {!mergeContext.isDirectCommit && mergeContext.commitsInMerge && mergeContext.commitsInMerge.length > 0 && (
                        <div>
                          <button
                            onClick={() => setIsMergeCommitsExpanded(!isMergeCommitsExpanded)}
                            className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-750"
                            aria-expanded={isMergeCommitsExpanded}
                            aria-controls="merge-commits-list"
                          >
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                              Commits in merge ({mergeContext.commitsInMerge.length})
                            </span>
                            <svg
                              className={`h-4 w-4 text-zinc-500 transition-transform dark:text-zinc-400 ${
                                isMergeCommitsExpanded ? 'rotate-180' : ''
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
                          {isMergeCommitsExpanded && (
                            <ul
                              id="merge-commits-list"
                              className="mt-2 space-y-2"
                              role="list"
                              aria-label="Commits included in merge"
                            >
                              {mergeContext.commitsInMerge.map((commit) => (
                                <li
                                  key={commit.sha}
                                  className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
                                >
                                  <div className="flex items-center gap-2">
                                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                                      {commit.sha.slice(0, 7)}
                                    </code>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                      by {commit.author}
                                    </span>
                                  </div>
                                  <p className="mt-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
                                    {commit.message.split('\n')[0]}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !error && !commitDetails && commitSha && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No commit details available.
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
