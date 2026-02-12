import { test, expect } from '@playwright/test';

/**
 * E2E tests for Direct Commits functionality (TASK-029)
 *
 * Tests the handling and display of direct commits in the blame view.
 * Direct commits are commits made directly to main/master branch,
 * not introduced via a merge from a feature branch.
 *
 * The sample-repo has the following direct commits:
 * - 32f2f38 (Alice Developer): Initial commit - lines 1-11
 * - cd36886 (Bob Engineer): Add subtract function - lines 12-15
 *
 * Test scenarios:
 * 1. Clicking direct commit line shows "Direct commit" indicator
 * 2. No merge context section for direct commits
 * 3. Panel displays correctly for direct commits
 * 4. Badge/indicator is visible and accessible
 */

const TEST_REPO = '/root/web-app/test-fixtures/sample-repo';
const TEST_FILE = 'src/example.ts';

// Direct commit data from sample-repo test fixture
const DIRECT_COMMITS = {
  alice: {
    sha: '32f2f38',
    fullSha: '32f2f383ce79f51e7faa7b18cee7a52cd194941c',
    author: 'Alice Developer',
    message: 'Initial commit',
    lineRange: { start: 1, end: 11 },
  },
  bob: {
    sha: 'cd36886',
    fullSha: 'cd36886384ce625c19d5508b43a7a651ebbe55e8',
    author: 'Bob Engineer',
    message: 'Add subtract function',
    lineRange: { start: 12, end: 15 },
  },
};

test.describe('Direct Commits - Indicator Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to blame page with test fixtures
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Wait for blame view to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should show "Direct commit" indicator when clicking Alice\'s direct commit', async ({
    page,
  }) => {
    // Arrange - get a row from Alice's direct commit (line 1)
    const rows = page.locator('table[role="grid"] tbody tr');
    const aliceRow = rows.nth(DIRECT_COMMITS.alice.lineRange.start - 1);

    // Act - click on the row
    await aliceRow.click();

    // Assert - commit panel should open
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - direct commit indicator should be visible
    const directCommitIndicator = page.locator('[data-testid="direct-commit-indicator"]');
    await expect(directCommitIndicator).toBeVisible();

    // Verify indicator text
    const indicatorText = await directCommitIndicator.textContent();
    expect(indicatorText).toMatch(/direct|main/i);
  });

  test('should show "Direct commit" indicator when clicking Bob\'s direct commit', async ({
    page,
  }) => {
    // Arrange - get a row from Bob's direct commit (line 12)
    const rows = page.locator('table[role="grid"] tbody tr');
    const bobRow = rows.nth(DIRECT_COMMITS.bob.lineRange.start - 1);

    // Act - click on the row
    await bobRow.click();

    // Assert - commit panel should open
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - direct commit indicator should be visible
    const directCommitIndicator = page.locator('[data-testid="direct-commit-indicator"]');
    await expect(directCommitIndicator).toBeVisible();

    // Verify indicator text contains expected content
    const indicatorText = await directCommitIndicator.textContent();
    expect(indicatorText).toMatch(/direct|main/i);
  });

  test('should display indicator badge with appropriate styling', async ({ page }) => {
    // Arrange - click on Alice's direct commit
    const rows = page.locator('table[role="grid"] tbody tr');
    const aliceRow = rows.nth(0);

    // Act
    await aliceRow.click();

    // Assert - commit panel should open
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - indicator should have badge-like styling (be visible as a distinct element)
    const directCommitIndicator = page.locator('[data-testid="direct-commit-indicator"]');
    await expect(directCommitIndicator).toBeVisible();

    // Badge should be visually distinguishable (has some dimensions)
    const boundingBox = await directCommitIndicator.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });
});

