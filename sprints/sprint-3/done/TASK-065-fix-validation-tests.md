# TASK-065: Fix Failing validation.test.ts Assertions

| Field | Value |
|-------|-------|
| **Task ID** | TASK-065 |
| **Bug** | BUG-002 |
| **Owner** | QAA |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Fix the 3 failing unit tests in validation.test.ts:
1. Test expects dots in paths to be rejected (but they're valid)
2. Error message format assertion mismatch
3. Whitespace-only file path not rejected

## Acceptance Criteria

- [ ] Update test: dots ARE valid in directory names
- [ ] Update error message assertion to match actual Zod output
- [ ] Add `.trim()` check or update test expectation for whitespace
- [ ] All 3 failing tests now pass

## Technical Notes

Review validation.test.ts assertions against actual Zod schema behavior. The tests may have incorrect expectations rather than the validation being wrong.

## Dependencies

- TASK-064

## Blocked By

- Nothing
