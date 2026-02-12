# TASK-043: Create ChangePanelSkeleton

| Field | Value |
|-------|-------|
| **Task ID** | TASK-043 |
| **Story** | STORY-007 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create a skeleton loading component for the commit details change panel.

## Acceptance Criteria

- [ ] Create ChangePanelSkeleton component
- [ ] Match layout of ChangePanel (header, metadata, diff)
- [ ] Use consistent animation with BlameViewSkeleton
- [ ] Show skeleton for commit message, author, date
- [ ] Include diff area skeleton

## Technical Notes

- Match existing ChangePanel dimensions and layout
- Use same animation timing as BlameViewSkeleton for consistency
- Consider panel open/close animation

## Implementation

```typescript
function ChangePanelSkeleton() {
  return (
    <div className="w-96 border-l bg-white p-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-6 w-32 bg-gray-200 mb-4" />
      
      {/* Commit hash skeleton */}
      <div className="h-4 w-20 bg-gray-200 mb-2" />
      
      {/* Author skeleton */}
      <div className="h-4 w-40 bg-gray-200 mb-2" />
      
      {/* Date skeleton */}
      <div className="h-4 w-28 bg-gray-200 mb-4" />
      
      {/* Message skeleton */}
      <div className="h-4 w-full bg-gray-200 mb-2" />
      <div className="h-4 w-3/4 bg-gray-200 mb-6" />
      
      {/* Diff skeleton */}
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200" style={{ width: `${Math.random() * 40 + 50}%` }} />
        ))}
      </div>
    </div>
  );
}
```

## Dependencies

- None (can reference existing ChangePanel for structure)

## Blocked By

- Nothing
