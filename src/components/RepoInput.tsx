'use client';

import { useState, FormEvent, useCallback } from 'react';
import { FileBrowser } from './FileBrowser';
import type { FileEntry } from './FileBrowser/types';

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
  
  // FileBrowser modal state
  const [isRepoBrowserOpen, setIsRepoBrowserOpen] = useState(false);
  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);

  const handleBlur = useCallback((field: 'repoPath' | 'filePath') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Handle repository selection from FileBrowser
  const handleRepoSelect = useCallback((directory: FileEntry) => {
    setRepoPath(directory.path);
    setIsRepoBrowserOpen(false);
    setTouched((prev) => ({ ...prev, repoPath: true }));
    // Clear any repo path errors
    setErrors((prev) => {
      const next = { ...prev };
      delete next.repoPath;
      return next;
    });
  }, []);

  // Handle file selection from FileBrowser
  const handleFileSelect = useCallback((file: FileEntry) => {
    // Extract relative path from absolute path if we have a repo path
    let relativePath = file.path;
    if (repoPath && file.path.startsWith(repoPath)) {
      relativePath = file.path.slice(repoPath.length);
      // Remove leading slash if present
      if (relativePath.startsWith('/')) {
        relativePath = relativePath.slice(1);
      }
    }
    
    setFilePath(relativePath || file.path);
    setIsFileBrowserOpen(false);
    setTouched((prev) => ({ ...prev, filePath: true }));
    // Clear any file path errors
    setErrors((prev) => {
      const next = { ...prev };
      delete next.filePath;
      return next;
    });
  }, [repoPath]);

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
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md" noValidate>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="repo-path"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Repository Path
          </label>
          <div className="flex gap-2">
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
              className={`flex-1 h-10 rounded-md border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
                repoPathError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500'
                  : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setIsRepoBrowserOpen(true)}
              className="h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors"
              aria-label="Browse for repository"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
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
          <div className="flex gap-2">
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
              className={`flex-1 h-10 rounded-md border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
                filePathError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500'
                  : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setIsFileBrowserOpen(true)}
              className="h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors"
              aria-label="Browse for file"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            </button>
          </div>
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

      {/* Repository Browser Modal */}
      <FileBrowser
        isOpen={isRepoBrowserOpen}
        onClose={() => setIsRepoBrowserOpen(false)}
        onDirectorySelect={handleRepoSelect}
        title="Select Repository"
        allowDirectorySelection={true}
        initialPath="/"
      />

      {/* File Browser Modal */}
      <FileBrowser
        isOpen={isFileBrowserOpen}
        onClose={() => setIsFileBrowserOpen(false)}
        onFileSelect={handleFileSelect}
        title="Select File"
        initialPath={repoPath || '/'}
      />
    </>
  );
}
