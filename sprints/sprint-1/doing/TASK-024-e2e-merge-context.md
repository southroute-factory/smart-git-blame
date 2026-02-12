# TASK-024: E2E tests for merge context

| Field | Value |
|-------|-------|
| **Task ID** | TASK-024 |
| **Story** | STORY-004 |
| **Owner** | QAA |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create end-to-end tests for merge commit context functionality.

## Acceptance Criteria

- [ ] Test "View Merge" button appears for merged commits
- [ ] Test clicking "View Merge" shows merge details
- [ ] Test merge view displays correct SHA, author, message
- [ ] Test commit list shows all commits in merge
- [ ] Test clicking commit in list shows its details
- [ ] Test back button returns to original commit view

## Technical Notes

- Use test fixtures repo with known merge history
- Assert specific merge commit data

## Dependencies

- TASK-021, TASK-022 (merge view complete)
- TASK-023 (test fixtures repo)

## Blocked By

- TASK-022
