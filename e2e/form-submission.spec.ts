import { test, expect } from '@playwright/test';

/**
 * E2E tests for RepoInput form submission (TASK-004)
 * Tests the form on the home page and navigation to the blame view
 */
test.describe('RepoInput Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render form with all required inputs', async ({ page }) => {
    // Arrange & Act - page is already loaded in beforeEach

    // Assert - form elements are visible
    await expect(page.getByRole('heading', { name: 'Git Blame Viewer' })).toBeVisible();
    await expect(page.getByLabel('Repository Path')).toBeVisible();
    await expect(page.getByLabel('File Path')).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Blame' })).toBeVisible();
  });

  test('should allow typing in input fields', async ({ page }) => {
    // Arrange
    const repoInput = page.getByLabel('Repository Path');
    const fileInput = page.getByLabel('File Path');

    // Act
    await repoInput.fill('/path/to/repo');
    await fileInput.fill('src/file.ts');

    // Assert
    await expect(repoInput).toHaveValue('/path/to/repo');
    await expect(fileInput).toHaveValue('src/file.ts');
  });

  test('should navigate to /blame with query params on form submission', async ({ page }) => {
    // Arrange
    const testRepoPath = '/root/web-app/test-fixtures/sample-repo';
    const testFilePath = 'src/main.ts';

    // Act - fill form and submit
    await page.getByLabel('Repository Path').fill(testRepoPath);
    await page.getByLabel('File Path').fill(testFilePath);
    await page.getByRole('button', { name: 'View Blame' }).click();

    // Assert - should navigate to blame page with correct params
    await expect(page).toHaveURL(
      `/blame?repo=${encodeURIComponent(testRepoPath)}&file=${encodeURIComponent(testFilePath)}`
    );
    await expect(page.getByRole('heading', { name: 'Blame View' })).toBeVisible();
    await expect(page.getByText(testRepoPath)).toBeVisible();
    await expect(page.getByText(testFilePath)).toBeVisible();
  });

  test('should handle empty submission and navigate with empty params', async ({ page }) => {
    // Arrange - form already rendered with empty inputs

    // Act - submit without filling inputs
    await page.getByRole('button', { name: 'View Blame' }).click();

    // Assert - should navigate to blame page (form allows empty submission)
    await expect(page).toHaveURL('/blame?repo=&file=');
  });
});

test.describe('Blame Page - Missing Parameters', () => {
  test('should show error when repo param is missing', async ({ page }) => {
    // Arrange & Act - navigate directly to blame page without repo param
    await page.goto('/blame?file=src/main.ts');

    // Assert - should show error message
    await expect(page.getByRole('heading', { name: 'Missing Parameters' })).toBeVisible();
    await expect(
      page.getByText('Repository path and file path are required.')
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
  });

  test('should show error when file param is missing', async ({ page }) => {
    // Arrange & Act - navigate directly to blame page without file param
    await page.goto('/blame?repo=/path/to/repo');

    // Assert - should show error message
    await expect(page.getByRole('heading', { name: 'Missing Parameters' })).toBeVisible();
    await expect(
      page.getByText('Repository path and file path are required.')
    ).toBeVisible();
  });

  test('should show error when both params are missing', async ({ page }) => {
    // Arrange & Act - navigate directly to blame page without any params
    await page.goto('/blame');

    // Assert - should show error message
    await expect(page.getByRole('heading', { name: 'Missing Parameters' })).toBeVisible();
    await expect(
      page.getByText('Repository path and file path are required.')
    ).toBeVisible();
  });

  test('should navigate back to home when clicking Go Back link', async ({ page }) => {
    // Arrange - navigate to blame page without params
    await page.goto('/blame');

    // Act - click Go Back link
    await page.getByRole('link', { name: 'Go Back' }).click();

    // Assert - should be back on home page
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Git Blame Viewer' })).toBeVisible();
  });
});

test.describe('Blame Page - Valid Parameters', () => {
  test('should display repository and file info when params are provided', async ({ page }) => {
    // Arrange
    const repoPath = '/root/web-app/test-fixtures/sample-repo';
    const filePath = 'src/main.ts';

    // Act
    await page.goto(`/blame?repo=${encodeURIComponent(repoPath)}&file=${encodeURIComponent(filePath)}`);

    // Assert - should display the blame view with repo/file info
    await expect(page.getByRole('heading', { name: 'Blame View' })).toBeVisible();
    await expect(page.getByText(repoPath)).toBeVisible();
    await expect(page.getByText(filePath)).toBeVisible();
  });

  test('should have back link to home page', async ({ page }) => {
    // Arrange
    await page.goto('/blame?repo=/test&file=test.ts');

    // Act - click back link
    await page.getByRole('link', { name: '← Back to Home' }).click();

    // Assert
    await expect(page).toHaveURL('/');
  });
});
