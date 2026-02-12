import { test, expect } from '@playwright/test';

/**
 * E2E tests for form validation and API error handling (TASK-040)
 * Tests input validation, error message display, and API error responses
 */

const TEST_REPO = '/root/web-app/test-fixtures/sample-repo';
const TEST_FILE = 'src/example.ts';

test.describe('Form Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show error when repository path is empty on blur', async ({ page }) => {
    // Arrange
    const repoInput = page.getByLabel('Repository Path');
    
    // Act - focus and blur without entering value
    await repoInput.focus();
    await repoInput.blur();
    
    // Assert - error message should be visible
    await expect(page.getByText('Repository path is required')).toBeVisible();
  });

  test('should show error when file path is empty on blur', async ({ page }) => {
    // Arrange
    const fileInput = page.getByLabel('File Path');
    
    // Act - focus and blur without entering value
    await fileInput.focus();
    await fileInput.blur();
    
    // Assert - error message should be visible
    await expect(page.getByText('File path is required')).toBeVisible();
  });

  test('should show both errors when form submitted empty', async ({ page }) => {
    // Act - submit form without filling any fields
    await page.getByRole('button', { name: 'View Blame' }).click();
    
    // Assert - both error messages should be visible
    await expect(page.getByText('Repository path is required')).toBeVisible();
    await expect(page.getByText('File path is required')).toBeVisible();
  });

  test('should clear error when user starts typing valid input', async ({ page }) => {
    // Arrange - trigger error first
    const repoInput = page.getByLabel('Repository Path');
    await repoInput.focus();
    await repoInput.blur();
    await expect(page.getByText('Repository path is required')).toBeVisible();
    
    // Act - start typing valid input
    await repoInput.fill('/valid/path');
    
    // Assert - error should be cleared
    await expect(page.getByText('Repository path is required')).not.toBeVisible();
  });

  test('should indicate invalid state via aria-invalid attribute', async ({ page }) => {
    // Arrange
    const repoInput = page.getByLabel('Repository Path');
    
    // Act - trigger validation error
    await repoInput.focus();
    await repoInput.blur();
    
    // Assert - aria-invalid should be true
    await expect(repoInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should disable submit button when validation errors exist', async ({ page }) => {
    // Arrange
    const submitButton = page.getByRole('button', { name: 'View Blame' });
    
    // Act - trigger validation errors on both fields
    await page.getByLabel('Repository Path').focus();
    await page.getByLabel('Repository Path').blur();
    await page.getByLabel('File Path').focus();
    await page.getByLabel('File Path').blur();
    
    // Assert - button should be disabled
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when errors are fixed', async ({ page }) => {
    // Arrange - trigger errors first
    const repoInput = page.getByLabel('Repository Path');
    const fileInput = page.getByLabel('File Path');
    const submitButton = page.getByRole('button', { name: 'View Blame' });
    
    await repoInput.focus();
    await repoInput.blur();
    await fileInput.focus();
    await fileInput.blur();
    await expect(submitButton).toBeDisabled();
    
    // Act - fix the errors
    await repoInput.fill('/valid/repo');
    await fileInput.fill('valid/file.ts');
    
    // Assert - button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should prevent form submission when validation fails', async ({ page }) => {
    // Arrange - empty form
    const submitButton = page.getByRole('button', { name: 'View Blame' });
    
    // Act - try to submit
    await submitButton.click();
    
    // Assert - should stay on home page (not navigate)
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Git Blame Viewer' })).toBeVisible();
  });

  test('should allow submission with valid inputs', async ({ page }) => {
    // Arrange
    await page.getByLabel('Repository Path').fill(TEST_REPO);
    await page.getByLabel('File Path').fill(TEST_FILE);
    
    // Act
    await page.getByRole('button', { name: 'View Blame' }).click();
    
    // Assert - should navigate to blame page
    await expect(page).toHaveURL(/\/blame\?/);
    await expect(page.getByRole('heading', { name: 'Blame View' })).toBeVisible();
  });

  test('should show error for path with invalid characters', async ({ page }) => {
    // Arrange
    const repoInput = page.getByLabel('Repository Path');
    
    // Act - enter path with control character (simulated as empty after invalid chars stripped)
    await repoInput.fill('/path\x00with\x00null');
    await repoInput.blur();
    
    // Assert - error for invalid characters should show
    await expect(page.getByText(/invalid characters/i)).toBeVisible();
  });
});

test.describe('API Error Handling - Invalid Repository', () => {
  test('should display error for non-existent repository', async ({ page }) => {
    // Arrange & Act - navigate directly to blame with invalid repo
    await page.goto('/blame?repo=/nonexistent/repo/path&file=file.ts');
    
    // Assert - should show error alert
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(page.getByText(/does not exist|not found|invalid/i)).toBeVisible();
  });

  test('should display error for directory that is not a git repo', async ({ page }) => {
    // Arrange & Act - use /tmp which exists but is not a git repo
    await page.goto('/blame?repo=/tmp&file=somefile.ts');
    
    // Assert - should show error about not being a git repository
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(page.getByText(/not a git repository|not found|invalid/i)).toBeVisible();
  });

  test('should style repository errors appropriately', async ({ page }) => {
    // Arrange & Act
    await page.goto('/blame?repo=/nonexistent/repo&file=file.ts');
    
    // Assert - error styling should be applied
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    
    // Should have appropriate error styling (amber for not_found)
    await expect(errorAlert).toHaveClass(/border-amber-|border-red-/);
  });
});

