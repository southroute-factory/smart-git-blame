'use client';

import { useRouter } from 'next/navigation';
import RepoInput from '@/components/RepoInput';

export default function Home() {
  const router = useRouter();

  const handleSubmit = (repoPath: string, filePath: string) => {
    const params = new URLSearchParams({
      repo: repoPath,
      file: filePath,
    });
    router.push(`/blame?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-16 py-32 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Git Blame Viewer
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Enter a repository path and file path to view blame information.
          </p>
        </div>

        <RepoInput onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
