# TASK-126: E2E File Browser Tests

| Field | Value |
|-------|-------|
| **Task ID** | TASK-126 |
| **Story** | STORY-013 |
| **Owner** | QAA |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create comprehensive end-to-end tests for the file browser feature.

## Acceptance Criteria

- [ ] Test opening file browser modal
- [ ] Test navigating directory tree
- [ ] Test selecting files and directories
- [ ] Test keyboard navigation
- [ ] Test breadcrumb navigation
- [ ] Test search/filter functionality
- [ ] Test recent files feature
- [ ] Test integration with RepoInput
- [ ] Test error states
- [ ] All tests pass in CI

## Test Cases

```typescript
// e2e/file-browser.spec.ts
import { test, expect } from '@playwright/test';

test.describe('File Browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens file browser modal', async ({ page }) => {
    await page.click('[data-testid="browse-repo-button"]');
    await expect(page.locator('[data-testid="file-browser-modal"]')).toBeVisible();
  });

  test('navigates directory tree', async ({ page }) => {
    await page.click('[data-testid="browse-repo-button"]');
    await page.click('[data-testid="folder-src"]');
    await expect(page.locator('[data-testid="folder-components"]')).toBeVisible();
  });

  test('selects file and closes modal', async ({ page }) => {
    await page.click('[data-testid="browse-file-button"]');
    await page.click('[data-testid="folder-src"]');
    await page.click('[data-testid="file-index.ts"]');
    await page.click('[data-testid="select-button"]');
    
    await expect(page.locator('[data-testid="file-browser-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="file-path-input"]')).toHaveValue(/index\.ts/);
  });

  test('supports keyboard navigation', async ({ page }) => {
    await page.click('[data-testid="browse-repo-button"]');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Verify selection
    await expect(page.locator('[data-testid="selected-item"]')).toBeVisible();
  });

  test('filters files by search', async ({ page }) => {
    await page.click('[data-testid="browse-file-button"]');
    await page.fill('[data-testid="file-search-input"]', 'index');
    
    const items = page.locator('[data-testid="file-item"]');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('index');
  });

  test('shows recent files', async ({ page }) => {
    // Select a file first
    await page.click('[data-testid="browse-file-button"]');
    await page.click('[data-testid="file-readme"]');
    await page.click('[data-testid="select-button"]');
    
    // Open again and check recent
    await page.click('[data-testid="browse-file-button"]');
    await expect(page.locator('[data-testid="recent-files"]')).toContainText('readme');
  });

  test('handles errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/files*', (route) => 
      route.fulfill({ status: 500, body: 'Server error' })
    );
    
    await page.click('[data-testid="browse-repo-button"]');
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('closes on Escape key', async ({ page }) => {
    await page.click('[data-testid="browse-repo-button"]');
    await expect(page.locator('[data-testid="file-browser-modal"]')).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="file-browser-modal"]')).not.toBeVisible();
  });
});
```

## Dependencies

- All TASK-116 through TASK-125

## Blocked By

- All frontend file browser tasks must be complete
