# TASK-058: Detect line movement within file

| Field | Value |
|-------|-------|
| **Task ID** | TASK-058 |
| **Story** | STORY-009 |
| **Owner** | BE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Implement logic to detect and track line movement within the same file.

## Acceptance Criteria

- [ ] Identify lines that moved within the file
- [ ] Track original line number before movement
- [ ] Determine the commit where movement occurred
- [ ] Calculate the movement delta (how many lines moved)
- [ ] Group contiguous moved lines together

## Technical Notes

- Use git blame porcelain's "previous" field
- Compare commit histories for same content
- Consider consecutive line grouping for efficiency

## Implementation

```typescript
interface LineMovement {
  currentLine: number;
  originalLine: number;
  movedInCommit: string;
  delta: number; // positive = moved down, negative = moved up
}

interface MovementGroup {
  startLine: number;
  endLine: number;
  originalStartLine: number;
  movedInCommit: string;
  lineCount: number;
}

function detectLineMovements(
  blameLines: BlameLineWithMovement[]
): MovementGroup[] {
  const movements: LineMovement[] = [];
  
  // Find lines with movement detected
  blameLines.forEach((line, index) => {
    if (line.movement?.detected && line.movement.originalLine) {
      movements.push({
        currentLine: index + 1,
        originalLine: line.movement.originalLine,
        movedInCommit: line.sha,
        delta: (index + 1) - line.movement.originalLine,
      });
    }
  });
  
  // Group consecutive movements
  return groupConsecutiveMovements(movements);
}

function groupConsecutiveMovements(movements: LineMovement[]): MovementGroup[] {
  // Group lines that moved together (same delta, consecutive)
  const groups: MovementGroup[] = [];
  // ... grouping logic
  return groups;
}
```

## Dependencies

- TASK-057 (git blame -M parsing)

## Blocked By

- TASK-057
