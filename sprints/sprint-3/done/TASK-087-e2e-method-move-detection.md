# TASK-087: E2E Tests for Method Move Detection

| Field | Value |
|-------|-------|
| **Task ID** | TASK-087 |
| **Story** | STORY-010 |
| **Owner** | QAA |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create end-to-end tests for cross-file method move detection feature.

## Acceptance Criteria

- [ ] Test extracted function shows "moved from" indicator
- [ ] Test copied function shows "copied from" indicator  
- [ ] Test confidence badges display correctly
- [ ] Test "View original" link navigates correctly
- [ ] Test handles large repos with timeout gracefully

## Test Cases

```typescript
test('shows moved from indicator for extracted function', async ({ page }) => {
  await page.goto('/blame?repo=test-fixtures/cross-file-moves&file=pricing.ts');
  await page.getByText('calculateTotal').click();
  await expect(page.getByText('Moved from')).toBeVisible();
  await expect(page.getByText('utils.ts')).toBeVisible();
});

test('shows confidence badge', async ({ page }) => {
  // ... verify confidence indicator displayed
});

test('view original link works', async ({ page }) => {
  // ... click through to original file
});
```

## Notes

Cross-file detection is probabilistic. Use fuzzy assertions where appropriate:
- Check indicator exists, not exact text
- Allow for confidence variations

## Dependencies

- TASK-085 (all FE work complete)
- TASK-086 (test fixtures available)

## Blocked By

- FE and fixtures must be complete
