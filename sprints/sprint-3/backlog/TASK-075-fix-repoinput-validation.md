# TASK-075: Fix RepoInput Validation Logic

| Field | Value |
|-------|-------|
| **Task ID** | TASK-075 |
| **Bug** | BUG-005 |
| **Owner** | FE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Fix the validation logic in RepoInput component that causes button to be disabled unexpectedly.

## Acceptance Criteria

- [ ] Review QA confirmation report from TASK-074
- [ ] Identify root cause of incorrect disable state
- [ ] Fix validation logic
- [ ] Button enables with valid input
- [ ] No regression in actual validation

## Technical Notes

Current validation in RepoInput.tsx:
- Checks for empty values
- Checks for invalid path characters
- Button disabled when `hasErrors && Object.values(touched).some(Boolean)`

Possible issues to investigate:
- Validation too strict for valid paths
- Touch state not updating correctly
- Race condition in validation

## Dependencies

- TASK-074 (QA confirmation)

## Blocked By

- QA confirmation required
