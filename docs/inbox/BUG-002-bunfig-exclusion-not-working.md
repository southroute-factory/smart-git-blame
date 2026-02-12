# BUG-002: Bun Test Exclusion Pattern Not Working

**Submitted by:** Product Owner
**Date:** 2026-02-12
**Type:** bug
**Priority:** HIGH (P0)
**Affects:** All E2E tests (9 files), blocks test runner
**Related:** BUG-001 (thought to be fixed in Sprint 2)

## Description

The `bunfig.toml` exclusion pattern created in BUG-001 is not working correctly. Running `bun test` still picks up Playwright E2E test files and fails with "test.describe() not expected here" errors.

Additionally, there are 3 unit test failures that need to be fixed.

## Steps to Reproduce
```bash
bun test
```

## Error Output
```
e2e/rename-tracking.spec.ts:
error: Playwright Test did not expect test.describe() to be called here.
...
(9 E2E files failing)

src/lib/validation.test.ts:
✗ repoPathSchema > valid paths > accepts path with dots in directory names
✗ validateBlameParams > throws ValidationError for missing repo
✗ edge cases > handles whitespace-only file path

61 pass, 12 fail, 9 errors
```

## Root Cause Analysis

### Issue 1: bunfig.toml exclusion not working
The current bunfig.toml has:
```toml
[test]
exclude = ["e2e/**", "node_modules/**", "test-fixtures/**"]
```

Possible causes:
- Bun version difference (user has 1.3.9)
- Glob pattern syntax incorrect for bun
- bunfig.toml location or format issue

### Issue 2: Unit test failures
1. `accepts path with dots in directory names` - Test expects dots to be rejected but validation allows them
2. `throws ValidationError for missing repo` - Error message format changed
3. `handles whitespace-only file path` - Whitespace-only not being rejected

## Proposed Solutions

### For E2E exclusion:
**Option A:** Use explicit file pattern
```toml
[test]
exclude = ["./e2e/*", "e2e/*", "**/e2e/**"]
```

**Option B:** Rename E2E files to .e2e.ts
Rename all `*.spec.ts` in e2e/ to `*.e2e.ts` and exclude that pattern.

**Option C:** Move E2E tests outside project
Move to `tests/e2e/` at project root level.

### For unit test failures:
1. Update validation schema to allow dots in directory names (they're valid)
2. Fix test assertion for error message format
3. Add whitespace trimming to filePathSchema

## Acceptance Criteria

- [ ] `bun test` runs only unit tests successfully
- [ ] All unit tests pass (fix the 3 failures)
- [ ] `npm run test:e2e` still runs Playwright tests
- [ ] Document the working configuration

## Impact
- **Severity:** High - CI/CD pipelines fail
- **Scope:** All developers running tests locally
- **Blocked:** Cannot run unified test command
