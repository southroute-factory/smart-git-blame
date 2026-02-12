import { test, expect } from '@playwright/test';

/**
 * E2E tests for Merge Context functionality (TASK-024)
 *
 * Tests the merge context panel that shows information about how a commit
 * was merged into the main branch. The sample-repo has:
 * - Merge commit: 4e73d3c (merged feature/divide-function branch)
 *   - Contains commit: 2d766cb (Add divide function with zero check)
 * - Direct commits: 32f2f38 (Initial commit), cd36886 (Add subtract function)
 *
 * Test scenarios:
 * 1. Clicking on a merged commit shows merge context info
 * 2. Merge commit SHA is displayed
 * 3. List of commits in the merge is shown
 * 4. Direct commits don't show merge context
 */

const TEST_REPO = '/root/web-app/test-fixtures/sample-repo';
const TEST_FILE = 'src/example.ts';

// Sample repo commit data
const MERGE_COMMIT = {
  sha: '4e73d3c',
  fullSha: '4e73d3c56185e50853917cf852dcf6f2a80436cb',
  message: 'Merge feature/divide-function: Add divide functionality',
};

const MERGED_COMMIT = {
  sha: '2d766cb',
  fullSha: '2d766cb17eedfaf87f5b5f62e76ec220c48d0b6a',
  author: 'Charlie Coder',
  message: 'Add divide function with zero check',
  lineRange: { start: 16, end: 22 }, // Lines attributed to this commit
};

const DIRECT_COMMITS = [
  {
    sha: '32f2f38',
    fullSha: '32f2f383ce79f51e7faa7b18cee7a52cd194941c',
    author: 'Alice Developer',
    lineRange: { start: 1, end: 11 },
  },
  {
    sha: 'cd36886',
    fullSha: 'cd36886384ce625c19d5508b43a7a651ebbe55e8',
    author: 'Bob Engineer',
    lineRange: { start: 12, end: 15 },
  },
];

test.describe('Merge Context - Merged Commits', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to blame page with test fixtures
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Wait for blame view to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should show merge context when clicking on a merged commit line', async ({ page }) => {
    // Arrange - get a row from a commit that was merged (line 16, Charlie's commit)
    const rows = page.locator('table[role="grid"] tbody tr');
    const mergedRow = rows.nth(MERGED_COMMIT.lineRange.start - 1); // Line 16 (0-indexed: 15)

    // Act - click on the row
    await mergedRow.click();

    // Assert - commit panel should open
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - merge context section should be visible
    const mergeContextSection = page.locator('[data-testid="merge-context"]');
    await expect(mergeContextSection).toBeVisible();
  });

  test('should display merge commit SHA for merged commits', async ({ page }) => {
    // Arrange - click on a line from the merged commit
    const rows = page.locator('table[role="grid"] tbody tr');
    const mergedRow = rows.nth(MERGED_COMMIT.lineRange.start - 1);

    // Act
    await mergedRow.click();

    // Assert - commit panel is visible
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - merge commit SHA is displayed
    const mergeShaElement = page.locator('[data-testid="merge-context-sha"]');
    await expect(mergeShaElement).toBeVisible();

    const mergeShaText = await mergeShaElement.textContent();
    expect(mergeShaText).toContain(MERGE_COMMIT.sha);
  });

  test('should display list of commits in the merge', async ({ page }) => {
    // Arrange - click on a line from the merged commit
    const rows = page.locator('table[role="grid"] tbody tr');
    const mergedRow = rows.nth(MERGED_COMMIT.lineRange.start - 1);

    // Act
    await mergedRow.click();

    // Assert - commit panel is visible
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - commits in merge list is visible
    const commitsInMergeSection = page.locator('[data-testid="commits-in-merge"]');
    await expect(commitsInMergeSection).toBeVisible();

    // Assert - the merged commit should be in the list
    const commitList = page.locator('[data-testid="commits-in-merge"] [data-testid="merge-commit-item"]');
    const commitCount = await commitList.count();
    expect(commitCount).toBeGreaterThanOrEqual(1);

    // Verify the merged commit SHA is shown
    const commitItem = commitList.first();
    const itemText = await commitItem.textContent();
    expect(itemText).toContain(MERGED_COMMIT.sha);
  });

  test('should display merge commit message', async ({ page }) => {
    // Arrange - click on a line from the merged commit
    const rows = page.locator('table[role="grid"] tbody tr');
    const mergedRow = rows.nth(MERGED_COMMIT.lineRange.start - 1);

    // Act
    await mergedRow.click();

    // Assert - commit panel is visible
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - merge commit message is displayed
    const mergeMessageElement = page.locator('[data-testid="merge-context-message"]');
    await expect(mergeMessageElement).toBeVisible();

    const messageText = await mergeMessageElement.textContent();
    // Check for keywords from the merge message
    expect(messageText).toMatch(/merge|divide/i);
  });
});

