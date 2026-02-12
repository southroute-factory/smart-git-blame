# TASK-070: Test Uncommitted Change Scenarios

| Field | Value |
|-------|-------|
| **Task ID** | TASK-070 |
| **Bug** | BUG-004 |
| **Owner** | QA |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

QA testing to document behavior with various uncommitted change scenarios.

## Acceptance Criteria

- [ ] Test modified tracked files scenario
- [ ] Test new untracked files scenario
- [ ] Test staged but uncommitted changes
- [ ] Test partially staged files
- [ ] Document error messages or failures
- [ ] Capture screenshots/logs
- [ ] Assess user impact and severity

## Test Scenarios

1. **Modified file:** Edit a tracked file, don't commit, view blame
2. **New file:** Create new file, try to view blame
3. **Staged changes:** Stage changes, don't commit, view blame
4. **Partial staging:** Stage only some hunks, view blame

## Deliverable

QA confirmation report with:
- Behavior for each scenario
- Error messages encountered
- Screenshots
- Severity assessment

## Dependencies

- None

## Blocked By

- Nothing
