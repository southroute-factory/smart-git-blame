# TASK-054: Add "renamed from" indicator in UI

| Field | Value |
|-------|-------|
| **Task ID** | TASK-054 |
| **Story** | STORY-008 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Add a visual indicator in the blame view header showing when a file was renamed.

## Acceptance Criteria

- [ ] Show "Renamed from {old_path}" badge if file was renamed
- [ ] Include timestamp of last rename
- [ ] Tooltip with full rename history
- [ ] Link to view file under previous name
- [ ] Hide indicator if no rename history

## Technical Notes

- Place indicator near file path in header
- Use consistent badge styling
- Consider collapsible for long histories

## Implementation

```typescript
interface RenamedFromIndicatorProps {
  renamedFrom?: {
    path: string;
    sha: string;
    timestamp: number;
  };
}

function RenamedFromIndicator({ renamedFrom }: RenamedFromIndicatorProps) {
  if (!renamedFrom) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Badge variant="outline" className="flex items-center gap-1">
        <ArrowLeftIcon className="w-3 h-3" />
        Renamed from
        <code className="bg-gray-100 px-1 rounded">
          {renamedFrom.path}
        </code>
      </Badge>
      <Tooltip content={`Renamed ${formatRelativeTime(renamedFrom.timestamp)}`}>
        <InfoIcon className="w-4 h-4 text-gray-400" />
      </Tooltip>
    </div>
  );
}

// Usage in BlameHeader
function BlameHeader({ file, renamedFrom }) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <h1 className="font-mono">{file}</h1>
        <RenamedFromIndicator renamedFrom={renamedFrom} />
      </div>
    </header>
  );
}
```

## Dependencies

- TASK-052 (Rename data in API response)
- TASK-053 (FileHistory component for full history)

## Blocked By

- TASK-052
