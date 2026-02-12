# TASK-122: Error Handling

| Field | Value |
|-------|-------|
| **Task ID** | TASK-122 |
| **Story** | STORY-013 |
| **Owner** | FE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Implement comprehensive error handling for the file browser component.

## Acceptance Criteria

- [ ] Display user-friendly error messages
- [ ] Handle network errors gracefully
- [ ] Handle permission denied errors
- [ ] Handle path not found errors
- [ ] Retry button for recoverable errors
- [ ] Error boundary for unexpected crashes
- [ ] Log errors for debugging

## Technical Notes

```tsx
// src/components/FileBrowser/ErrorStates.tsx
interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const friendlyMessages: Record<string, string> = {
    'ENOENT': 'This directory no longer exists',
    'EACCES': 'Permission denied - cannot access this directory',
    'ENOTDIR': 'This path is not a directory',
    'NetworkError': 'Unable to connect. Check your connection.',
  };

  const displayMessage = friendlyMessages[errorMessage] || errorMessage;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <span className="text-4xl mb-4">⚠️</span>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Unable to load directory
      </h3>
      <p className="text-gray-500 mb-4">{displayMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Error boundary wrapper
export class FileBrowserErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  // ... standard error boundary implementation
}
```

## Dependencies

- TASK-116

## Blocked By

- Modal container must exist
