# TASK-053: Create FileHistory component

| Field | Value |
|-------|-------|
| **Task ID** | TASK-053 |
| **Story** | STORY-008 |
| **Owner** | FE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create a UI component to display file rename history with timeline visualization.

## Acceptance Criteria

- [ ] Create FileHistory component
- [ ] Display chronological list of file names
- [ ] Show timestamps for each rename
- [ ] Visualize as timeline or list
- [ ] Support clicking to view file at that point
- [ ] Handle files with no rename history gracefully

## Technical Notes

- Use relative time formatting (e.g., "2 months ago")
- Consider expandable/collapsible design
- Integrate with existing UI design patterns

## Implementation

```typescript
interface FileHistoryProps {
  history: {
    currentPath: string;
    renames: Array<{
      fromPath: string;
      toPath: string;
      sha: string;
      timestamp: number;
    }>;
  };
}

function FileHistory({ history }: FileHistoryProps) {
  if (history.renames.length === 0) {
    return null; // No renames, don't show component
  }
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <HistoryIcon className="w-4 h-4" />
        File History
      </h3>
      
      <div className="space-y-2">
        {/* Current name */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="font-mono text-sm">{history.currentPath}</span>
          <span className="text-gray-500 text-xs">current</span>
        </div>
        
        {/* Previous names */}
        {history.renames.map((rename, index) => (
          <div key={index} className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <span className="font-mono text-sm">{rename.fromPath}</span>
            <span className="text-gray-500 text-xs">
              {formatRelativeTime(rename.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Dependencies

- TASK-052 (Rename data in API response)

## Blocked By

- TASK-052
