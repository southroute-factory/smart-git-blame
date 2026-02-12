'use client';

import { Component, ReactNode } from 'react';

/**
 * Structured validation error from the API
 */
export interface ApiValidationError {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Structured API error response
 */
export interface ApiErrorResponse {
  error: string;
  errors?: ApiValidationError[];
  code?: string;
  status?: number;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: ApiErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Returns field-specific errors if available
   */
  get fieldErrors(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (this.response?.errors) {
      this.response.errors.forEach((err) => {
        if (err.field) {
          errors[err.field] = err.message;
        }
      });
    }
    return errors;
  }

  /**
   * Check if this is a validation error (400)
   */
  get isValidationError(): boolean {
    return this.status === 400;
  }

  /**
   * Check if this is a not found error (404)
   */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Check if this is a transient error that could be retried
   */
  get isRetryable(): boolean {
    return this.status >= 500 || this.status === 408 || this.status === 429;
  }
}

/**
 * Parse an API response and throw ApiError if not ok
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: `Request failed with status ${response.status}` };
    }

    throw new ApiError(response.status, errorData.error || 'An error occurred', errorData);
  }

  return response.json();
}

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Optional fallback component to render when an error occurs */
  fallback?: ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Optional callback to retry the operation */
  onRetry?: () => void;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Props for the default error fallback component
 */
interface ErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
}

/**
 * Default fallback component for errors
 */
export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const isApiError = error instanceof ApiError;
  const isRetryable = isApiError && error.isRetryable;
  const isNotFound = isApiError && error.isNotFound;

  // Determine the icon and colors based on error type
  const iconColor = isNotFound
    ? 'text-amber-500'
    : 'text-red-500';
  const borderColor = isNotFound
    ? 'border-amber-200 dark:border-amber-800'
    : 'border-red-200 dark:border-red-800';
  const bgColor = isNotFound
    ? 'bg-amber-50 dark:bg-amber-950'
    : 'bg-red-50 dark:bg-red-950';
  const textColor = isNotFound
    ? 'text-amber-700 dark:text-amber-300'
    : 'text-red-700 dark:text-red-300';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center gap-4 rounded-lg border ${borderColor} ${bgColor} p-8 text-center`}
    >
      {/* Icon */}
      {isNotFound ? (
        <svg
          className={`h-10 w-10 ${iconColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ) : (
        <svg
          className={`h-10 w-10 ${iconColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )}

      {/* Error title */}
      <h2 className={`text-lg font-semibold ${textColor}`}>
        {isNotFound ? 'Not Found' : 'Something went wrong'}
      </h2>

      {/* Error message */}
      <p className={`max-w-md text-sm ${textColor}`}>
        {error.message}
      </p>

      {/* Show field errors if available */}
      {isApiError && Object.keys(error.fieldErrors).length > 0 && (
        <ul className={`mt-2 list-inside list-disc text-left text-sm ${textColor}`}>
          {Object.entries(error.fieldErrors).map(([field, message]) => (
            <li key={field}>
              <span className="font-medium">{field}:</span> {message}
            </li>
          ))}
        </ul>
      )}

      {/* Retry button for retryable errors */}
      {(onRetry || isRetryable) && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * ErrorBoundary is a React class component that catches JavaScript errors
 * anywhere in its child component tree, logs those errors, and displays
 * a fallback UI instead of the component tree that crashed.
 *
 * Features:
 * - Catches runtime errors in child components
 * - Displays user-friendly error message
 * - Provides retry mechanism for transient errors
 * - Supports custom fallback components
 * - Accessible with proper ARIA attributes
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use default fallback
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.props.onRetry ? this.handleRetry : undefined}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
