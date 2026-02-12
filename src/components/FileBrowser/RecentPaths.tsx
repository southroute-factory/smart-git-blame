'use client';

import { memo, useCallback, useState } from 'react';
import type { FileEntry } from './types';
import { FileTypeIcon, FolderIcon } from './FileIcons';

/**
 * TASK-124: Remember recent files
 * 
 * Store and display recent paths for quick access.
 * Uses localStorage for persistence across sessions.
 */

/** Maximum number of recent paths to store */
const MAX_RECENT_PATHS = 10;

/** LocalStorage key for recent paths */
const STORAGE_KEY = 'fileBrowser_recentPaths';

/** Recent path entry with metadata */
export interface RecentPath {
  /** Full path */
  path: string;
  /** Display name (last segment of path) */
  name: string;
  /** Type: 'file' or 'directory' */
  type: 'file' | 'directory';
  /** Timestamp of last access */
  timestamp: number;
}

/**
 * Load recent paths from localStorage
 */
function loadRecentPaths(): RecentPath[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as RecentPath[];
      // Filter out any invalid entries and sort by most recent
      return parsed
        .filter((p) => p.path && p.name && p.type && p.timestamp)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_RECENT_PATHS);
    }
  } catch (error) {
    // If parsing fails, reset storage
    console.warn('Failed to load recent paths from localStorage:', error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  
  return [];
}

/**
 * Custom hook for managing recent paths
 */
export function useRecentPaths() {
  // Initialize state with localStorage data (lazy initialization)
  const [recentPaths, setRecentPaths] = useState<RecentPath[]>(loadRecentPaths);

  /**
   * Add a path to recent paths
   */
  const addRecentPath = useCallback((entry: FileEntry) => {
    setRecentPaths((prev) => {
      // Remove existing entry with same path
      const filtered = prev.filter((p) => p.path !== entry.path);
      
      // Create new entry
      const newEntry: RecentPath = {
        path: entry.path,
        name: entry.name,
        type: entry.type,
        timestamp: Date.now(),
      };
      
      // Add to front and limit size
      const updated = [newEntry, ...filtered].slice(0, MAX_RECENT_PATHS);
      
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save recent paths to localStorage:', error);
      }
      
      return updated;
    });
  }, []);

  /**
   * Remove a path from recent paths
   */
  const removeRecentPath = useCallback((path: string) => {
    setRecentPaths((prev) => {
      const updated = prev.filter((p) => p.path !== path);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to update recent paths in localStorage:', error);
      }
      
      return updated;
    });
  }, []);

  /**
   * Clear all recent paths
   */
  const clearRecentPaths = useCallback(() => {
    setRecentPaths([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear recent paths from localStorage:', error);
    }
  }, []);

  return {
    recentPaths,
    addRecentPath,
    removeRecentPath,
    clearRecentPaths,
  };
}

/**
 * Props for RecentPaths component
 */
export interface RecentPathsProps {
  /** List of recent paths to display */
  paths: RecentPath[];
  /** Callback when a path is clicked */
  onPathClick: (path: RecentPath) => void;
  /** Callback when a path is removed */
  onRemovePath?: (path: string) => void;
  /** Callback to clear all paths */
  onClearAll?: () => void;
  /** Maximum number of items to display (default: 5) */
  maxItems?: number;
}

/**
 * Component to display recent paths for quick access
 */
export const RecentPaths = memo(function RecentPaths({
  paths,
  onPathClick,
  onRemovePath,
  onClearAll,
  maxItems = 5,
}: RecentPathsProps) {
  if (paths.length === 0) {
    return null;
  }

  const displayPaths = paths.slice(0, maxItems);

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30">
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Recent
        </h3>
        {onClearAll && paths.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none focus:underline"
            aria-label="Clear all recent paths"
          >
            Clear
          </button>
        )}
      </div>
      <div className="pb-2">
        {displayPaths.map((path) => (
          <RecentPathItem
            key={path.path}
            path={path}
            onClick={onPathClick}
            onRemove={onRemovePath}
          />
        ))}
      </div>
    </div>
  );
});

/**
 * Individual recent path item
 */
const RecentPathItem = memo(function RecentPathItem({
  path,
  onClick,
  onRemove,
}: {
  path: RecentPath;
  onClick: (path: RecentPath) => void;
  onRemove?: (path: string) => void;
}) {
  const handleClick = useCallback(() => {
    onClick(path);
  }, [onClick, path]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(path.path);
  }, [onRemove, path.path]);

  // Format the path for display (show parent directory)
  const pathParts = path.path.split('/').filter(Boolean);
  const parentPath = pathParts.length > 1 
    ? pathParts.slice(0, -1).join('/') 
    : '/';

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group w-full flex items-center gap-3 px-4 py-1.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800"
      title={path.path}
    >
      <span className="flex-shrink-0 text-zinc-400 dark:text-zinc-500">
        {path.type === 'directory' ? (
          <FolderIcon className="h-4 w-4" />
        ) : (
          <FileTypeIcon filename={path.name} className="h-4 w-4" />
        )}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
          {path.name}
        </span>
        <span className="block text-xs text-zinc-400 dark:text-zinc-500 truncate">
          {parentPath}
        </span>
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all focus:outline-none focus:ring-1 focus:ring-zinc-400"
          aria-label={`Remove ${path.name} from recent paths`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </button>
  );
});

export default RecentPaths;
