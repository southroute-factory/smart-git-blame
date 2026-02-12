# TASK-017: E2E tests for commit panel

| Field | Value |
|-------|-------|
| **Task ID** | TASK-017 |
| **Story** | STORY-003 |
| **Owner** | QAA |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create end-to-end tests for the commit details panel.

## Acceptance Criteria

- [ ] Test click line opens panel
- [ ] Test panel displays correct commit SHA
- [ ] Test panel displays author, date, message
- [ ] Test panel displays changed files
- [ ] Test click different line updates panel
- [ ] Test close button closes panel
- [ ] Test click outside closes panel
- [ ] Test escape key closes panel

## Technical Notes

- Use test fixtures repo with known commits
- Assert specific commit data matches expected values

## Dependencies

- TASK-016 (panel fully functional)
- TASK-023 (test fixtures repo)

## Blocked By

- TASK-016
