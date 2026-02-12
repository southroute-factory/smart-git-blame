# TASK-004: E2E test for form submission

| Field | Value |
|-------|-------|
| **Task ID** | TASK-004 |
| **Story** | STORY-001 |
| **Owner** | QAA |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create end-to-end test covering the form submission flow.

## Acceptance Criteria

- [ ] Test navigates to home page
- [ ] Test fills in repo path and file path
- [ ] Test clicks submit button
- [ ] Test verifies navigation to blame view with correct URL params

## Technical Notes

- Use Playwright or Cypress
- Test with valid local repo path (test fixtures repo)

## Dependencies

- TASK-002, TASK-003 (form component and navigation)
- TASK-023 (test fixtures repo)

## Blocked By

- TASK-003
