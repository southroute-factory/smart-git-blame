# TASK-069: Add Tests for Text Visibility

| Field | Value |
|-------|-------|
| **Task ID** | TASK-069 |
| **Bug** | BUG-003 |
| **Owner** | QAA |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Add automated tests to prevent text visibility regressions.

## Acceptance Criteria

- [ ] Add E2E tests verifying text is visible in affected areas
- [ ] Tests check for text content presence
- [ ] Tests verify text is actually visible (not hidden)
- [ ] All new tests pass

## Technical Notes

Playwright assertions:
```typescript
await expect(page.getByText('Expected Text')).toBeVisible();
await expect(element).toHaveCSS('visibility', 'visible');
```

## Dependencies

- TASK-068

## Blocked By

- FE fix must be complete
