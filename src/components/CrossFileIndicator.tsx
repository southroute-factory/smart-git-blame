'use client';

import { Tooltip } from '@/components/Tooltip';
import type { ConfidenceLevel, CrossFileMatch } from '@/lib/crossfile';

/**
 * Props for the CrossFileIndicator component
 * TASK-083, TASK-084, TASK-085
 */
export interface CrossFileIndicatorProps {
  /** Cross-file match information */
  match: CrossFileMatch;
  /** Callback when user wants to view the original file */
  onViewOriginal?: (sourceFile: string, lineNumber?: number) => void;
}

/**
 * Props for the ConfidenceBadge component
 * TASK-084: Display confidence badge
 */
export interface ConfidenceBadgeProps {
  /** Confidence level (high, medium, low) */
  confidence: ConfidenceLevel;
  /** Optional size variant */
  size?: 'sm' | 'md';
}

/**
 * Color styles for each confidence level
 * TASK-084: Display confidence badge with color coding
 */
const confidenceStyles: Record<ConfidenceLevel, { bg: string; text: string; border: string }> = {
  high: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  medium: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  low: {
    bg: 'bg-zinc-100 dark:bg-zinc-800/50',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
};

/**
 * Confidence badge component
 * TASK-084: Display confidence badge with color coding
 * 
 * Shows the confidence level (high/medium/low) with appropriate colors:
 * - High: Green
 * - Medium: Amber
 * - Low: Gray
 */
export function ConfidenceBadge({ confidence, size = 'sm' }: ConfidenceBadgeProps) {
  const styles = confidenceStyles[confidence];
  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : 'px-2 py-1 text-xs';

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium capitalize
        ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses}
      `}
      aria-label={`${confidence} confidence`}
    >
      {confidence}
    </span>
  );
}

/**
 * Icon for the operation type (moved vs copied)
 */
function OperationIcon({ type }: { type: 'moved' | 'copied' }) {
  if (type === 'moved') {
    return (
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    );
  }
  
  // Copied icon
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

/**
 * Tooltip content for cross-file information
 * Shows detailed info about where the code came from
 */
function CrossFileTooltipContent({
  match,
  onViewOriginal,
}: {
  match: CrossFileMatch;
  onViewOriginal?: () => void;
}) {
  const operationLabel = match.operationType === 'moved' ? 'Moved from' : 'Copied from';
  
  return (
    <div className="min-w-[200px] max-w-[280px] space-y-2 text-left">
      {/* Header with operation type */}
      <div className="flex items-center gap-2">
        <OperationIcon type={match.operationType} />
        <span className="font-medium">{operationLabel}</span>
      </div>
      
      {/* Source file */}
      <p className="truncate text-zinc-300 dark:text-zinc-600" title={match.sourceFile}>
        <code className="rounded bg-zinc-700 px-1 dark:bg-zinc-300">
          {match.sourceFile}
        </code>
      </p>
      
      {/* Line count */}
      <p className="text-zinc-400 dark:text-zinc-500">
        {match.lineNumbers.length} line{match.lineNumbers.length !== 1 ? 's' : ''}
      </p>
      
      {/* Confidence badge */}
      <div className="flex items-center gap-2">
        <span className="text-zinc-400 dark:text-zinc-500">Confidence:</span>
        <ConfidenceBadge confidence={match.confidence} />
      </div>
      
      {/* Author info */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Originally by <span className="font-medium">{match.author}</span>
      </p>
      
      {/* View original link - TASK-085 */}
      {onViewOriginal && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewOriginal();
          }}
          className="flex items-center gap-1 text-blue-300 hover:text-blue-200 hover:underline dark:text-blue-600 dark:hover:text-blue-700"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          View original file →
        </button>
      )}
    </div>
  );
}

/**
 * CrossFileIndicator component
 * TASK-083: Create moved-from-file indicator
 * TASK-084: Display confidence badge
 * TASK-085: Add view original link
 * 
 * Shows a visual indicator when code was moved or copied from another file.
 * Displays:
 * - Icon indicating move vs copy operation
 * - Truncated source filename
 * - Confidence badge with color coding
 * - Tooltip with detailed information
 * - Link to view original file
 */
export function CrossFileIndicator({ match, onViewOriginal }: CrossFileIndicatorProps) {
  const styles = confidenceStyles[match.confidence];
  const firstLineNumber = match.lineNumbers[0];
  
  // Extract just the filename from the full path for display
  const displayFilename = match.sourceFile.split('/').pop() || match.sourceFile;
  
  const handleViewOriginal = onViewOriginal
    ? () => onViewOriginal(match.sourceFile, firstLineNumber)
    : undefined;

  const tooltipContent = (
    <CrossFileTooltipContent
      match={match}
      onViewOriginal={handleViewOriginal}
    />
  );

  return (
    <Tooltip content={tooltipContent} position="right" delay={300} interactive>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleViewOriginal?.();
        }}
        className={`
          inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs
          transition-colors
          ${styles.bg} ${styles.text}
          hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
        aria-label={`Code ${match.operationType} from ${match.sourceFile}, ${match.confidence} confidence. Click to view original file.`}
        disabled={!onViewOriginal}
      >
        <OperationIcon type={match.operationType} />
        <span className="max-w-[80px] truncate font-medium" title={match.sourceFile}>
          {displayFilename}
        </span>
        <ConfidenceBadge confidence={match.confidence} />
      </button>
    </Tooltip>
  );
}

/**
 * Compact indicator for inline display in the blame gutter
 * Shows just an icon with full details in tooltip
 */
export function CrossFileIndicatorCompact({ match, onViewOriginal }: CrossFileIndicatorProps) {
  const styles = confidenceStyles[match.confidence];
  const firstLineNumber = match.lineNumbers[0];
  
  const handleViewOriginal = onViewOriginal
    ? () => onViewOriginal(match.sourceFile, firstLineNumber)
    : undefined;

  const tooltipContent = (
    <CrossFileTooltipContent
      match={match}
      onViewOriginal={handleViewOriginal}
    />
  );

  return (
    <Tooltip content={tooltipContent} position="right" delay={300} interactive>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleViewOriginal?.();
        }}
        className={`
          inline-flex items-center justify-center rounded p-0.5
          transition-colors
          ${styles.text}
          hover:${styles.bg} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
        aria-label={`Code ${match.operationType} from ${match.sourceFile}, ${match.confidence} confidence`}
        disabled={!onViewOriginal}
      >
        <OperationIcon type={match.operationType} />
      </button>
    </Tooltip>
  );
}

export default CrossFileIndicator;
