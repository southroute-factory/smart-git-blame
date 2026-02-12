# TASK-012: Create commit details API endpoint

| Field | Value |
|-------|-------|
| **Task ID** | TASK-012 |
| **Story** | STORY-003 |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create API endpoint to fetch detailed commit information.

## Acceptance Criteria

- [ ] `/api/commit?repo={path}&sha={sha}` returns commit details
- [ ] Response includes full SHA, author, email, date, message
- [ ] Response includes list of files changed
- [ ] Returns 404 if commit not found

## Technical Notes

- Use `git show --stat {sha}` for commit info
- Parse output in TASK-013

## Response Format

```typescript
interface CommitDetails {
  sha: string;
  author: string;
  email: string;
  date: string;
  message: string;
  files: string[];
}
```

## Dependencies

- TASK-001 (API route pattern established)

## Blocked By

- TASK-001