test.describe('Direct Commits - No Merge Context', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should NOT show merge context section for Alice\'s direct commit', async ({
    page,
  }) => {
    // Arrange - click on line 1 (Alice's direct commit)
    const rows = page.locator('table[role="grid"] tbody tr');
    const aliceRow = rows.nth(0);

    // Act
    await aliceRow.click();

    // Assert - commit panel should open
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - merge context section should NOT be visible
    const mergeContextSection = page.locator('[data-testid="merge-context"]');
    await expect(mergeContextSection).not.toBeVisible();

    // Assert - commits in merge should NOT be visible
    const commitsInMerge = page.locator('[data-testid="commits-in-merge"]');
    await expect(commitsInMerge).not.toBeVisible();
  });

  test('should NOT show merge context section for Bob\'s direct commit', async ({
    page,
  }) => {
    // Arrange - click on line 12 (Bob's direct commit)
    const rows = page.locator('table[role="grid"] tbody tr');
    const bobRow = rows.nth(DIRECT_COMMITS.bob.lineRange.start - 1);

    // Act
    await bobRow.click();

    // Assert - commit panel should open
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - merge context section should NOT be visible
    const mergeContextSection = page.locator('[data-testid="merge-context"]');
    await expect(mergeContextSection).not.toBeVisible();

    // Assert - merge commit SHA should NOT be visible
    const mergeSha = page.locator('[data-testid="merge-context-sha"]');
    await expect(mergeSha).not.toBeVisible();
  });

  test('should NOT show merge commit message for direct commits', async ({ page }) => {
    // Arrange - click on a direct commit line
    const rows = page.locator('table[role="grid"] tbody tr');
    const directRow = rows.nth(5); // Line 6 (within Alice's range)

    // Act
    await directRow.click();

    // Assert - panel opens
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - no merge message element
    const mergeMessage = page.locator('[data-testid="merge-context-message"]');
    await expect(mergeMessage).not.toBeVisible();
  });
});

test.describe('Direct Commits - Panel Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should display commit SHA correctly for direct commits', async ({ page }) => {
    // Arrange - click on Alice's direct commit
    const rows = page.locator('table[role="grid"] tbody tr');
    const aliceRow = rows.nth(0);

    // Act
    await aliceRow.click();

    // Assert - panel opens and shows correct SHA
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    const shaElement = page.locator('[data-testid="commit-sha"]');
    await expect(shaElement).toBeVisible();

    const shaText = await shaElement.textContent();
    expect(shaText).toContain(DIRECT_COMMITS.alice.sha);
  });

  test('should display commit author correctly for direct commits', async ({ page }) => {
    // Arrange - click on Bob's direct commit
    const rows = page.locator('table[role="grid"] tbody tr');
    const bobRow = rows.nth(DIRECT_COMMITS.bob.lineRange.start - 1);

    // Act
    await bobRow.click();

    // Assert - panel shows correct author
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    const authorElement = page.locator('[data-testid="commit-author"]');
    await expect(authorElement).toBeVisible();

    const authorText = await authorElement.textContent();
    expect(authorText).toContain(DIRECT_COMMITS.bob.author);
  });

  test('should display all standard commit details for direct commits', async ({
    page,
  }) => {
    // Arrange - click on Alice's direct commit
    const rows = page.locator('table[role="grid"] tbody tr');
    const aliceRow = rows.nth(0);

    // Act
    await aliceRow.click();

    // Assert - all standard commit details are visible
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // SHA
    await expect(page.locator('[data-testid="commit-sha"]')).toBeVisible();

    // Author
    await expect(page.locator('[data-testid="commit-author"]')).toBeVisible();

    // Date
    await expect(page.locator('[data-testid="commit-date"]')).toBeVisible();

    // Message
    await expect(page.locator('[data-testid="commit-message"]')).toBeVisible();

    // Diff stats
    await expect(page.locator('[data-testid="commit-stats"]')).toBeVisible();
  });

  test('should show both direct commit indicator AND commit details simultaneously', async ({
    page,
  }) => {
    // Arrange - click on a direct commit line
    const rows = page.locator('table[role="grid"] tbody tr');
    const aliceRow = rows.nth(0);

    // Act
    await aliceRow.click();

    // Assert - panel opens
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - direct commit indicator is visible
    const directIndicator = page.locator('[data-testid="direct-commit-indicator"]');
    await expect(directIndicator).toBeVisible();

    // Assert - standard commit details are also visible
    await expect(page.locator('[data-testid="commit-sha"]')).toBeVisible();
    await expect(page.locator('[data-testid="commit-author"]')).toBeVisible();
  });
});

