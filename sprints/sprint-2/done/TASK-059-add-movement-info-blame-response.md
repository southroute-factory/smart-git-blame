# TASK-059: Add movement info to blame response

| Field | Value |
|-------|-------|
| **Task ID** | TASK-059 |
| **Story** | STORY-009 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Enhance the blame API response to include line movement information.

## Acceptance Criteria

- [ ] Add `movement` field to each blame line
- [ ] Include `movedFrom` line number when applicable
- [ ] Include `movedInCommit` SHA
- [ ] Add query parameter to enable/disable detection
- [ ] Maintain backward compatibility

## Technical Notes

- Movement detection adds overhead - make it optional
- Consider adding to summary section for overview
- Document the new response fields in API docs

## Implementation

```typescript
// Enhanced BlameLine
interface BlameLine {
  lineNumber: number;
  content: string;
  sha: string;
  author: string;
  authorEmail: string;
  timestamp: number;
  // New movement fields
  movement?: {
    movedFrom?: number;       // Original line number
    movedInCommit?: string;   // Commit where movement occurred
    movedFromFile?: string;   // If moved from another file (-C)
    delta?: number;           // Lines moved (+/-)
  };
}

// Enhanced response with summary
interface BlameResponse {
  success: true;
  data: {
    lines: BlameLine[];
    summary: {
      totalLines: number;
      movedLines: number;
      movementGroups: MovementGroup[];
    };
  };
}

// API route with optional flag
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const detectMovement = searchParams.get('detectMovement') === 'true';
  
  const blameData = await parseGitBlame(repo, file, {
    detectMovement,
  });
  
  return NextResponse.json({ success: true, data: blameData });
}
```

## Dependencies

- TASK-057 (git blame -M parsing)
- TASK-058 (Line movement detection)

## Blocked By

- TASK-057
- TASK-058
