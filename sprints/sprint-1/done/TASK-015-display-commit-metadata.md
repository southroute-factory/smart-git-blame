# TASK-015: Display commit metadata in panel

| Field | Value |
|-------|-------|
| **Task ID** | TASK-015 |
| **Story** | STORY-003 |
| **Owner** | FE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Populate the ChangePanel with commit details from API.

## Acceptance Criteria

- [ ] Display full commit SHA (with copy button)
- [ ] Display author name and email
- [ ] Display formatted date
- [ ] Display full commit message (preserve formatting)
- [ ] Display list of changed files

## Technical Notes

- Fetch from `/api/commit` when panel opens
- Format date in readable format (e.g., "Feb 10, 2026 10:00 AM")
- Scroll for long messages or file lists

## Layout

```
┌─────────────────────────────┐
│ Commit abc123...     [Copy] │
├─────────────────────────────┤
│ Author: John Doe            │
│ Date: Feb 10, 2026 10:00 AM │
├─────────────────────────────┤
│ feat: add new feature       │
│                             │
│ This is the body...         │
├─────────────────────────────┤
│ Files Changed (3)           │
│ • src/file1.ts              │
│ • src/file2.ts              │
│ • src/file3.ts              │
└─────────────────────────────┘
```

## Dependencies

- TASK-012, TASK-013 (commit API)
- TASK-014 (panel component)

## Blocked By

- TASK-014
