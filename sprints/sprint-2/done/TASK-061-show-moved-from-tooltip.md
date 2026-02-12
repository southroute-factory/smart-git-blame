# TASK-061: Show "moved from line X" tooltip

| Field | Value |
|-------|-------|
| **Task ID** | TASK-061 |
| **Story** | STORY-009 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Add a tooltip to moved lines showing detailed movement information.

## Acceptance Criteria

- [ ] Show tooltip on hover over movement indicator
- [ ] Display original line number
- [ ] Show commit that introduced the movement
- [ ] Include commit message snippet
- [ ] Add "Jump to original position" action

## Technical Notes

- Use existing tooltip component if available
- Consider delay before showing tooltip
- Ensure tooltip is accessible

## Implementation

```typescript
interface MovedFromTooltipProps {
  movement: {
    movedFrom: number;
    movedInCommit: string;
    delta: number;
  };
  commitMessage?: string;
  onJumpToOriginal: () => void;
}

function MovedFromTooltip({ 
  movement, 
  commitMessage,
  onJumpToOriginal 
}: MovedFromTooltipProps) {
  return (
    <TooltipContent className="p-3 max-w-xs">
      <div className="space-y-2">
        <p className="font-medium">
          Moved from line {movement.movedFrom}
        </p>
        
        <p className="text-sm text-gray-600">
          {movement.delta > 0 
            ? `Moved down ${movement.delta} lines`
            : `Moved up ${Math.abs(movement.delta)} lines`
          }
        </p>
        
        <div className="text-xs text-gray-500">
          <code className="bg-gray-100 px-1 rounded">
            {movement.movedInCommit.slice(0, 7)}
          </code>
          {commitMessage && (
            <p className="mt-1 truncate">{commitMessage}</p>
          )}
        </div>
        
        <button 
          onClick={onJumpToOriginal}
          className="text-sm text-blue-600 hover:underline"
        >
          Jump to original position →
        </button>
      </div>
    </TooltipContent>
  );
}

// Integration with indicator
function LineMovementIndicator({ movement, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="...">
          <ArrowIcon />
        </button>
      </TooltipTrigger>
      <MovedFromTooltip movement={movement} {...props} />
    </Tooltip>
  );
}
```

## Dependencies

- TASK-060 (LineMovement indicator component)

## Blocked By

- TASK-060
