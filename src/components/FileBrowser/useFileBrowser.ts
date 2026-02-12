'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { FileEntry, FilesResponse, FilesErrorResponse } from './types';

/**
 * State for the file browser hook
 */
interface FileBrowserState {
  /** Files in the current directory */
  files: FileEntry[];
  /** Current directory path */
  currentPath: string;
  /** Parent directory path */
  parentPath?: string;
  /** Whether current directory is a git repo */
  isGitRepo: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Index of focused item for keyboard navigation */
  focusedIndex: number;
}

/**
 * Options for the file browser hook
 */
interface UseFileBrowserOptions {
  /** Initial directory path */
  initialPath?: string;
  /** Callback when file is selected */
  onFileSelect?: (file: FileEntry) => void;
  /** Callback when directory is selected (for selection mode) */
  onDirectorySelect?: (directory: FileEntry) => void;
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Whether directory selection is allowed */
  allowDirectorySelection?: boolean;
  /** File extensions to filter */
  fileFilter?: string[];
}

/**
 * Custom hook for managing file browser state and actions
 */
export function useFileBrowser({
  initialPath = '/',
  onFileSelect,
  onDirectorySelect,
  isOpen,
  onClose,
  allowDirectorySelection = false,
  fileFilter,
}: UseFileBrowserOptions) {
  const [state, setState] = useState<FileBrowserState>({
    files: [],
    currentPath: initialPath,
    parentPath: undefined,
    isGitRepo: false,
    isLoading: false,
    error: null,
    focusedIndex: -1,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch directory contents from the API
   */
  const fetchDirectory = useCallback(async (path: string) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData: FilesErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to load directory');
      }

      const data: FilesResponse = await response.json();

      // Apply file filter if specified
      let filteredFiles = data.files;
      if (fileFilter && fileFilter.length > 0) {
        filteredFiles = data.files.filter(file => {
          if (file.type === 'directory') return true;
          return fileFilter.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()));
        });
      }

      setState(prev => ({
        ...prev,
        files: filteredFiles,
        currentPath: data.currentPath,
        parentPath: data.parentPath,
        isGitRepo: data.isGitRepo,
        isLoading: false,
        error: null,
        focusedIndex: -1,
      }));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      }));
    }
  }, [fileFilter]);

  /**
   * Navigate to a directory
   */
  const navigate = useCallback((path: string) => {
    fetchDirectory(path);
  }, [fetchDirectory]);

  /**
   * Navigate to parent directory
   */
  const navigateUp = useCallback(() => {
    if (state.parentPath) {
      navigate(state.parentPath);
    }
  }, [state.parentPath, navigate]);

  /**
   * Handle click on a file or directory
   */
  const handleItemClick = useCallback((entry: FileEntry) => {
    if (entry.type === 'directory') {
      navigate(entry.path);
    } else if (onFileSelect) {
      onFileSelect(entry);
    }
  }, [navigate, onFileSelect]);

  /**
   * Handle selection of current directory
   */
  const selectCurrentDirectory = useCallback(() => {
    if (allowDirectorySelection && onDirectorySelect) {
      const currentDirEntry: FileEntry = {
        name: state.currentPath.split('/').pop() || state.currentPath,
        type: 'directory',
        path: state.currentPath,
        isGitRepo: state.isGitRepo,
      };
      onDirectorySelect(currentDirEntry);
    }
  }, [allowDirectorySelection, onDirectorySelect, state.currentPath, state.isGitRepo]);

  /**
   * Handle selecting a directory item
   */
  const handleDirectorySelect = useCallback((entry: FileEntry) => {
    if (allowDirectorySelection && onDirectorySelect) {
      onDirectorySelect(entry);
    }
  }, [allowDirectorySelection, onDirectorySelect]);

  /**
   * Set focused index for keyboard navigation
   */
  const setFocusedIndex = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      focusedIndex: Math.max(-1, Math.min(index, prev.files.length - 1)),
    }));
  }, []);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    const { files, focusedIndex } = state;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(focusedIndex < files.length - 1 ? focusedIndex + 1 : 0);
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(focusedIndex > 0 ? focusedIndex - 1 : files.length - 1);
        break;

      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < files.length) {
          handleItemClick(files[focusedIndex]);
        }
        break;

      case 'ArrowLeft':
      case 'Backspace':
        if (e.key === 'Backspace' && document.activeElement?.tagName === 'INPUT') {
          return; // Don't interfere with input fields
        }
        e.preventDefault();
        navigateUp();
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < files.length) {
          const entry = files[focusedIndex];
          if (entry.type === 'directory') {
            navigate(entry.path);
          }
        }
        break;

      case 'Escape':
        e.preventDefault();
        if (state.parentPath) {
          navigateUp();
        } else {
          onClose();
        }
        break;

      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setFocusedIndex(files.length - 1);
        break;
    }
  }, [isOpen, state, setFocusedIndex, handleItemClick, navigateUp, navigate, onClose]);

  // Fetch initial directory when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDirectory(initialPath);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, initialPath, fetchDirectory]);

  // Add keyboard event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return {
    ...state,
    navigate,
    navigateUp,
    handleItemClick,
    selectCurrentDirectory,
    handleDirectorySelect,
    setFocusedIndex,
  };
}
