# TASK-021: Extend ChangePanel for merge view

| Field | Value |
|-------|-------|
| **Task ID** | TASK-021 |
| **Story** | STORY-004 |
| **Owner** | FE |
| **Estimate** | 3h |
| **Status** | Backlog |

## Description

Add merge commit view to the ChangePanel component.

## Acceptance Criteria

- [ ] "View Merge" button appears when commit has parent merge
- [ ] Clicking "View Merge" shows merge commit details
- [ ] Merge view has distinct header/styling
- [ ] Back button to return to commit view
- [ ] Breadcrumb or navigation indicator

## Technical Notes

- Add view state: 'commit' | 'merge'
- Fetch merge details from `/api/merge` endpoint
- Reuse layout components from commit view

## Layout (Merge View)

```
┌─────────────────────────────┐
│ ← Back    MERGE             │
├─────────────────────────────┤
│ Merge abc123...      [Copy] │
│ Author: John Doe            │
│ Date: Feb 10, 2026 10:00 AM │
├─────────────────────────────┤
│ Merge feature-branch        │
│                             │
│ PR description here...      │
├─────────────────────────────┤
│ Commits (3)                 │
│ ┌─────────────────────────┐ │
│ │ def456 feat: add X      │ │
│ │ ghi789 fix: bug in Y    │ │
│ │ jkl012 refactor: Z      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## Dependencies

- TASK-019 (merge API)
- TASK-015 (commit panel layout)

## Blocked By

- TASK-019
