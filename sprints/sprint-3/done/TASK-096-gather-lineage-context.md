# TASK-096: Gather Lineage Context for Prompt

| Field | Value |
|-------|-------|
| **Task ID** | TASK-096 |
| **Story** | STORY-012 |
| **Owner** | BE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Implement service to gather all lineage context needed for the LLM prompt.

## Acceptance Criteria

- [ ] Gather current line content
- [ ] Extract surrounding code (±5 lines)
- [ ] Compile full commit history chain
- [ ] Include file rename history
- [ ] Include cross-file move origins
- [ ] Format as structured prompt input
- [ ] Handle token limits with truncation

## Technical Notes

```typescript
interface LineageContext {
  lineNumber: number;
  filePath: string;
  lineContent: string;
  surroundingCode: string;
  commitHistory: CommitSummary[];
  fileMovements: FileMovement[];
  crossFileOrigins: CrossFileMove[];
}

async function gatherLineageContext(
  repoPath: string,
  filePath: string,
  lineNumber: number
): Promise<LineageContext> {
  // Aggregate data from existing services
  const blame = await getBlameForLine(...);
  const history = await getFileHistory(...);
  const moves = await getCrossFileMoves(...);
  
  return formatContext(blame, history, moves);
}
```

## Dependencies

- TASK-095 (need prompt structure to know what to gather)

## Blocked By

- Prompt template design
