# TASK-078: Create Cross-File Move Detection Service

| Field | Value |
|-------|-------|
| **Task ID** | TASK-078 |
| **Story** | STORY-010 |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create a service to detect and track code that was moved from one file to another.

## Acceptance Criteria

- [ ] Create `CrossFileMoveDetector` service class
- [ ] Implement method to identify moved code blocks
- [ ] Track origin file path and commit
- [ ] Group consecutive moved lines from same source
- [ ] Handle multiple source files in same target

## Technical Notes

Interface:
```typescript
interface CrossFileMove {
  targetFile: string;
  targetLines: { start: number; end: number };
  sourceFile: string;
  sourceLines: { start: number; end: number };
  commitSha: string;
  commitDate: Date;
}

class CrossFileMoveDetector {
  async detectMoves(filePath: string, repoPath: string): Promise<CrossFileMove[]>;
}
```

## Dependencies

- TASK-077

## Blocked By

- TASK-077 parsing must be complete
