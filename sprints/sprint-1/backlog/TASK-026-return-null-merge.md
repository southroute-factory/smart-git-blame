# TASK-026: Return null merge for direct commits

| Field | Value |
|-------|-------|
| **Task ID** | TASK-026 |
| **Story** | STORY-005 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Ensure API correctly returns null for mergeCommit when commit is direct.

## Acceptance Criteria

- [ ] Direct commits return `mergeCommit: null`
- [ ] Merged commits return `mergeCommit: "{sha}"`
- [ ] API handles edge cases gracefully

## Technical Notes

- Verify with test fixtures repo (has both commit types)
- Add unit tests for this logic

## Test Cases

| Scenario | Expected mergeCommit |
|----------|---------------------|
| Commit via merge | "abc123..." |
| Direct commit to main | null |
| First commit in repo | null |

## Dependencies

- TASK-025 (detection logic)

## Blocked By

- TASK-025
