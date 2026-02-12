'use client';

import { useState, FormEvent } from 'react';

interface RepoInputProps {
  onSubmit?: (repoPath: string, filePath: string) => void;
}

export default function RepoInput({ onSubmit }: RepoInputProps) {
  const [repoPath, setRepoPath] = useState('');
  const [filePath, setFilePath] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(repoPath, filePath);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="repo-path"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Repository Path
        </label>
        <input
          id="repo-path"
          type="text"
          value={repoPath}
          onChange={(e) => setRepoPath(e.target.value)}
          placeholder="/path/to/repo"
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="file-path"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          File Path
        </label>
        <input
          id="file-path"
          type="text"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="src/file.ts"
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
        />
      </div>

      <button
        type="submit"
        className="mt-2 h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-400"
      >
        View Blame
      </button>
    </form>
  );
}
