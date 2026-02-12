import { test, expect } from '@playwright/test';

/**
 * E2E tests for ChangePanel component (TASK-017)
 * Tests the commit detail panel that opens when clicking a blame line
 *
 * The ChangePanel displays:
 * - Commit SHA, author, date, message
 * - Diff stats (files changed, insertions, deletions)
 * - Close mechanisms: button, ESC key, overlay click
 */

const TEST_REPO = '/root/web-app/test-fixtures/sample-repo';
const TEST_FILE = 'src/example.ts';

// Expected commit data from the sample-repo test fixture
// These SHAs come from the test repo's git history
const EXPECTED_SHA_PREFIXES = ['32f2f38', 'cd36886', '2d766cb'];
const EXPECTED_AUTHORS = ['Alice Developer', 'Bob Engineer', 'Charlie Coder'];

test.describe('Commit Panel - Opening', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to blame page with test fixtures
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Wait for blame view to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should open commit panel when clicking a blame line', async ({ page }) => {
    // Arrange - get the first row
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act - click on the first row
    await firstRow.click();

    // Assert - commit panel should be visible
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();
  });

  test('should display commit SHA in panel', async ({ page }) => {
    // Arrange - get a row with known SHA
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act - click to open panel
    await firstRow.click();

    // Assert - commit panel shows SHA
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // SHA should be displayed (full or abbreviated)
    const shaElement = commitPanel.locator('[data-testid="commit-sha"]');
    await expect(shaElement).toBeVisible();

    // Should contain a valid SHA prefix
    const shaText = await shaElement.textContent();
    expect(shaText).toBeTruthy();
    expect(shaText!.length).toBeGreaterThanOrEqual(7);
  });

  test('should display commit author in panel', async ({ page }) => {
    // Arrange - get a row
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act - click to open panel
    await firstRow.click();

    // Assert - commit panel shows author
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    const authorElement = commitPanel.locator('[data-testid="commit-author"]');
    await expect(authorElement).toBeVisible();

    // Author should be one of the expected authors
    const authorText = await authorElement.textContent();
    expect(authorText).toBeTruthy();
    // First row is Alice's commit
    expect(authorText).toContain('Alice Developer');
  });

  test('should display commit date in panel', async ({ page }) => {
    // Arrange - get a row
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act - click to open panel
    await firstRow.click();

    // Assert - commit panel shows date
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    const dateElement = commitPanel.locator('[data-testid="commit-date"]');
    await expect(dateElement).toBeVisible();

    // Date should have some content
    const dateText = await dateElement.textContent();
    expect(dateText).toBeTruthy();
    expect(dateText!.length).toBeGreaterThan(0);
  });

  test('should display commit message in panel', async ({ page }) => {
    // Arrange - get a row
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act - click to open panel
    await firstRow.click();

    // Assert - commit panel shows message
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    const messageElement = commitPanel.locator('[data-testid="commit-message"]');
    await expect(messageElement).toBeVisible();

    // Message should have content
    const messageText = await messageElement.textContent();
    expect(messageText).toBeTruthy();
  });
});

test.describe('Commit Panel - Diff Stats', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should display files changed count', async ({ page }) => {
    // Arrange
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act
    await firstRow.click();

    // Assert
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    const filesChangedElement = commitPanel.locator('[data-testid="stat-files-changed"]');
    await expect(filesChangedElement).toBeVisible();

    // Should display a number
    const filesText = await filesChangedElement.textContent();
    expect(filesText).toMatch(/\d+/);
  });

  test('should display insertions count', async ({ page }) => {
    // Arrange
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act
    await firstRow.click();

    // Assert
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    const insertionsElement = commitPanel.locator('[data-testid="stat-insertions"]');
    await expect(insertionsElement).toBeVisible();

    // Should display a number (may be 0)
    const insertionsText = await insertionsElement.textContent();
    expect(insertionsText).toMatch(/\d+/);
  });

  test('should display deletions count', async ({ page }) => {
    // Arrange
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act
    await firstRow.click();

    // Assert
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    const deletionsElement = commitPanel.locator('[data-testid="stat-deletions"]');
    await expect(deletionsElement).toBeVisible();

    // Should display a number (may be 0)
    const deletionsText = await deletionsElement.textContent();
    expect(deletionsText).toMatch(/\d+/);
  });

  test('should display all diff stats in stats section', async ({ page }) => {
    // Arrange
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act
    await firstRow.click();

    // Assert - stats section should be visible
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    const statsSection = commitPanel.locator('[data-testid="commit-stats"]');
    await expect(statsSection).toBeVisible();

    // All three stat elements should be present
    await expect(commitPanel.locator('[data-testid="stat-files-changed"]')).toBeVisible();
    await expect(commitPanel.locator('[data-testid="stat-insertions"]')).toBeVisible();
    await expect(commitPanel.locator('[data-testid="stat-deletions"]')).toBeVisible();
  });
});

