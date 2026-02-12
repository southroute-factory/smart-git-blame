# TASK-022: Display commit list in merge view

| Field | Value |
|-------|-------|
| **Task ID** | TASK-022 |
| **Story** | STORY-004 |
| **Owner** | FE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create the commit list component within merge view.

## Acceptance Criteria

- [ ] Display list of commits in merge
- [ ] Each commit shows abbreviated SHA and message
- [ ] Commits are clickable to see full details
- [ ] Scrollable if many commits
- [ ] Show commit count in header

## Technical Notes

- Compact card style for each commit
- Truncate long messages with ellipsis
- Click navigates panel to that commit's details

## Component

```tsx
interface CommitListProps {
  commits: { sha: string; message: string }[];
  onCommitClick: (sha: string) => void;
}
```

## Dependencies

- TASK-021 (merge panel view)

## Blocked By

- TASK-021
