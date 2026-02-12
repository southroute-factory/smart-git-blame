'use client';

import { memo, useCallback, useRef, useEffect } from 'react';
import type { FileEntry } from './types';
import { FileItem } from './FileItem';
import { 
  FileListSkeleton, 
  EmptyDirectoryState, 
  ErrorState 
} from './LoadingStates';

/**
 * TASK-117: Directory tree component
 * Displays a list of files and directories with navigation support
 * 
 * Features:
 * - Fetches from /api/files
 * - Expandable directories (via navigation)
 * - File icons for different types
 * - Keyboard navigation support
 * - Loading and error states
 */
export const DirectoryTree = memo(function DirectoryTree({
  files,
  isLoading,
  error,
  onItemClick,
  onRetry,
  focusedIndex = -1,
  onFocusChange,
}: {
  files: FileEntry[];
  isLoading: boolean;
  error: string | null;
  onItemClick: (entry: FileEntry) => void;
  onRetry?: () => void;
  focusedIndex?: number;
  onFocusChange?: (index: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Focus the item when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < files.length) {
      const item = itemRefs.current.get(focusedIndex);
      if (item) {
        item.focus();
      }
    }
  }, [focusedIndex, files.length]);

  const setItemRef = useCallback((index: number) => (el: HTMLButtonElement | null) => {
    if (el) {
      itemRefs.current.set(index, el);
    } else {
      itemRefs.current.delete(index);
    }
  }, []);

  const handleItemClick = useCallback((entry: FileEntry, index: number) => {
    // Update focus when clicking
    if (onFocusChange) {
      onFocusChange(index);
    }
    onItemClick(entry);
  }, [onItemClick, onFocusChange]);

  // Loading state
  if (isLoading && files.length === 0) {
    return <FileListSkeleton count={8} />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  // Empty state
  if (files.length === 0) {
    return <EmptyDirectoryState />;
  }

  return (
    <div
      ref={listRef}
      className="flex flex-col gap-0.5 p-2 animate-fade-in"
      role="listbox"
      aria-label="Files and directories"
      tabIndex={-1}
    >
      {files.map((entry, index) => (
        <FileItem
          key={entry.path}
          entry={entry}
          isFocused={index === focusedIndex}
          isSelected={false}
          onClick={(e) => handleItemClick(e, index)}
          tabIndex={index === focusedIndex ? 0 : -1}
          itemRef={setItemRef(index)}
        />
      ))}
    </div>
  );
});

export default DirectoryTree;
