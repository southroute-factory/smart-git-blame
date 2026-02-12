'use client';

import { memo, useMemo } from 'react';
import type { BreadcrumbsProps } from './types';

/**
 * TASK-119: Breadcrumb navigation
 * Parse a path into breadcrumb segments
 */
function parsePathSegments(path: string): Array<{ name: string; path: string }> {
  if (!path || path === '/') {
    return [{ name: '/', path: '/' }];
  }

  const segments: Array<{ name: string; path: string }> = [
    { name: '/', path: '/' },
  ];

  const parts = path.split('/').filter(Boolean);
  let currentPath = '';

  for (const part of parts) {
    currentPath += '/' + part;
    segments.push({
      name: part,
      path: currentPath,
    });
  }

  return segments;
}

/**
 * TASK-119: Breadcrumb navigation
 * Displays current path as clickable breadcrumbs for quick navigation
 */
export const Breadcrumbs = memo(function Breadcrumbs({
  currentPath,
  onNavigate,
}: BreadcrumbsProps) {
  const segments = useMemo(() => parsePathSegments(currentPath), [currentPath]);

  return (
    <nav 
      aria-label="File browser navigation"
      className="flex items-center gap-1 overflow-x-auto py-1 text-sm"
    >
      <ol className="flex items-center gap-1 list-none m-0 p-0">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <li key={segment.path} className="flex items-center gap-1">
              {index > 0 && (
                <span 
                  className="text-zinc-400 dark:text-zinc-500 select-none mx-0.5"
                  aria-hidden="true"
                >
                  /
                </span>
              )}
              {isLast ? (
                // Current segment (not clickable)
                <span
                  className="font-medium text-zinc-900 dark:text-zinc-100 px-1 py-0.5 rounded truncate max-w-[150px]"
                  aria-current="page"
                  title={segment.name}
                >
                  {segment.name}
                </span>
              ) : (
                // Clickable segment
                <button
                  type="button"
                  onClick={() => onNavigate(segment.path)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-900 rounded px-1 py-0.5 truncate max-w-[150px] transition-colors"
                  title={`Navigate to ${segment.name}`}
                >
                  {segment.name}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

export default Breadcrumbs;
