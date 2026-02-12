'use client';

/**
 * Props for the ProgressIndicator component
 */
export interface ProgressIndicatorProps {
  /** Progress value from 0-100, or undefined for indeterminate state */
  progress?: number;
  /** Text label to display (e.g., "Loading..." or "45%") */
  label?: string;
  /** Whether the progress indicator is visible */
  isVisible?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning';
}

/**
 * ProgressIndicator component for displaying loading progress.
 * Supports both determinate (with percentage) and indeterminate states.
 *
 * Features:
 * - Smooth CSS animations for progress bar
 * - Indeterminate mode with sliding animation
 * - Accessible with proper ARIA attributes
 * - Supports reduced motion preference
 * - Multiple size and color variants
 */
export default function ProgressIndicator({
  progress,
  label,
  isVisible = true,
  size = 'md',
  variant = 'default',
}: ProgressIndicatorProps) {
  // Determine if we're in indeterminate mode
  const isIndeterminate = progress === undefined;
  
  // Clamp progress to 0-100
  const normalizedProgress = isIndeterminate
    ? 0
    : Math.min(100, Math.max(0, progress));

  // Size classes for the progress bar
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  // Variant colors for the progress bar fill
  const variantClasses = {
    default: 'bg-blue-500 dark:bg-blue-400',
    success: 'bg-green-500 dark:bg-green-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
  };

  // Text size classes based on progress bar size
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="animate-fade-in flex flex-col gap-1.5"
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || (isIndeterminate ? 'Loading' : `${normalizedProgress}% complete`)}
      aria-busy={true}
    >
      {/* Label row */}
      {label && (
        <div className="flex items-center justify-between">
          <span
            className={`font-medium text-zinc-600 dark:text-zinc-400 ${textSizeClasses[size]}`}
          >
            {label}
          </span>
          {!isIndeterminate && (
            <span
              className={`tabular-nums text-zinc-500 dark:text-zinc-500 ${textSizeClasses[size]}`}
            >
              {Math.round(normalizedProgress)}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div
        className={`
          w-full overflow-hidden rounded-full
          bg-zinc-200 dark:bg-zinc-700
          ${sizeClasses[size]}
        `}
      >
        {/* Progress bar fill */}
        {isIndeterminate ? (
          // Indeterminate sliding animation
          <div
            className={`
              h-full w-1/3 rounded-full
              animate-progress-indeterminate
              ${variantClasses[variant]}
            `}
          />
        ) : (
          // Determinate progress with smooth transition
          <div
            className={`
              h-full rounded-full
              transition-all duration-300 ease-out
              ${variantClasses[variant]}
            `}
            style={{ width: `${normalizedProgress}%` }}
          >
            {/* Shimmer effect overlay */}
            {normalizedProgress < 100 && (
              <div className="animate-shimmer h-full w-full rounded-full" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact progress indicator for use in headers or constrained spaces.
 * Shows a thin progress bar without label.
 */
export function ProgressBar({
  progress,
  isVisible = true,
  variant = 'default',
}: Pick<ProgressIndicatorProps, 'progress' | 'isVisible' | 'variant'>) {
  return (
    <ProgressIndicator
      progress={progress}
      isVisible={isVisible}
      variant={variant}
      size="sm"
    />
  );
}

/**
 * Loading spinner with optional progress text.
 * For use as an alternative to the progress bar.
 */
export function LoadingSpinner({
  label,
  size = 'md',
}: Pick<ProgressIndicatorProps, 'label' | 'size'>) {
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div
      className="animate-fade-in flex items-center gap-2"
      role="status"
      aria-label={label || 'Loading'}
      aria-busy={true}
    >
      <svg
        className={`animate-spin text-blue-500 dark:text-blue-400 ${spinnerSizes[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
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
      {label && (
        <span className={`text-zinc-600 dark:text-zinc-400 ${textSizes[size]}`}>
          {label}
        </span>
      )}
    </div>
  );
}