test.describe('Merge Context - Direct Commits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should not show merge context for direct commits', async ({ page }) => {
    // Arrange - click on a line from Alice's direct commit (line 1)
    const rows = page.locator('table[role="grid"] tbody tr');
    const directCommitRow = rows.nth(DIRECT_COMMITS[0].lineRange.start - 1);

    // Act
    await directCommitRow.click();

    // Assert - commit panel is visible
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - merge context section should NOT be visible for direct commits
    const mergeContextSection = page.locator('[data-testid="merge-context"]');
    await expect(mergeContextSection).not.toBeVisible();
  });

  test('should show direct commit indicator for commits made directly to main', async ({
    page,
  }) => {
    // Arrange - click on a line from Bob's direct commit (line 12)
    const rows = page.locator('table[role="grid"] tbody tr');
    const directCommitRow = rows.nth(DIRECT_COMMITS[1].lineRange.start - 1);

    // Act
    await directCommitRow.click();

    // Assert - commit panel is visible
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - direct commit indicator should be visible
    const directCommitIndicator = page.locator('[data-testid="direct-commit-indicator"]');
    await expect(directCommitIndicator).toBeVisible();

    // Verify it indicates direct commit status
    const indicatorText = await directCommitIndicator.textContent();
    expect(indicatorText).toMatch(/direct|main/i);
  });

  test('should correctly identify Alice\'s initial commit as direct', async ({ page }) => {
    // Arrange - click on line 1 (Alice's initial commit)
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act
    await firstRow.click();

    // Assert - panel opens
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - SHA matches Alice's commit
    const shaElement = page.locator('[data-testid="commit-sha"]');
    await expect(shaElement).toBeVisible();

    const shaText = await shaElement.textContent();
    expect(shaText).toContain(DIRECT_COMMITS[0].sha);

    // Assert - no merge context
    const mergeContextSection = page.locator('[data-testid="merge-context"]');
    await expect(mergeContextSection).not.toBeVisible();
  });
});

test.describe('Merge Context - Clicking on Merge Commit Itself', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should show self-merge info when clicking on line from merge commit author', async ({
    page,
  }) => {
    // Note: In this test repo, the merge commit 4e73d3c doesn't have lines
    // directly attributed to it (the lines are from 2d766cb which was merged).
    // This test verifies that when viewing a commit that was merged,
    // we can see its merge context.

    // The merged commit (2d766cb) should show it was merged via 4e73d3c
    const rows = page.locator('table[role="grid"] tbody tr');
    const mergedRow = rows.nth(MERGED_COMMIT.lineRange.start - 1);

    await mergedRow.click();

    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Verify the merge context shows the merge commit info
    const mergeContextSection = page.locator('[data-testid="merge-context"]');
    await expect(mergeContextSection).toBeVisible();

    // The merge SHA should be visible
    const mergeSha = page.locator('[data-testid="merge-context-sha"]');
    await expect(mergeSha).toBeVisible();

    const shaText = await mergeSha.textContent();
    expect(shaText).toContain(MERGE_COMMIT.sha);
  });
});

test.describe('Merge Context - API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should fetch merge context from API when clicking a line', async ({ page }) => {
    // Arrange - intercept the merge API call
    let mergeApiCalled = false;
    let apiRequestSha = '';

    await page.route('**/api/merge**', async (route) => {
      mergeApiCalled = true;
      const url = new URL(route.request().url());
      apiRequestSha = url.searchParams.get('sha') || '';
      await route.continue();
    });

    // Act - click on a row
    const rows = page.locator('table[role="grid"] tbody tr');
    const mergedRow = rows.nth(MERGED_COMMIT.lineRange.start - 1);
    await mergedRow.click();

    // Wait for panel to be visible
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Allow time for API call
    await page.waitForTimeout(500);

    // Assert - API was called with correct SHA
    expect(mergeApiCalled).toBe(true);
    expect(apiRequestSha).toContain(MERGED_COMMIT.sha);
  });

  test('should show loading state while fetching merge context', async ({ page }) => {
    // Arrange - delay the merge API response
    await page.route('**/api/merge**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    // Act - click on a row
    const rows = page.locator('table[role="grid"] tbody tr');
    const mergedRow = rows.nth(MERGED_COMMIT.lineRange.start - 1);
    await mergedRow.click();

    // Assert - loading indicator should be visible
    const loadingIndicator = page.locator('[data-testid="merge-context-loading"]');
    await expect(loadingIndicator).toBeVisible();

    // Eventually content should load
    const mergeContextSection = page.locator('[data-testid="merge-context"]');
    await expect(mergeContextSection).toBeVisible({ timeout: 10000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Arrange - mock API to return error
    await page.route('**/api/merge**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Act - click on a row
    const rows = page.locator('table[role="grid"] tbody tr');
    const mergedRow = rows.nth(MERGED_COMMIT.lineRange.start - 1);
    await mergedRow.click();

    // Wait for panel
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - panel should still be functional, merge context may show error or be hidden
    // The main commit info should still be visible
    const shaElement = page.locator('[data-testid="commit-sha"]');
    await expect(shaElement).toBeVisible();
  });
});

test.describe('Merge Context - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Open panel with merged commit
    const rows = page.locator('table[role="grid"] tbody tr');
    const mergedRow = rows.nth(MERGED_COMMIT.lineRange.start - 1);
    await mergedRow.click();
  });

  test('merge context section should have proper heading structure', async ({ page }) => {
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Merge context should have a heading for screen readers
    const mergeHeading = commitPanel.locator('[data-testid="merge-context"] h3, [data-testid="merge-context"] h4');
    await expect(mergeHeading).toBeVisible();
  });

  test('commits in merge list should be accessible', async ({ page }) => {
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Commits list should be a proper list structure
    const commitsList = page.locator('[data-testid="commits-in-merge"]');
    await expect(commitsList).toBeVisible();

    // Each commit item should be identifiable
    const commitItems = commitsList.locator('[data-testid="merge-commit-item"]');
    const count = await commitItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