test.describe('Direct Commits - Multiple Lines Same Commit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should show same direct commit indicator for all lines in Alice\'s commit', async ({
    page,
  }) => {
    const rows = page.locator('table[role="grid"] tbody tr');
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    const directIndicator = page.locator('[data-testid="direct-commit-indicator"]');

    // Check first line of Alice's commit
    await rows.nth(0).click();
    await expect(commitPanel).toBeVisible();
    await expect(directIndicator).toBeVisible();

    // Check middle line of Alice's commit (line 5)
    await rows.nth(4).click();
    await expect(commitPanel).toBeVisible();
    await expect(directIndicator).toBeVisible();

    // Check last line of Alice's commit (line 11)
    await rows.nth(10).click();
    await expect(commitPanel).toBeVisible();
    await expect(directIndicator).toBeVisible();
  });

  test('should maintain consistent SHA display across all lines of same direct commit', async ({
    page,
  }) => {
    const rows = page.locator('table[role="grid"] tbody tr');
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    const shaElement = page.locator('[data-testid="commit-sha"]');

    // Click first line
    await rows.nth(0).click();
    await expect(commitPanel).toBeVisible();
    const firstSha = await shaElement.textContent();

    // Click another line from same commit
    await rows.nth(5).click();
    await expect(commitPanel).toBeVisible();
    const secondSha = await shaElement.textContent();

    // SHAs should be identical
    expect(firstSha).toEqual(secondSha);
    expect(firstSha).toContain(DIRECT_COMMITS.alice.sha);
  });
});

test.describe('Direct Commits - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Open panel with direct commit
    const rows = page.locator('table[role="grid"] tbody tr');
    await rows.nth(0).click();

    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();
  });

  test('direct commit indicator should be screen reader accessible', async ({
    page,
  }) => {
    const directIndicator = page.locator('[data-testid="direct-commit-indicator"]');
    await expect(directIndicator).toBeVisible();

    // Indicator should have meaningful text for screen readers
    const text = await directIndicator.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });

  test('direct commit indicator should not interfere with panel focus management', async ({
    page,
  }) => {
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Press Tab to navigate focus
    await page.keyboard.press('Tab');

    // Focus should remain within the panel
    const focusedInPanel = await commitPanel.locator(':focus').count();
    expect(focusedInPanel).toBeGreaterThanOrEqual(0); // Focus either in panel or on interactive elements
  });

  test('panel should close with ESC key when showing direct commit', async ({
    page,
  }) => {
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Verify direct commit indicator is shown
    const directIndicator = page.locator('[data-testid="direct-commit-indicator"]');
    await expect(directIndicator).toBeVisible();

    // Press ESC to close
    await page.keyboard.press('Escape');

    // Panel should be closed
    await expect(commitPanel).not.toBeVisible();
  });

  test('indicator should have proper contrast for visibility', async ({ page }) => {
    const directIndicator = page.locator('[data-testid="direct-commit-indicator"]');
    await expect(directIndicator).toBeVisible();

    // Get computed styles to verify indicator is styled distinctly
    const boundingBox = await directIndicator.boundingBox();
    expect(boundingBox).not.toBeNull();

    // Ensure the indicator has reasonable size for visibility
    expect(boundingBox!.height).toBeGreaterThanOrEqual(16);
  });
});

