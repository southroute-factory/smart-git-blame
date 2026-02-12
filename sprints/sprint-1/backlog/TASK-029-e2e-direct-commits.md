# TASK-029: E2E tests for direct commits

| Field | Value |
|-------|-------|
| **Task ID** | TASK-029 |
| **Story** | STORY-005 |
| **Owner** | QAA |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create end-to-end tests for direct commit handling.

## Acceptance Criteria

- [ ] Test direct commit shows "Direct commit" badge
- [ ] Test direct commit does NOT show "View Merge" button
- [ ] Test merged commit shows "View Merge" button
- [ ] Test merged commit does NOT show "Direct commit" badge

## Technical Notes

- Use test fixtures repo with both commit types
- Test both scenarios in same test file for comparison

## Test Cases

```typescript
test('direct commit shows badge, no merge button', async () => {
  // Click line with direct commit
  // Assert badge visible
  // Assert merge button not present
});

test('merged commit shows merge button, no badge', async () => {
  // Click line with merged commit
  // Assert merge button visible
  // Assert badge not present
});
```

## Dependencies

- TASK-028 (badge implemented)
- TASK-023 (test fixtures repo)

## Blocked By

- TASK-028