test.describe('API Error Handling - Invalid File', () => {
  test('should display error for non-existent file', async ({ page }) => {
    // Arrange & Act - valid repo, invalid file
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=nonexistent/file.ts`
    );
    
    // Assert - should show file not found error
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(page.getByText(/file not found|not found/i)).toBeVisible();
  });

  test('should display error for file with path traversal', async ({ page }) => {
    // Arrange & Act - attempt path traversal
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent('../../../etc/passwd')}`
    );
    
    // Assert - should show validation error
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(page.getByText(/traversal|invalid|not found/i)).toBeVisible();
  });

  test('should display error for untracked file', async ({ page }) => {
    // This test assumes there might be untracked files
    // The error should indicate the file is not found in the repo
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=untracked-file-that-does-not-exist.ts`
    );
    
    // Assert
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});

test.describe('API Error Handling - Validation Errors', () => {
  test('should display error for empty repo parameter', async ({ page }) => {
    // Arrange & Act
    await page.goto('/blame?repo=&file=file.ts');
    
    // Assert - should show missing parameters error (client-side)
    await expect(page.getByText(/Missing Parameters|required/i)).toBeVisible();
  });

  test('should display error for empty file parameter', async ({ page }) => {
    // Arrange & Act
    await page.goto(`/blame?repo=${encodeURIComponent(TEST_REPO)}&file=`);
    
    // Assert - should show missing parameters error (client-side)
    await expect(page.getByText(/Missing Parameters|required/i)).toBeVisible();
  });

  test('should display error for relative repo path', async ({ page }) => {
    // Arrange & Act - relative path should fail validation
    await page.goto('/blame?repo=relative/path&file=file.ts');
    
    // Assert - should show validation error about absolute path
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(page.getByText(/absolute|invalid|not found/i)).toBeVisible();
  });

  test('should display error for absolute file path', async ({ page }) => {
    // Arrange & Act - absolute file path should fail
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent('/absolute/file.ts')}`
    );
    
    // Assert - should show validation error
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(page.getByText(/relative|invalid|not found/i)).toBeVisible();
  });
});

test.describe('Error Recovery', () => {
  test('should allow navigating back to home from error state', async ({ page }) => {
    // Arrange - trigger an error
    await page.goto('/blame?repo=/invalid/repo&file=file.ts');
    await expect(page.locator('[role="alert"]')).toBeVisible();
    
    // Act - click back link
    await page.getByRole('link', { name: /Back to Home/i }).click();
    
    // Assert - should be on home page
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Git Blame Viewer' })).toBeVisible();
  });

  test('should show retry button for server errors', async ({ page }) => {
    // Arrange - intercept and return 500 error
    await page.route('**/api/blame**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      });
    });
    
    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );
    
    // Assert - should show error with retry button
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
  });

  test('should attempt retry when retry button clicked', async ({ page }) => {
    let requestCount = 0;
    
    // Arrange - fail first request, succeed on retry
    await page.route('**/api/blame**', (route) => {
      requestCount++;
      if (requestCount === 1) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
        });
      } else {
        route.continue();
      }
    });
    
    // Act - trigger initial error
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );
    
    // Assert - error displayed
    await expect(page.locator('[role="alert"]')).toBeVisible();
    
    // Act - click retry
    await page.getByRole('button', { name: /try again/i }).click();
    
    // Assert - should have made a second request and loaded successfully
    await expect(page.locator('table[role="grid"]')).toBeVisible({ timeout: 10000 });
    expect(requestCount).toBe(2);
  });

  test('should show network error styling for fetch failures', async ({ page }) => {
    // Arrange - abort the request to simulate network error
    await page.route('**/api/blame**', (route) => {
      route.abort('failed');
    });
    
    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );
    
    // Assert - should show network error
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    // Network errors should have blue styling
    await expect(errorAlert).toHaveClass(/border-blue-|border-red-/);
  });
});

test.describe('Error Accessibility', () => {
  test('error messages should have alert role', async ({ page }) => {
    // Act
    await page.goto('/blame?repo=/invalid&file=file.ts');
    
    // Assert - error container should have role="alert"
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
  });

  test('error messages should have aria-live for screen readers', async ({ page }) => {
    // Act
    await page.goto('/blame?repo=/invalid&file=file.ts');
    
    // Assert - should have aria-live attribute
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
  });

  test('form validation errors should be associated with inputs', async ({ page }) => {
    // Arrange
    await page.goto('/');
    const repoInput = page.getByLabel('Repository Path');
    
    // Act - trigger error
    await repoInput.focus();
    await repoInput.blur();
    
    // Assert - input should reference error via aria-describedby
    await expect(repoInput).toHaveAttribute('aria-describedby', 'repo-path-error');
    
    // The error message element should exist with that ID
    const errorElement = page.locator('#repo-path-error');
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toHaveAttribute('role', 'alert');
  });
});
