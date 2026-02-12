# TASK-032: Verify test commands work

| Field | Value |
|-------|-------|
| **Task ID** | TASK-032 |
| **Story** | BUG-001 |
| **Owner** | QAA |
| **Estimate** | 0.25h |
| **Status** | Backlog |

## Description

Verify that all test commands work correctly after configuration changes.

## Acceptance Criteria

- [ ] `bun test` runs without picking up Playwright files
- [ ] `npm run test:unit` executes successfully
- [ ] `npm run test:e2e` still runs all Playwright tests
- [ ] Document verified commands in README or docs

## Technical Notes

- Run each command and verify expected behavior
- Check that test count matches expectations
- Ensure no false positives or negatives

## Verification Steps

1. Run `bun test` - should skip e2e directory
2. Run `npm run test:e2e` - should run all 56 Playwright tests
3. Verify no error messages or warnings

## Dependencies

- TASK-030 (bunfig.toml)
- TASK-031 (package.json scripts)

## Blocked By

- TASK-030
- TASK-031
