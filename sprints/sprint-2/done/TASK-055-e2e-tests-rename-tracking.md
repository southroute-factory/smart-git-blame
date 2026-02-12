# TASK-055: E2E tests for rename tracking

| Field | Value |
|-------|-------|
| **Task ID** | TASK-055 |
| **Story** | STORY-008 |
| **Owner** | QAA |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create comprehensive E2E tests to verify file rename tracking functionality.

## Acceptance Criteria

- [ ] Test renamed file shows previous name indicator
- [ ] Test file history displays all renames
- [ ] Test clicking history entry works
- [ ] Test files without renames don't show indicator
- [ ] Test rename with high similarity is detected
- [ ] Test rename with low similarity (move + edit)

## Technical Notes

- Use test fixtures with known rename history
- Test both single rename and multiple renames
- Verify timeline visualization

## Test Cases

```typescript
test.describe('File Rename Tracking', () => {
  test('shows renamed from indicator for renamed file', async ({ page }) => {
    // Use test fixture with known rename
    await page.goto('/blame/test-repo/new-name.ts');
    
    await expect(page.locator('[data-testid="renamed-from"]'))
      .toContainText('old-name.ts');
  });
  
  test('displays full rename history', async ({ page }) => {
    await page.goto('/blame/test-repo/current-name.ts');
    
    // Open history panel
    await page.click('[data-testid="show-history"]');
    
    // Should show all previous names
    const historyItems = page.locator('[data-testid="history-item"]');
    await expect(historyItems).toHaveCount(3); // 2 renames + current
  });
  
  test('does not show indicator for files without renames', async ({ page }) => {
    await page.goto('/blame/test-repo/never-renamed.ts');
    
    await expect(page.locator('[data-testid="renamed-from"]')).not.toBeVisible();
  });
  
  test('handles file renamed multiple times', async ({ page }) => {
    await page.goto('/blame/test-repo/renamed-twice.ts');
    
    await page.click('[data-testid="show-history"]');
    
    // Verify chronological order
    const items = await page.locator('[data-testid="history-item"]').allTextContents();
    expect(items[0]).toContain('renamed-twice.ts');
    expect(items[1]).toContain('renamed-once.ts');
    expect(items[2]).toContain('original.ts');
  });
});
```

## Dependencies

- TASK-053 (FileHistory component)
- TASK-054 (Renamed from indicator)
- TASK-056 (Test fixtures with renames)

## Blocked By

- TASK-053
- TASK-054
- TASK-056
