# TASK-060: Create LineMovement indicator

| Field | Value |
|-------|-------|
| **Task ID** | TASK-060 |
| **Story** | STORY-009 |
| **Owner** | FE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Create a visual indicator component to show when a line has been moved within the file.

## Acceptance Criteria

- [ ] Create LineMovementIndicator component
- [ ] Show icon/badge for moved lines
- [ ] Indicate direction of movement (up/down arrow)
- [ ] Visually distinguish moved lines from static lines
- [ ] Support keyboard navigation to original location

## Technical Notes

- Use subtle visual treatment (don't overwhelm)
- Consider color coding (different from blame colors)
- Match existing UI patterns

## Implementation

```typescript
interface LineMovementIndicatorProps {
  movement?: {
    movedFrom: number;
    delta: number;
  };
  onNavigateToOriginal?: (lineNumber: number) => void;
}

function LineMovementIndicator({ 
  movement, 
  onNavigateToOriginal 
}: LineMovementIndicatorProps) {
  if (!movement) return null;
  
  const direction = movement.delta > 0 ? 'down' : 'up';
  const Icon = direction === 'down' ? ArrowDownIcon : ArrowUpIcon;
  
  return (
    <button
      onClick={() => onNavigateToOriginal?.(movement.movedFrom)}
      className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800"
      title={`Moved from line ${movement.movedFrom}`}
    >
      <Icon className="w-3 h-3" />
      <span className="text-[10px]">
        {Math.abs(movement.delta)}
      </span>
    </button>
  );
}

// Usage in BlameView
function BlameLine({ line }: { line: BlameLine }) {
  return (
    <div className="flex items-center">
      <span className="w-12">{line.lineNumber}</span>
      <LineMovementIndicator 
        movement={line.movement}
        onNavigateToOriginal={scrollToLine}
      />
      <span className="flex-1">{line.content}</span>
    </div>
  );
}
```

## Dependencies

- TASK-059 (Movement info in API response)

## Blocked By

- TASK-059
