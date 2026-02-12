'use client';

import { memo, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { FileEntry } from './types';

/**
 * TASK-125: Search/filter files
 * 
 * Provides a search input to filter files in the current directory by name.
 * Includes clear button and keyboard shortcuts.
 */

interface SearchFilterProps {
  /** Current search query */
  value: string;
  /** Callback when search query changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Optional aria label */
  ariaLabel?: string;
}

/**
 * Search input component for filtering files
 */
export const SearchFilter = memo(function SearchFilter({
  value,
  onChange,
  placeholder = 'Search files...',
  disabled = false,
  ariaLabel = 'Search files',
}: SearchFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  // Handle keyboard shortcut (Cmd/Ctrl + F to focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      {/* Search icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-zinc-400 dark:text-zinc-500"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="
          w-full h-9 pl-10 pr-8
          text-sm text-zinc-900 dark:text-zinc-100
          placeholder:text-zinc-400 dark:placeholder:text-zinc-500
          bg-white dark:bg-zinc-800
          border border-zinc-200 dark:border-zinc-700
          rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
        aria-label={ariaLabel}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          aria-label="Clear search"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
});

/**
 * Custom hook for managing file search/filter state
 */
export function useFileSearch(files: FileEntry[]) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return files;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return files.filter((file) => {
      // Match file name
      const nameMatch = file.name.toLowerCase().includes(query);
      
      // For more flexible search, also match extension without dot
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const extMatch = ext.includes(query);
      
      return nameMatch || extMatch;
    });
  }, [files, searchQuery]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredFiles,
    clearSearch,
    hasActiveSearch: searchQuery.trim().length > 0,
    resultCount: filteredFiles.length,
    totalCount: files.length,
  };
}

/**
 * No results state when search returns empty
 */
export const NoSearchResults = memo(function NoSearchResults({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-12 text-center"
      role="status"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
        No files match &ldquo;{query}&rdquo;
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:underline transition-colors"
      >
        Clear search
      </button>
    </div>
  );
});

export default SearchFilter;
