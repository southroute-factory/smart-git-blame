# BUG-001: Fix Playwright/Bun Test Runner Incompatibility

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-001 |
| **Priority** | HIGH (P0) |
| **Owner** | QAA |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Fix the test runner configuration so `bun test` doesn't pick up Playwright E2E test files.

## Problem

Running `bun test` causes all 56 Playwright tests to fail because Bun's test runner is incompatible with Playwright's `test.describe()` API.

## Acceptance Criteria

- [ ] Create `bunfig.toml` with e2e exclusion
- [ ] Verify `bun test` skips e2e/ directory
- [ ] Verify `npm run test:e2e` still works
- [ ] Update README or docs with test commands
- [ ] Add `test:unit` script for future unit tests

## Implementation

1. Create `/root/web-app/bunfig.toml`:
```toml
[test]
preload = ["./test-setup.ts"]  # if needed
root = "."
exclude = ["e2e/**", "node_modules/**"]
```

2. Update `package.json` scripts:
```json
{
  "scripts": {
    "test": "bun test",
    "test:unit": "bun test",
    "test:e2e": "playwright test"
  }
}
```

## Dependencies

- None (can be done immediately)

## Blocked By

- Nothing
