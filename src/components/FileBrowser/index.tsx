'use client';

import { memo, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import type { FileBrowserProps, FileEntry } from './types';
import { useFileBrowser } from './useFileBrowser';
import { Breadcrumbs } from './Breadcrumbs';
import { DirectoryTree } from './DirectoryTree';
import { CloseIcon } from './FileIcons';
import { BreadcrumbSkeleton } from './LoadingStates';
import { RecentPaths, useRecentPaths, type RecentPath } from './RecentPaths';
import { SearchFilter, NoSearchResults } from './SearchFilter';

/**
 * TASK-116: Create FileBrowser modal
 * Modal file browser with directory navigation
 * 
 * Features:
 * - Modal overlay with close button
 * - ESC to close (via keyboard navigation)
 * - Full screen on mobile
 * - Directory browsing
 * - File selection
 * - Breadcrumb navigation
 * - Keyboard navigation
 * - Loading states
 */
export const FileBrowser = memo(function FileBrowser({
  isOpen,
  onClose,
  onFileSelect,
  onDirectorySelect,
  initialPath = '/',
  title = 'Browse Files',
  allowDirectorySelection = false,
  fileFilter,
}: FileBrowserProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Recent paths management
  const { recentPaths, addRecentPath, removeRecentPath, clearRecentPaths } = useRecentPaths();

  // Wrap callbacks to track recent paths
  const handleFileSelectWithRecent = useCallback((file: FileEntry) => {
    addRecentPath(file);
    onFileSelect?.(file);
  }, [onFileSelect, addRecentPath]);

  const handleDirectorySelectWithRecent = useCallback((dir: FileEntry) => {
    addRecentPath(dir);
    onDirectorySelect?.(dir);
  }, [onDirectorySelect, addRecentPath]);

  const {
    files,
    currentPath,
    isLoading,
    error,
    isGitRepo,
    focusedIndex,
    navigate,
    handleItemClick,
    selectCurrentDirectory,
    setFocusedIndex,
  } = useFileBrowser({
    initialPath,
    onFileSelect: handleFileSelectWithRecent,
    onDirectorySelect: handleDirectorySelectWithRecent,
    isOpen,
    onClose,
    allowDirectorySelection,
    fileFilter,
  });

  // Handle recent path click
  const handleRecentPathClick = useCallback((recent: RecentPath) => {
    if (recent.type === 'directory') {
      if (allowDirectorySelection && onDirectorySelect) {
        const entry: FileEntry = {
          name: recent.name,
          path: recent.path,
          type: 'directory',
        };
        addRecentPath(entry);
        onDirectorySelect(entry);
      } else {
        navigate(recent.path);
      }
    } else if (onFileSelect) {
      const entry: FileEntry = {
        name: recent.name,
        path: recent.path,
        type: 'file',
      };
      addRecentPath(entry);
      onFileSelect(entry);
    }
  }, [allowDirectorySelection, onDirectorySelect, onFileSelect, navigate, addRecentPath]);

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return files;
    }
    const query = searchQuery.toLowerCase().trim();
    return files.filter((file) => file.name.toLowerCase().includes(query));
  }, [files, searchQuery]);

  // Clear search when navigating
  const handleNavigate = useCallback((path: string) => {
    setSearchQuery('');
    navigate(path);
  }, [navigate]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Handle overlay click (close on backdrop click)
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Trap focus within modal when open
  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal
      modalRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Restore focus
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Handle retry after error
  const handleRetry = useCallback(() => {
    navigate(currentPath);
  }, [navigate, currentPath]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-browser-title"
    >
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        ref={modalRef}
        className="
          relative z-10 flex flex-col
          bg-white dark:bg-zinc-900
          rounded-lg shadow-2xl
          w-full max-w-2xl
          h-[80vh] max-h-[600px]
          mx-4
          sm:mx-auto
          max-sm:fixed max-sm:inset-0 max-sm:m-0 max-sm:rounded-none max-sm:max-h-none max-sm:h-full
          animate-slide-in-up
          focus:outline-none
        "
        tabIndex={-1}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
          <h2 
            id="file-browser-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {title}
          </h2>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Close file browser"
          >
            <CloseIcon aria-hidden={true} />
          </button>
        </header>

        {/* Breadcrumbs and Search */}
        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              {isLoading && files.length === 0 ? (
                <BreadcrumbSkeleton />
              ) : (
                <Breadcrumbs 
                  currentPath={currentPath} 
                  onNavigate={handleNavigate} 
                />
              )}
            </div>
            {/* Search filter - only show when we have files and no error */}
            {!error && files.length > 0 && (
              <div className="w-full sm:w-48 md:w-56">
                <SearchFilter
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter files..."
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        </div>

        {/* Recent paths - show at top of file list area when at initial path and no search */}
        {recentPaths.length > 0 && currentPath === initialPath && !isLoading && !error && !searchQuery && (
          <RecentPaths
            paths={recentPaths}
            onPathClick={handleRecentPathClick}
            onRemovePath={removeRecentPath}
            onClearAll={clearRecentPaths}
            maxItems={5}
          />
        )}

        {/* File list */}
        <div className="flex-1 overflow-y-auto">
          {/* Show no results message when search has no matches */}
          {searchQuery && filteredFiles.length === 0 && !isLoading && !error ? (
            <NoSearchResults query={searchQuery} onClear={clearSearch} />
          ) : (
            <DirectoryTree
              files={filteredFiles}
              isLoading={isLoading}
              error={error}
              onItemClick={handleItemClick}
              onRetry={handleRetry}
              focusedIndex={focusedIndex}
              onFocusChange={setFocusedIndex}
            />
          )}
        </div>

        {/* Footer with actions */}
        <footer className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 flex-shrink-0 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {isGitRepo && (
              <span className="flex items-center gap-1">
                <svg 
                  className="h-3 w-3 text-orange-500" 
                  fill="currentColor" 
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
                </svg>
                Git repository
              </span>
            )}
            <span className="hidden sm:inline">
              {searchQuery ? (
                <>{filteredFiles.length} of {files.length} {files.length === 1 ? 'item' : 'items'}</>
              ) : (
                <>{files.length} {files.length === 1 ? 'item' : 'items'}</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {allowDirectorySelection && (
              <button
                type="button"
                onClick={selectCurrentDirectory}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Select This Folder
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
});

// Re-export types and sub-components for convenience
export type { FileBrowserProps, FileEntry, FilesResponse } from './types';
export { Breadcrumbs } from './Breadcrumbs';
export { DirectoryTree } from './DirectoryTree';
export { FileItem } from './FileItem';
export { 
  FileListSkeleton, 
  LoadingSpinner, 
  BreadcrumbSkeleton,
  EmptyDirectoryState,
  ErrorState,
} from './LoadingStates';
export { 
  FileIcon, 
  FolderIcon, 
  FolderOpenIcon, 
  GitRepoIcon,
  FileTypeIcon,
} from './FileIcons';
export { useFileBrowser } from './useFileBrowser';
export { RecentPaths, useRecentPaths, type RecentPath } from './RecentPaths';
export { SearchFilter, useFileSearch, NoSearchResults } from './SearchFilter';

export default FileBrowser;
