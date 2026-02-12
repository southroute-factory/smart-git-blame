# TASK-046: Add progress indicator for large files

| Field | Value |
|-------|-------|
| **Task ID** | TASK-046 |
| **Story** | STORY-007 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Add a progress indicator for large file loads to provide feedback during extended wait times.

## Acceptance Criteria

- [ ] Show progress bar for files taking >500ms to load
- [ ] Display estimated time or percentage if available
- [ ] Progress indicator is visually distinct from skeleton
- [ ] Cancel button to abort long-running requests
- [ ] Handle indeterminate progress gracefully

## Technical Notes

- Consider using fetch with ReadableStream for progress tracking
- Show determinate progress if content-length is available
- Fallback to indeterminate spinner otherwise

## Implementation

```typescript
interface ProgressIndicatorProps {
  progress?: number; // 0-100, undefined for indeterminate
  onCancel?: () => void;
}

function ProgressIndicator({ progress, onCancel }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        {progress !== undefined ? (
          <div 
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        ) : (
          <div className="h-full bg-blue-500 animate-indeterminate" />
        )}
      </div>
      {onCancel && (
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      )}
    </div>
  );
}
```

## Dependencies

- TASK-044 (Integrated into loading state)

## Blocked By

- TASK-044
