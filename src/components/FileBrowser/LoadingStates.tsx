'use client';

import { memo, useMemo } from 'react';
import type { LoadingSkeletonProps } from './types';

/**
 * Pre-defined widths for skeleton items to avoid Math.random() during render
 * This ensures stable, deterministic rendering
 */
const SKELETON_WIDTHS = [62, 78, 45, 55, 71, 48, 66, 52, 74, 58];

/**
 * TASK-121: Loading states
 * Skeleton loading state for file list items
 */
export const FileListSkeleton = memo(function FileListSkeleton({
  count = 8,
}: LoadingSkeletonProps) {
  // Get stable widths for the skeleton items
  const widths = useMemo(() => 
    Array.from({ length: count }, (_, i) => SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]),
    [count]
  );

  return (
    <div 
      className="space-y-1 p-2 animate-fade-in"
      role="status"
      aria-label="Loading directory contents"
      aria-busy={true}
    >
      {widths.map((width, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-md p-2"
        >
          {/* Icon skeleton */}
          <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          
          {/* Name skeleton - varying widths for realistic appearance */}
          <div 
            className="h-4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse"
            style={{ width: `${width}%` }}
          />
          
          {/* Size skeleton (only for some items to simulate files vs directories) */}
          {index % 3 !== 0 && (
            <div className="ml-auto h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          )}
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
});

/**
 * TASK-121: Loading states
 * Spinner component for inline loading (e.g., directory expansion)
 */
export const LoadingSpinner = memo(function LoadingSpinner({
  size = 'sm',
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  };

  return (
    <svg
      className={`animate-spin text-blue-500 dark:text-blue-400 ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

/**
 * Pre-defined widths for breadcrumb skeleton items
 */
const BREADCRUMB_WIDTHS = [40, 56, 48];

/**
 * TASK-121: Loading states
 * Breadcrumb skeleton for loading state
 */
export const BreadcrumbSkeleton = memo(function BreadcrumbSkeleton() {
  return (
    <div 
      className="flex items-center gap-2 animate-fade-in"
      role="status"
      aria-label="Loading navigation"
      aria-busy={true}
    >
      {BREADCRUMB_WIDTHS.map((width, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-zinc-400" aria-hidden="true">/</span>
          )}
          <div 
            className="h-4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse"
            style={{ width: `${width}px` }}
          />
        </div>
      ))}
      <span className="sr-only">Loading navigation...</span>
    </div>
  );
});

/**
 * TASK-121: Loading states
 * Empty state when directory has no files
 */
export const EmptyDirectoryState = memo(function EmptyDirectoryState() {
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
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        This directory is empty
      </p>
    </div>
  );
});

/**
 * Error types for categorizing errors
 */
type ErrorType = 'network' | 'permission' | 'not_found' | 'generic';

/**
 * Categorize error message to display appropriate icon and guidance
 */
function getErrorType(message: string): ErrorType {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('network') || 
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('connection') ||
      lowerMessage.includes('timeout')) {
    return 'network';
  }
  
  if (lowerMessage.includes('permission') || 
      lowerMessage.includes('access denied') ||
      lowerMessage.includes('forbidden') ||
      lowerMessage.includes('eacces')) {
    return 'permission';
  }
  
  if (lowerMessage.includes('not found') || 
      lowerMessage.includes('does not exist') ||
      lowerMessage.includes('enoent')) {
    return 'not_found';
  }
  
  return 'generic';
}

/**
 * Get user-friendly error message and guidance
 */
function getErrorDetails(message: string, errorType: ErrorType): { 
  title: string; 
  description: string;
  guidance: string;
} {
  switch (errorType) {
    case 'network':
      return {
        title: 'Connection Error',
        description: 'Unable to connect to the server.',
        guidance: 'Please check your internet connection and try again.',
      };
    case 'permission':
      return {
        title: 'Access Denied',
        description: 'You don\'t have permission to access this location.',
        guidance: 'Try selecting a different directory or check file permissions.',
      };
    case 'not_found':
      return {
        title: 'Not Found',
        description: 'The directory or file could not be found.',
        guidance: 'It may have been moved or deleted. Try navigating to a parent directory.',
      };
    default:
      return {
        title: 'Error',
        description: message || 'An unexpected error occurred.',
        guidance: 'Please try again or select a different location.',
      };
  }
}

/**
 * Error icon based on error type
 */
const ErrorIcon = memo(function ErrorIcon({ type }: { type: ErrorType }) {
  switch (type) {
    case 'network':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-12 w-12 text-orange-400 dark:text-orange-500 mb-4"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" />
        </svg>
      );
    case 'permission':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-12 w-12 text-yellow-500 dark:text-yellow-400 mb-4"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'not_found':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-12 w-12 text-zinc-400 dark:text-zinc-500 mb-4"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-12 w-12 text-red-400 dark:text-red-500 mb-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
});

/**
 * TASK-121 & TASK-122: Error state with retry option and user-friendly messages
 * Displays categorized error messages with appropriate icons and guidance
 */
export const ErrorState = memo(function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const errorType = getErrorType(message);
  const { title, description, guidance } = getErrorDetails(message, errorType);

  return (
    <div 
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="alert"
    >
      <ErrorIcon type={errorType} />
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 max-w-xs">
        {description}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-4 max-w-xs">
        {guidance}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-colors"
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
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
});