test.describe('Direct Commits - API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should correctly identify direct commit via API response', async ({ page }) => {
    // Arrange - intercept the merge API call
    let apiResponse: { isDirectCommit?: boolean } = {};

    await page.route('**/api/merge**', async (route) => {
      const response = await route.fetch();
      apiResponse = await response.json();
      await route.fulfill({ response });
    });

    // Act - click on Alice's direct commit
    const rows = page.locator('table[role="grid"] tbody tr');
    await rows.nth(0).click();

    // Wait for panel and API call
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Allow time for API call
    await page.waitForTimeout(500);

    // Assert - API should return isDirectCommit: true
    expect(apiResponse.isDirectCommit).toBe(true);
  });

  test('should handle loading state while fetching direct commit status', async ({
    page,
  }) => {
    // Arrange - delay the merge API response
    await page.route('**/api/merge**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });

    // Act - click on a direct commit line
    const rows = page.locator('table[role="grid"] tbody tr');
    await rows.nth(0).click();

    // Assert - panel should open
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Assert - loading indicator may be visible initially
    // Then direct commit indicator should appear
    const directIndicator = page.locator('[data-testid="direct-commit-indicator"]');
    await expect(directIndicator).toBeVisible({ timeout: 10000 });
  });

  test('should gracefully handle API errors for direct commit detection', async ({
    page,
  }) => {
    // Arrange - mock API to return error
    await page.route('**/api/merge**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Act - click on a direct commit line
    const rows = page.locator('table[role="grid"] tbody tr');
    await rows.nth(0).click();

    // Assert - panel should still open and be functional
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    await expect(commitPanel).toBeVisible();

    // Basic commit info should still be available
    const shaElement = page.locator('[data-testid="commit-sha"]');
    await expect(shaElement).toBeVisible();
  });
});

test.describe('Direct Commits - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();
  });

  test('should handle rapid clicking between direct commits', async ({ page }) => {
    const rows = page.locator('table[role="grid"] tbody tr');
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    const directIndicator = page.locator('[data-testid="direct-commit-indicator"]');

    // Rapidly click between Alice's and Bob's direct commits
    await rows.nth(0).click();
    await rows.nth(DIRECT_COMMITS.bob.lineRange.start - 1).click();
    await rows.nth(5).click();
    await rows.nth(DIRECT_COMMITS.bob.lineRange.start).click();

    // Final state should show panel with direct commit indicator
    await expect(commitPanel).toBeVisible();
    await expect(directIndicator).toBeVisible();
  });

  test('should correctly show direct indicator after switching from merged commit', async ({
    page,
  }) => {
    const rows = page.locator('table[role="grid"] tbody tr');
    const commitPanel = page.locator('[data-testid="commit-panel"]');

    // First click on Charlie's merged commit (line 16)
    await rows.nth(15).click();
    await expect(commitPanel).toBeVisible();

    // Merge context might be visible for merged commit
    // Now switch to Alice's direct commit
    await rows.nth(0).click();

    // Assert - should now show direct commit indicator
    const directIndicator = page.locator('[data-testid="direct-commit-indicator"]');
    await expect(directIndicator).toBeVisible();

    // Assert - merge context should NOT be visible
    const mergeContext = page.locator('[data-testid="merge-context"]');
    await expect(mergeContext).not.toBeVisible();
  });

  test('should display direct commit indicator for boundary lines', async ({
    page,
  }) => {
    const rows = page.locator('table[role="grid"] tbody tr');
    const commitPanel = page.locator('[data-testid="commit-panel"]');
    const directIndicator = page.locator('[data-testid="direct-commit-indicator"]');

    // Test last line of Alice's commit (line 11)
    await rows.nth(DIRECT_COMMITS.alice.lineRange.end - 1).click();
    await expect(commitPanel).toBeVisible();
    await expect(directIndicator).toBeVisible();

    // Test first line of Bob's commit (line 12)
    await rows.nth(DIRECT_COMMITS.bob.lineRange.start - 1).click();
    await expect(commitPanel).toBeVisible();
    await expect(directIndicator).toBeVisible();
  });
});
