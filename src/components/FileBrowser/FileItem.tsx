'use client';

import { memo, useCallback } from 'react';
import type { FileItemProps } from './types';
import { 
  FolderIcon, 
  GitRepoIcon, 
  ChevronRightIcon,
  FileTypeIcon,
} from './FileIcons';

/**
 * TASK-118: File item component
 * Format file size to human readable format
 */
function formatFileSize(bytes?: number): string {
  if (bytes === undefined) return '';
  
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  
  return `${size} ${units[i]}`;
}

/**
 * TASK-118: File item component
 * Displays a single file or directory entry with appropriate icons and actions
 * 
 * Features:
 * - Different icons for files, folders, and git repos
 * - File size display
 * - Keyboard accessible (Tab, Enter, Space)
 * - Focus and selection states
 */
export const FileItem = memo(function FileItem({
  entry,
  isFocused = false,
  isSelected = false,
  onClick,
  onExpand,
  tabIndex = 0,
  itemRef,
}: FileItemProps) {
  const isDirectory = entry.type === 'directory';
  const isGitRepo = entry.isGitRepo === true;

  const handleClick = useCallback(() => {
    onClick(entry);
  }, [onClick, entry]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(entry);
    } else if (e.key === 'ArrowRight' && isDirectory && onExpand) {
      e.preventDefault();
      onExpand(entry);
    }
  }, [onClick, onExpand, entry, isDirectory]);

  return (
    <button
      ref={itemRef}
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-md text-left
        transition-colors duration-100
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
        ${isFocused 
          ? 'bg-blue-100 dark:bg-blue-900/40' 
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }
        ${isSelected
          ? 'bg-blue-200 dark:bg-blue-800/50'
          : ''
        }
      `}
      role="option"
      aria-selected={isSelected}
      aria-label={`${isDirectory ? 'Directory' : 'File'}: ${entry.name}${
        entry.size !== undefined ? `, ${formatFileSize(entry.size)}` : ''
      }`}
    >
      {/* Expand indicator for directories */}
      {isDirectory ? (
        <ChevronRightIcon 
          className="text-zinc-400 dark:text-zinc-500" 
          aria-hidden={true}
        />
      ) : (
        // Spacer for files to align with directories
        <span className="w-3" aria-hidden="true" />
      )}

      {/* Icon */}
      {isGitRepo ? (
        <GitRepoIcon aria-hidden={true} />
      ) : isDirectory ? (
        <FolderIcon className="text-amber-500" aria-hidden={true} />
      ) : (
        <FileTypeIcon filename={entry.name} />
      )}

      {/* Name */}
      <span className="flex-1 truncate text-sm text-zinc-900 dark:text-zinc-100">
        {entry.name}
      </span>

      {/* Git repo badge */}
      {isGitRepo && (
        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
          Git
        </span>
      )}

      {/* File size */}
      {!isDirectory && entry.size !== undefined && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
          {formatFileSize(entry.size)}
        </span>
      )}

      {/* Directory indicator */}
      {isDirectory && !isGitRepo && (
        <ChevronRightIcon 
          className="text-zinc-300 dark:text-zinc-600" 
          aria-hidden={true}
        />
      )}
    </button>
  );
});

export default FileItem;
