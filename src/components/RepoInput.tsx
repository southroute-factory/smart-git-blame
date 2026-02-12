'use client';

import { useState, FormEvent, useCallback } from 'react';

interface RepoInputProps {
  onSubmit?: (repoPath: string, filePath: string) => void;
}

interface ValidationErrors {
  repoPath?: string;
  filePath?: string;
}

/**
 * Characters that are invalid in file paths
 * Includes null bytes and control characters
 */
const INVALID_PATH_CHARS = /[\x00-\x1f\x7f]/;

/**
 * Validates a path string for non-empty and valid characters
 */
function validatePath(value: string, fieldName: string): string | undefined {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return `${fieldName} is required`;
  }
  
  if (INVALID_PATH_CHARS.test(trimmed)) {
    return `${fieldName} contains invalid characters`;
  }
  
  return undefined;
}

/**
 * Validates all form inputs
 */
function validateInputs(repoPath: string, filePath: string): ValidationErrors {
  const errors: ValidationErrors = {};
  
  const repoError = validatePath(repoPath, 'Repository path');
  if (repoError) {
    errors.repoPath = repoError;
  }
  
  const fileError = validatePath(filePath, 'File path');
  if (fileError) {
    errors.filePath = fileError;
  }
  
  return errors;
}

export default function RepoInput({ onSubmit }: RepoInputProps) {
  const [repoPath, setRepoPath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ repoPath: boolean; filePath: boolean }>({
    repoPath: false,
    filePath: false,
  });

  const handleBlur = useCallback((field: 'repoPath' | 'filePath') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ repoPath: true, filePath: true });
    
    // Validate inputs
    const validationErrors = validateInputs(repoPath, filePath);
    setErrors(validationErrors);
    
    // Prevent submission if there are errors
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    onSubmit?.(repoPath.trim(), filePath.trim());
  };

  const repoPathError = touched.repoPath ? errors.repoPath : undefined;
  const filePathError = touched.filePath ? errors.filePath : undefined;
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md" noValidate>
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
          onChange={(e) => {
            setRepoPath(e.target.value);
            if (touched.repoPath) {
              const error = validatePath(e.target.value, 'Repository path');
              setErrors((prev) => {
                const next = { ...prev };
                if (error) {
                  next.repoPath = error;
                } else {
                  delete next.repoPath;
                }
                return next;
              });
            }
          }}
          onBlur={() => handleBlur('repoPath')}
          placeholder="/path/to/repo"
          aria-invalid={repoPathError ? 'true' : 'false'}
          aria-describedby={repoPathError ? 'repo-path-error' : undefined}
          className={`h-10 rounded-md border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
            repoPathError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500'
              : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-400'
          }`}
        />
        {repoPathError && (
          <p id="repo-path-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
            {repoPathError}
          </p>
        )}
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
          onChange={(e) => {
            setFilePath(e.target.value);
            if (touched.filePath) {
              const error = validatePath(e.target.value, 'File path');
              setErrors((prev) => {
                const next = { ...prev };
                if (error) {
                  next.filePath = error;
                } else {
                  delete next.filePath;
                }
                return next;
              });
            }
          }}
          onBlur={() => handleBlur('filePath')}
          placeholder="src/file.ts"
          aria-invalid={filePathError ? 'true' : 'false'}
          aria-describedby={filePathError ? 'file-path-error' : undefined}
          className={`h-10 rounded-md border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
            filePathError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500'
              : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-400'
          }`}
        />
        {filePathError && (
          <p id="file-path-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
            {filePathError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={touched.repoPath && touched.filePath && hasErrors}
        className="mt-2 h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-400"
      >
        View Blame
      </button>
    </form>
  );
}
