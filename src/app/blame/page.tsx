'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useCallback, useState } from 'react';
import BlameView, { type BlameLine } from '@/components/BlameView';

/**
 * Format a timestamp to a readable date string
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Panel showing selected line information
 */
function SelectedLinePanel({
  line,
  onClose,
}: {
  line: BlameLine;
  onClose: () => void;
}) {
  return (
    <div
      role="region"
      aria-label="Selected line details"
      className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-zinc-200 px-2 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Line {line.lineNumber}
            </span>
            <span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {line.sha.slice(0, 7)}
            </span>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex gap-2">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                Author:
              </span>
              <span className="text-zinc-800 dark:text-zinc-200">
                {line.author}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                &lt;{line.authorEmail}&gt;
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                Date:
              </span>
              <span className="text-zinc-800 dark:text-zinc-200">
                {formatDate(line.timestamp)}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                Content:
              </span>
              <code className="max-w-md truncate rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {line.content || '(empty line)'}
              </code>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close selected line panel"
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function BlameContent() {
  const searchParams = useSearchParams();
  const repo = searchParams.get('repo');
  const file = searchParams.get('file');
  const [selectedLine, setSelectedLine] = useState<BlameLine | null>(null);

  // Handler for line clicks - shows selected line info
  const handleLineClick = useCallback((line: BlameLine) => {
    setSelectedLine(line);
  }, []);

  // Handler to close the selected line panel
  const handleClosePanel = useCallback(() => {
    setSelectedLine(null);
  }, []);

  if (!repo || !file) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
          Missing Parameters
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Repository path and file path are required.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Blame View
        </h1>
        <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Repository:</span>{' '}
            {repo}
          </p>
          <p>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">File:</span>{' '}
            {file}
          </p>
        </div>
      </div>

      {selectedLine && (
        <SelectedLinePanel line={selectedLine} onClose={handleClosePanel} />
      )}

      <BlameView repo={repo} file={file} onLineClick={handleLineClick} />

      <Link
        href="/"
        className="self-start text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

export default function BlamePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-center px-8 py-16 bg-white dark:bg-black">
        <Suspense
          fallback={
            <div className="text-zinc-500 dark:text-zinc-400">Loading...</div>
          }
        >
          <BlameContent />
        </Suspense>
      </main>
    </div>
  );
}
