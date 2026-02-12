# TASK-121: Loading States

| Field | Value |
|-------|-------|
| **Task ID** | TASK-121 |
| **Story** | STORY-013 |
| **Owner** | FE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Implement loading states for the file browser to provide visual feedback during async operations.

## Acceptance Criteria

- [ ] Show skeleton loader on initial load
- [ ] Show inline spinner when expanding folders
- [ ] Loading indicator in breadcrumbs during navigation
- [ ] Disable interactions during loading
- [ ] Smooth transition from loading to loaded state
- [ ] Loading text for accessibility (sr-only)

## Technical Notes

```tsx
// src/components/FileBrowser/LoadingStates.tsx
export function DirectorySkeletonLoader() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 animate-pulse">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
        </div>
      ))}
      <span className="sr-only">Loading directory contents...</span>
    </div>
  );
}

export function FolderLoadingSpinner() {
  return (
    <span className="inline-flex items-center">
      <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" cy="12" r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
          fill="none" 
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </span>
  );
}
```

## Dependencies

- TASK-116
- TASK-117

## Blocked By

- Modal and tree components must exist
