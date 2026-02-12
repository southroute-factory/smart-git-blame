# TASK-019: Create merge details API endpoint

| Field | Value |
|-------|-------|
| **Task ID** | TASK-019 |
| **Story** | STORY-004 |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create API endpoint to fetch merge commit details including child commits.

## Acceptance Criteria

- [ ] `/api/merge?repo={path}&sha={sha}` returns merge details
- [ ] Response includes merge commit info (same as commit details)
- [ ] Response includes list of commits in the merge
- [ ] Returns 404 if not a merge commit

## Technical Notes

- Use `git log {merge}^..{merge} --oneline` to list commits in merge
- Exclude the merge commit itself from child list
- Reuse commit parsing from TASK-013

## Response Format

```typescript
interface MergeDetails {
  sha: string;
  author: string;
  email: string;
  date: string;
  message: string;
  commits: {
    sha: string;
    message: string;
  }[];
}
```

## Dependencies

- TASK-018 (ancestry lookup)
- TASK-013 (commit parsing)

## Blocked By

- TASK-018
