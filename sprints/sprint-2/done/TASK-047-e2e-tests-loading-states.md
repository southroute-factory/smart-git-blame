# TASK-047: E2E tests for loading states

| Field | Value |
|-------|-------|
| **Task ID** | TASK-047 |
| **Story** | STORY-007 |
| **Owner** | QAA |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Create E2E tests to verify loading states and skeleton screens work correctly.

## Acceptance Criteria

- [ ] Test skeleton appears during page load
- [ ] Test skeleton is replaced by content
- [ ] Test change panel skeleton on commit click
- [ ] Test progress indicator for slow responses
- [ ] Test animations work correctly
- [ ] Test reduced motion preference is respected

## Technical Notes

- Use Playwright network throttling to simulate slow loads
- Use route interception to control response timing
- Test visual appearance with screenshot comparisons

## Test Cases

```typescript
test.describe('Loading States', () => {
  test('shows skeleton while loading blame data', async ({ page }) => {
    // Intercept and delay the API response
    await page.route('**/api/blame**', async route => {
      await new Promise(r => setTimeout(r, 1000));
      await route.continue();
    });
    
    await page.goto('/blame/repo/file.ts');
    
    // Skeleton should be visible
    await expect(page.locator('[data-testid="blame-skeleton"]')).toBeVisible();
    
    // Wait for content to load
    await expect(page.locator('[data-testid="blame-view"]')).toBeVisible();
    
    // Skeleton should be gone
    await expect(page.locator('[data-testid="blame-skeleton"]')).not.toBeVisible();
  });
  
  test('shows panel skeleton when loading commit details', async ({ page }) => {
    await page.goto('/blame/repo/file.ts');
    await page.waitForSelector('[data-testid="blame-line"]');
    
    // Click a line to open commit panel
    await page.click('[data-testid="blame-line"]:first-child');
    
    // Panel skeleton should appear
    await expect(page.locator('[data-testid="panel-skeleton"]')).toBeVisible();
  });
  
  test('respects reduced motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/blame/repo/file.ts');
    
    // Verify no animations (check CSS)
    const skeleton = page.locator('[data-testid="blame-skeleton"]');
    const animation = await skeleton.evaluate(el => 
      getComputedStyle(el).animation
    );
    expect(animation).toBe('none');
  });
});
```

## Dependencies

- TASK-044 (Loading states implemented)
- TASK-045 (Animations implemented)
- TASK-046 (Progress indicator implemented)

## Blocked By

- TASK-044
- TASK-045
