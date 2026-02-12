# TASK-064: Debug bunfig.toml Exclusion Pattern

| Field | Value |
|-------|-------|
| **Task ID** | TASK-064 |
| **Bug** | BUG-002 |
| **Owner** | QAA |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Debug why the bunfig.toml exclusion pattern is not working to exclude E2E test files from Bun's test runner.

## Acceptance Criteria

- [ ] Identify why current exclusion pattern fails
- [ ] Test alternative exclusion patterns
- [ ] Verify `bun test` no longer runs Playwright E2E files
- [ ] Document working configuration

## Technical Notes

Try these exclusion patterns:
```toml
[test]
exclude = ["**/e2e/**", "./e2e/**"]
```

Or consider renaming E2E files from `.spec.ts` to `.e2e.ts`.

Check Bun documentation for glob pattern syntax differences.

## Dependencies

- None (P0, do first in sprint)

## Blocked By

- Nothing
