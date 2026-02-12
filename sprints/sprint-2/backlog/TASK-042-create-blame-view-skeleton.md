# TASK-042: Create BlameViewSkeleton component

| Field | Value |
|-------|-------|
| **Task ID** | TASK-042 |
| **Story** | STORY-007 |
| **Owner** | FE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Create a skeleton loading component for the blame view that matches the layout structure.

## Acceptance Criteria

- [ ] Create BlameViewSkeleton component
- [ ] Match exact layout of BlameView (line numbers, content, authors)
- [ ] Use animated pulse/shimmer effect
- [ ] Support configurable number of skeleton lines
- [ ] Maintain proper spacing and alignment

## Technical Notes

- Use Tailwind CSS animate-pulse or custom shimmer animation
- Skeleton should be visually representative of actual content
- Consider responsive behavior

## Implementation

```typescript
interface BlameViewSkeletonProps {
  lineCount?: number;
}

function BlameViewSkeleton({ lineCount = 20 }: BlameViewSkeletonProps) {
  return (
    <div className="font-mono text-sm">
      {Array.from({ length: lineCount }).map((_, i) => (
        <div key={i} className="flex animate-pulse">
          <div className="w-12 h-5 bg-gray-200 mr-4" />
          <div className="w-24 h-5 bg-gray-200 mr-4" />
          <div 
            className="h-5 bg-gray-200" 
            style={{ width: `${Math.random() * 50 + 30}%` }}
          />
        </div>
      ))}
    </div>
  );
}
```

## Dependencies

- None (can reference existing BlameView for structure)

## Blocked By

- Nothing
