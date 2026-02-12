# TASK-011: E2E tests for blame view

| Field | Value |
|-------|-------|
| **Task ID** | TASK-011 |
| **Story** | STORY-002 |
| **Owner** | QAA |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create end-to-end tests for the blame view functionality.

## Acceptance Criteria

- [ ] Test blame view loads with line numbers
- [ ] Test blame annotations display (SHA, author, date)
- [ ] Test syntax highlighting renders
- [ ] Test visual grouping appears for consecutive lines
- [ ] Test line hover state
- [ ] Test line click triggers selection

## Technical Notes

- Use test fixtures repo with known content
- Assert specific line content and blame data
- Visual regression test for highlighting (optional)

## Dependencies

- TASK-008, TASK-009, TASK-010 (BlameView complete)
- TASK-023 (test fixtures repo)

## Blocked By

- TASK-010
