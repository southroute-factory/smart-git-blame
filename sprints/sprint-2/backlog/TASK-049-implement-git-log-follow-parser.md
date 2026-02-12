# TASK-049: Implement git log --follow parser

| Field | Value |
|-------|-------|
| **Task ID** | TASK-049 |
| **Story** | STORY-008 |
| **Owner** | BE |
| **Estimate** | 3h |
| **Status** | Backlog |

## Description

Implement a parser for `git log --follow` output to track file rename history.

## Acceptance Criteria

- [ ] Execute `git log --follow --name-status --format="%H|%an|%ae|%at|%s"` for file
- [ ] Parse output to extract commit history with file paths
- [ ] Detect rename operations (R status with old and new paths)
- [ ] Build chronological history of file names
- [ ] Handle edge cases (copied files, moved directories)

## Technical Notes

- `--follow` continues history across renames
- `--name-status` shows R100 for renames, with old/new paths
- Parse percentage similarity for renames (R095 = 95% similar)

## Implementation

```typescript
interface FileHistoryEntry {
  sha: string;
  author: string;
  authorEmail: string;
  timestamp: number;
  message: string;
  status: 'A' | 'M' | 'D' | 'R';
  oldPath?: string;  // For renames
  newPath?: string;  // For renames
  similarity?: number; // For renames (0-100)
}

interface FileHistory {
  currentPath: string;
  history: FileHistoryEntry[];
  renames: Array<{
    fromPath: string;
    toPath: string;
    sha: string;
    timestamp: number;
  }>;
}

async function parseGitLogFollow(repoPath: string, filePath: string): Promise<FileHistory> {
  const output = execSync(
    `git log --follow --name-status --format="COMMIT:%H|%an|%ae|%at|%s" -- "${filePath}"`,
    { cwd: repoPath, encoding: 'utf-8' }
  );
  
  // Parse output...
  const entries: FileHistoryEntry[] = [];
  const renames: FileHistory['renames'] = [];
  
  // Process COMMIT: lines and status lines
  
  return {
    currentPath: filePath,
    history: entries,
    renames,
  };
}
```

## Dependencies

- None (foundational backend task)

## Blocked By

- Nothing
