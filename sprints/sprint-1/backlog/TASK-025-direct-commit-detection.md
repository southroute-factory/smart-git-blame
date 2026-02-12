# TASK-025: Add direct commit detection logic

| Field | Value |
|-------|-------|
| **Task ID** | TASK-025 |
| **Story** | STORY-005 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Add logic to detect when a commit was made directly to main (not via merge).

## Acceptance Criteria

- [ ] Commit details API includes `mergeCommit` field
- [ ] `mergeCommit` is SHA string if commit was merged
- [ ] `mergeCommit` is null if direct commit to main
- [ ] Detection uses TASK-018 merge lookup

## Technical Notes

- Extend commit details response
- Reuse merge ancestry lookup

## Updated Response Format

```typescript
interface CommitDetails {
  sha: string;
  author: string;
  email: string;
  date: string;
  message: string;
  files: string[];
  mergeCommit: string | null;  // NEW
}
```

## Dependencies

- TASK-018 (merge ancestry lookup)

## Blocked By

- TASK-018
