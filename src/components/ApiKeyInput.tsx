'use client';

import { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { validateApiKey, maskApiKey } from '@/contexts/ApiKeyContext';

interface ApiKeyInputProps {
  /** Current API key value (for display as masked) */
  currentKey: string | null;
  /** Whether the context has finished loading */
  isLoaded: boolean;
  /** Callback when a valid key is submitted */
  onSave: (key: string) => { success: boolean; error?: string };
  /** Callback to clear the current key */
  onClear: () => void;
}

/**
 * API Key input component with validation and masking
 * Shows masked current key or input for new key
 */
export default function ApiKeyInput({
  currentKey,
  isLoaded,
  onSave,
  onClear,
}: ApiKeyInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
    setShowSuccess(false);
  }, []);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validation = validateApiKey(inputValue);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid API key');
      return;
    }

    const result = onSave(inputValue);
    if (result.success) {
      setInputValue('');
      setError(null);
      setIsEditing(false);
      setShowSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setError(result.error ?? 'Failed to save API key');
    }
  }, [inputValue, onSave]);

  const handleClear = useCallback(() => {
    onClear();
    setInputValue('');
    setError(null);
    setIsEditing(false);
    setShowSuccess(false);
  }, [onClear]);

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
    setShowSuccess(false);
  }, []);

  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
    setInputValue('');
    setError(null);
  }, []);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  // Has existing key - show masked display
  if (currentKey && !isEditing) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Current API Key
          </label>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 flex-1 items-center rounded-md border border-zinc-300 bg-zinc-100 px-3 font-mono text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              aria-label="Masked API key"
            >
              {maskApiKey(currentKey)}
            </div>
            <button
              type="button"
              onClick={handleStartEditing}
              className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="h-10 rounded-md border border-red-300 bg-white px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Clear
            </button>
          </div>
        </div>
        {showSuccess && (
          <p className="text-sm text-green-600 dark:text-green-400" role="status">
            API key saved successfully
          </p>
        )}
      </div>
    );
  }

  // Input form for new key
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="api-key-input"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Anthropic API Key
        </label>
        <input
          id="api-key-input"
          type="password"
          value={inputValue}
          onChange={handleChange}
          placeholder="sk-ant-..."
          autoComplete="off"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'api-key-error' : 'api-key-hint'}
          className={`h-10 rounded-md border bg-white px-3 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500'
              : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-400'
          }`}
        />
        {error ? (
          <p id="api-key-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : (
          <p id="api-key-hint" className="text-sm text-zinc-500 dark:text-zinc-400">
            Your API key must start with &quot;sk-ant-&quot;
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-400"
        >
          Save API Key
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleCancelEditing}
            className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