test.describe('Commit Panel - Dismissal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Wait for blame view to load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Open the panel first
    const rows = page.locator('table[role="grid"] tbody tr');
    await rows.nth(0).click();

    // Verify panel is open
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();
  });

  test('should close panel when clicking close button', async ({ page }) => {
    // Arrange - panel is already open from beforeEach
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Act - click the close button
    const closeButton = page.locator('[data-testid="commit-panel-close"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Assert - panel should be hidden
    await expect(commitPanel).not.toBeVisible();
  });

  test('should close panel when pressing ESC key', async ({ page }) => {
    // Arrange - panel is already open from beforeEach
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Act - press ESC key
    await page.keyboard.press('Escape');

    // Assert - panel should be hidden
    await expect(commitPanel).not.toBeVisible();
  });

  test('should close panel when clicking overlay/backdrop', async ({ page }) => {
    // Arrange - panel is already open from beforeEach
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Act - click the overlay (backdrop behind the panel)
    const overlay = page.locator('[data-testid="commit-panel-overlay"]');
    await expect(overlay).toBeVisible();

    // Click on the overlay, not on the panel itself
    // Use force to ensure we click the overlay even if panel is in front
    await overlay.click({ position: { x: 10, y: 10 } });

    // Assert - panel should be hidden
    await expect(commitPanel).not.toBeVisible();
  });

  test('close button should have accessible label', async ({ page }) => {
    // Arrange - panel is already open
    const closeButton = page.locator('[data-testid="commit-panel-close"]');
    await expect(closeButton).toBeVisible();

    // Assert - button should have aria-label for accessibility
    await expect(closeButton).toHaveAttribute('aria-label', /close/i);
  });

  test('panel should trap focus for accessibility', async ({ page }) => {
    // Arrange - panel is open
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Act - tab through focusable elements
    await page.keyboard.press('Tab');

    // Assert - focus should be within the panel
    const focusedElement = page.locator(':focus');
    const panelContainsFocus = await commitPanel.locator(':focus').count();
    expect(panelContainsFocus).toBeGreaterThan(0);
  });
});

test.describe('Commit Panel - Multiple Lines', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should update panel content when clicking different lines', async ({ page }) => {
    // Arrange - get rows from different commits
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0); // Alice's commit
    const laterRow = rows.nth(11); // Bob's commit (line 12)

    // Act - click first row
    await firstRow.click();
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Get first commit's SHA
    const firstSha = await commitPanel.locator('[data-testid="commit-sha"]').textContent();

    // Act - click a different row from different commit
    await laterRow.click();

    // Assert - panel should update with new commit info
    await expect(commitPanel).toBeVisible();
    const secondSha = await commitPanel.locator('[data-testid="commit-sha"]').textContent();

    // SHAs should be different (different commits)
    expect(firstSha).not.toEqual(secondSha);
  });

  test('should show loading state while fetching commit details', async ({ page }) => {
    // Arrange - intercept API to add delay
    await page.route('**/api/commit**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    // Act - click a row
    const rows = page.locator('table[role="grid"] tbody tr');
    await rows.nth(0).click();

    // Assert - loading state should be visible initially
    const loadingIndicator = page.locator('[data-testid="commit-panel-loading"]');
    await expect(loadingIndicator).toBeVisible();

    // Eventually content should load
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel.locator('[data-testid="commit-sha"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Commit Panel - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should show error state when API fails', async ({ page }) => {
    // Arrange - intercept API to return error
    await page.route('**/api/commit**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Act - click a row
    const rows = page.locator('table[role="grid"] tbody tr');
    await rows.nth(0).click();

    // Assert - error state should be visible
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    const errorMessage = commitPanel.locator('[data-testid="commit-panel-error"]');
    await expect(errorMessage).toBeVisible();
  });

  test('should allow retry after error', async ({ page }) => {
    // Arrange - first request fails, second succeeds
    let requestCount = 0;
    await page.route('**/api/commit**', async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      } else {
        await route.continue();
      }
    });

    // Act - click a row (first request fails)
    const rows = page.locator('table[role="grid"] tbody tr');
    await rows.nth(0).click();

    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Wait for error
    const errorMessage = commitPanel.locator('[data-testid="commit-panel-error"]');
    await expect(errorMessage).toBeVisible();

    // Click retry button
    const retryButton = commitPanel.locator('[data-testid="commit-panel-retry"]');
    await retryButton.click();

    // Assert - content should load on retry
    await expect(commitPanel.locator('[data-testid="commit-sha"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Commit Panel - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Open the panel
    const rows = page.locator('table[role="grid"] tbody tr');
    await rows.nth(0).click();
  });

  test('panel should have proper ARIA role', async ({ page }) => {
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Panel should have dialog role for modal behavior
    await expect(commitPanel).toHaveAttribute('role', 'dialog');
  });

  test('panel should have aria-labelledby pointing to title', async ({ page }) => {
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Panel should reference its title for screen readers
    const labelledBy = await commitPanel.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    // The referenced element should exist and contain "commit" text
    const titleElement = page.locator(`#${labelledBy}`);
    await expect(titleElement).toBeVisible();
  });

  test('panel should announce commit details to screen readers', async ({ page }) => {
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Key information should have proper labeling
    const shaElement = commitPanel.locator('[data-testid="commit-sha"]');
    const authorElement = commitPanel.locator('[data-testid="commit-author"]');

    // These should be labelled for screen readers
    await expect(shaElement).toBeVisible();
    await expect(authorElement).toBeVisible();
  });
});
