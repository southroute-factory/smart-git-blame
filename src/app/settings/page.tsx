'use client';

import Link from 'next/link';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useApiKey } from '@/contexts/ApiKeyContext';

export default function SettingsPage() {
  const { apiKey, isLoaded, setApiKey, clearApiKey } = useApiKey();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-2xl flex-col gap-8 px-8 py-16 bg-white dark:bg-black">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Settings
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Configure your application settings
          </p>
        </div>

        {/* API Key Section */}
        <section
          aria-labelledby="api-key-heading"
          className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-col gap-1">
            <h2
              id="api-key-heading"
              className="text-lg font-medium text-black dark:text-zinc-50"
            >
              Anthropic API Key
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Enter your Anthropic API key to enable AI features. Your key is stored
              locally in your browser and is never sent to our servers.
            </p>
          </div>

          <ApiKeyInput
            currentKey={apiKey}
            isLoaded={isLoaded}
            onSave={setApiKey}
            onClear={clearApiKey}
          />

          {/* Security notice */}
          <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Your API key is stored securely in your browser&apos;s local storage.
              It is never transmitted to any server and remains entirely on your device.
            </p>
          </div>
        </section>

        {/* Back link */}
        <Link
          href="/"
          className="self-start text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to Home
        </Link>
      </main>
    </div>
  );
}
