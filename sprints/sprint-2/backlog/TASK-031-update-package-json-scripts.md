# TASK-031: Update package.json scripts

| Field | Value |
|-------|-------|
| **Task ID** | TASK-031 |
| **Story** | BUG-001 |
| **Owner** | QAA |
| **Estimate** | 0.25h |
| **Status** | Backlog |

## Description

Update package.json test scripts to properly separate unit tests from E2E tests.

## Acceptance Criteria

- [ ] Add or update `test` script to use `bun test`
- [ ] Add `test:unit` script as alias for unit tests
- [ ] Ensure `test:e2e` script uses `playwright test`
- [ ] Scripts are consistent and well-documented

## Technical Notes

- Keep existing test:e2e script functionality
- Ensure backward compatibility with CI pipeline

## Implementation

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

- TASK-030 (bunfig.toml must exist for exclusions)

## Blocked By

- TASK-030
