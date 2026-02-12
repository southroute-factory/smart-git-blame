# TASK-071: Add Git Status Detection to API

| Field | Value |
|-------|-------|
| **Task ID** | TASK-071 |
| **Bug** | BUG-004 |
| **Owner** | BE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Implement git status detection to identify uncommitted changes for the requested file.

## Acceptance Criteria

- [ ] Implement function to check file uncommitted status
- [ ] Detect modified tracked files
- [ ] Detect staged changes
- [ ] Detect untracked files
- [ ] Return appropriate status flags

## Technical Notes

Git commands to use:
```bash
# Check if file has uncommitted changes
git status --porcelain -- <filepath>

# Output format:
# M  = staged modified
#  M = unstaged modified
# MM = both staged and unstaged
# A  = staged new file
# ?? = untracked
```

Implementation:
```typescript
interface FileStatus {
  hasUncommittedChanges: boolean;
  isUntracked: boolean;
  hasStaged: boolean;
  hasUnstaged: boolean;
}
```

## Dependencies

- TASK-070 (QA confirmation for exact requirements)

## Blocked By

- QA confirmation
