# TASK-040: E2E tests for validation

| Field | Value |
|-------|-------|
| **Task ID** | TASK-040 |
| **Story** | STORY-006 |
| **Owner** | QAA |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Create comprehensive E2E tests to verify validation behavior across the application.

## Acceptance Criteria

- [ ] Test empty form submission shows errors
- [ ] Test invalid repo path shows appropriate error
- [ ] Test non-existent file shows error
- [ ] Test valid inputs proceed to blame view
- [ ] Test error messages clear on correction
- [ ] Test path traversal attempts are blocked

## Technical Notes

- Use Playwright for E2E testing
- Test both client-side and server-side validation
- Include edge cases and security tests

## Test Cases

```typescript
test.describe('Form Validation', () => {
  test('shows error for empty repo path', async ({ page }) => {
    await page.goto('/');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="repo-error"]'))
      .toContainText('Repository path is required');
  });
  
  test('shows error for non-existent repo', async ({ page }) => {
    await page.fill('[name="repo"]', '/nonexistent/path');
    await page.fill('[name="file"]', 'file.txt');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="repo-error"]'))
      .toContainText('does not exist');
  });
  
  test('blocks path traversal attempts', async ({ page }) => {
    await page.fill('[name="repo"]', '../../../etc');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="repo-error"]'))
      .toContainText('Invalid path');
  });
});
```

## Dependencies

- TASK-037 (Client-side validation)
- TASK-038 (Error display)
- TASK-039 (API error handling)

## Blocked By

- TASK-038
- TASK-039
