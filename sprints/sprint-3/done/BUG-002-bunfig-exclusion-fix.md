# BUG-002: Fix Bun Test Exclusion and Unit Test Failures

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-002 |
| **Priority** | HIGH (P0) |
| **Owner** | QAA |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Fix the bun test runner configuration so E2E tests are properly excluded, and fix 3 failing unit tests in validation.test.ts.

## Problem

1. **bunfig.toml exclusion not working:** `bun test` still runs Playwright E2E files
2. **3 unit test failures:**
   - Test expects dots in paths to be rejected (but they're valid)
   - Error message format assertion mismatch
   - Whitespace-only file path not rejected

## Acceptance Criteria

- [ ] `bun test` excludes all e2e/*.spec.ts files
- [ ] All 61+ unit tests pass
- [ ] Fix validation.test.ts assertions
- [ ] Document working bun configuration
- [ ] Verify on bun 1.3.9

## Technical Notes

Try these exclusion patterns:
```toml
[test]
exclude = ["**/e2e/**", "./e2e/**"]
```

Or rename E2E files from `.spec.ts` to `.e2e.ts`.

For unit tests:
1. Update test: dots ARE valid in directory names
2. Update error message assertion to match actual Zod output
3. Add `.trim()` check or update test expectation

## Dependencies

- None (P0, do first in sprint)

## Blocked By

- Nothing
