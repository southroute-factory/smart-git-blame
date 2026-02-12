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
 */
function ChangePanelSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="flex gap-4">
        <div className="h-8 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-8 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-8 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
}

/**
 * Error display for the change panel
 */
function ChangePanelError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950"
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch commit details when panel opens and SHA is provided
  useEffect(() => {
    if (!isOpen || !commitSha) {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommitDetails();
  }, [isOpen, commitSha, repo]);

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
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {isLoading && <ChangePanelSkeleton />}

            {error && <ChangePanelError message={error} />}

            {!isLoading && !error && commitDetails && (
              <div className="space-y-6">
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
