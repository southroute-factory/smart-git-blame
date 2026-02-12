# BUG-001: Playwright Tests Fail with Bun Test Runner

**Submitted by:** Product Owner
**Date:** 2026-02-12
**Type:** bug
**Priority:** CRITICAL
**Affects:** All E2E tests (56 tests)

## Description
Running `bun test` causes all Playwright E2E tests to fail with "test.describe() not expected here" errors. Bun's test runner is incompatible with Playwright's test API.

## Steps to Reproduce
```bash
bun test
```

## Error Output
```
error: Playwright Test did not expect test.describe() to be called here.
Most common reasons include:
- You are calling test.describe() in a configuration file.
- You are calling test.describe() in a file that is imported by the configuration file.
- You have two different versions of @playwright/test.
```

## Affected Files
- `e2e/form-submission.spec.ts`
- `e2e/blame-view.spec.ts`
- `e2e/commit-panel.spec.ts`
- `e2e/merge-context.spec.ts`
- `e2e/direct-commits.spec.ts`

## Root Cause Analysis
Bun's built-in test runner (`bun test`) is picking up `.spec.ts` files and trying to run them with Bun's test API instead of Playwright's test runner. Playwright tests must be run with `npx playwright test`.

## Proposed Solutions

### Option A: Exclude e2e from Bun (Recommended)
Add to `bunfig.toml` or `package.json`:
```toml
[test]
exclude = ["e2e/**"]
```

### Option B: Rename test files
Change from `.spec.ts` to `.e2e.ts` or `.pw.ts` to avoid Bun auto-detection.

### Option C: Use different directories
Move Playwright tests outside the project or use a pattern Bun ignores.

## Workaround
Run Playwright tests correctly with:
```bash
npm run test:e2e
# or
npx playwright test
```

## Impact
- **Severity:** High - CI/CD pipelines using `bun test` will fail
- **Scope:** All 56 E2E tests
- **User Impact:** Developers cannot run all tests with single command

## Acceptance Criteria
- [ ] `bun test` runs unit tests only (if any exist)
- [ ] `npm run test:e2e` runs Playwright tests
- [ ] Clear documentation on how to run each test type
- [ ] CI pipeline configured correctly
