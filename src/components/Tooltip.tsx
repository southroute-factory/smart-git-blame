'use client';

import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';

/**
 * Props for the Tooltip component
 */
export interface TooltipProps {
  /** Content to show in the tooltip */
  content: ReactNode;
  /** The element that triggers the tooltip */
  children: ReactNode;
  /** Delay before showing tooltip in ms (default: 200) */
  delay?: number;
  /** Position of the tooltip relative to trigger (default: 'top') */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Additional className for the tooltip container */
  className?: string;
  /** Whether the tooltip content should be interactive (default: false) */
  interactive?: boolean;
}

/**
 * Accessible tooltip component with keyboard support.
 * Shows tooltip on hover and focus with configurable delay.
 */
export function Tooltip({
  content,
  children,
  delay = 200,
  position = 'top',
  className = '',
  interactive = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // For interactive tooltips, add a small delay to allow moving to tooltip
    if (interactive) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    } else {
      setIsVisible(false);
    }
  }, [interactive]);

  const handleTooltipEnter = useCallback(() => {
    if (interactive && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [interactive]);

  const handleTooltipLeave = useCallback(() => {
    if (interactive) {
      setIsVisible(false);
    }
  }, [interactive]);

  // Position classes for the tooltip
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Arrow classes for the tooltip
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-800 dark:border-t-zinc-200 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800 dark:border-b-zinc-200 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-800 dark:border-l-zinc-200 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-800 dark:border-r-zinc-200 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
          className={`
            absolute z-50 ${positionClasses[position]}
            animate-fade-in
            rounded-md bg-zinc-800 px-2 py-1.5 text-xs text-white shadow-lg
            dark:bg-zinc-200 dark:text-zinc-900
            ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}
          `}
        >
          {/* Arrow */}
          <div
            className={`absolute h-0 w-0 border-4 ${arrowClasses[position]}`}
            aria-hidden="true"
          />
          {content}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
