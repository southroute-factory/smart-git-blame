'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function BlameContent() {
  const searchParams = useSearchParams();
  const repo = searchParams.get('repo');
  const file = searchParams.get('file');

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
    <div className="flex w-full max-w-4xl flex-col gap-6">
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

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">
          BlameView component will be rendered here
        </p>
      </div>

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
