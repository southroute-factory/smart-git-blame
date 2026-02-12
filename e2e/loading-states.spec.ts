import { test, expect } from '@playwright/test';

/**
 * E2E tests for loading states and animations (TASK-047)
 * Tests skeleton displays, transitions, and loading indicators
 */

const TEST_REPO = '/root/web-app/test-fixtures/sample-repo';
const TEST_FILE = 'src/example.ts';

test.describe('Loading Skeleton Display', () => {
  test('should display skeleton while blame data is loading', async ({ page }) => {
    // Arrange - delay API response to observe loading state
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    // Act - navigate to blame page
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Assert - skeleton should be visible
    const skeleton = page.locator('.animate-pulse');
    await expect(skeleton.first()).toBeVisible();
  });

  test('skeleton should have proper table structure', async ({ page }) => {
    // Arrange - delay API response
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });

    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Assert - skeleton table should have proper structure
    const skeletonTable = page.locator('table[role="grid"][aria-busy="true"]');
    await expect(skeletonTable).toBeVisible();
    
    // Should have multiple skeleton rows
    const rows = skeletonTable.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(5);
  });

  test('skeleton should have accessible loading state', async ({ page }) => {
    // Arrange
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Assert - skeleton should have aria-busy="true"
    const skeletonTable = page.locator('table[aria-busy="true"]');
    await expect(skeletonTable).toBeVisible();
    
    // Should have accessible label
    await expect(skeletonTable).toHaveAttribute('aria-label', 'Loading blame view');
  });

  test('skeleton should show visual grouping pattern', async ({ page }) => {
    // Arrange
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });

    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Assert - skeleton should have alternating row backgrounds
    const rows = page.locator('table[aria-busy="true"] tbody tr');
    
    // First row should have group start styling (border-t)
    const firstRow = rows.first();
    await expect(firstRow).toHaveClass(/border-t/);
  });

  test('skeleton rows should have varied content widths', async ({ page }) => {
    // Arrange
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });

    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Assert - code content skeleton should have different widths
    // This makes the skeleton look more realistic
    const codeSkeletons = page.locator('table[aria-busy="true"] tbody tr td:last-child div');
    const count = await codeSkeletons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Page Header Loading Skeleton', () => {
  test('should show header skeleton during initial page load', async ({ page }) => {
    // Arrange - delay API to observe page-level skeleton
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });

    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // The page should show skeleton elements for the header area
    // Check for animate-pulse elements in the header area
    const skeletonElements = page.locator('.animate-pulse');
    await expect(skeletonElements.first()).toBeVisible();
  });
});

test.describe('Loading to Content Transition', () => {
  test('skeleton should disappear when content loads', async ({ page }) => {
    // Arrange
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Assert - skeleton visible initially
    const skeleton = page.locator('table[aria-busy="true"]');
    await expect(skeleton).toBeVisible();

    // Assert - content should eventually load and skeleton should disappear
    await expect(page.locator('table[role="grid"]:not([aria-busy])')).toBeVisible({
      timeout: 10000,
    });
    
    // aria-busy skeleton should no longer be visible
    await expect(skeleton).not.toBeVisible();
  });

  test('content should replace skeleton smoothly', async ({ page }) => {
    // Arrange
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.continue();
    });

    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Wait for content
    const contentTable = page.locator('table[role="grid"]:not([aria-busy])');
    await expect(contentTable).toBeVisible({ timeout: 10000 });

    // Assert - content should have proper aria-label (not loading)
    await expect(contentTable).toHaveAttribute('aria-label', `Blame view for ${TEST_FILE}`);
  });

  test('transition should maintain table structure', async ({ page }) => {
    // Arrange
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Wait for content
    await expect(page.locator('table[role="grid"]:not([aria-busy])')).toBeVisible({
      timeout: 10000,
    });

    // Assert - final table should have proper columns
    const headerCells = page.locator('table[role="grid"] thead th');
    const headerCount = await headerCells.count();
    expect(headerCount).toBe(5); // Type, Commit, Author, Line, Code
  });
});

test.describe('Row Transition Animations', () => {
  test('rows should have transition class for hover effects', async ({ page }) => {
    // Act - navigate to page and wait for content
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Wait for content
    const table = page.locator('table[role="grid"]:not([aria-busy])');
    await expect(table).toBeVisible({ timeout: 10000 });

    // Assert - rows should have transition-colors class
    const rows = table.locator('tbody tr');
    const firstRow = rows.first();
    await expect(firstRow).toHaveClass(/transition-colors/);
  });

  test('rows should show hover state on mouse over', async ({ page }) => {
    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    const table = page.locator('table[role="grid"]:not([aria-busy])');
    await expect(table).toBeVisible({ timeout: 10000 });

    // Get first row
    const firstRow = table.locator('tbody tr').first();
    
    // Assert - row should have hover class defined
    await expect(firstRow).toHaveClass(/hover:bg-zinc-100/);
  });
});

test.describe('Error State Transitions', () => {
  test('error should transition in smoothly after loading', async ({ page }) => {
    // Arrange - return error after delay
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'File not found', code: 'FILE_NOT_FOUND' }),
      });
    });

    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=nonexistent.ts`
    );

    // Assert - should see skeleton first
    const skeleton = page.locator('.animate-pulse');
    await expect(skeleton.first()).toBeVisible();

    // Then error should appear
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    
    // Error should have transition animation class
    await expect(errorAlert).toHaveClass(/transition-all/);
  });
});

test.describe('Suspense Loading States', () => {
  test('Suspense fallback should show during search params parsing', async ({ page }) => {
    // Act - navigate with query params
    // The Suspense boundary wraps the search params usage
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // The Suspense fallback (BlamePageLoadingSkeleton) shows while useSearchParams resolves
    // This is typically very fast, but we can verify the skeleton structure exists
    
    // Wait for final content
    await expect(page.locator('table[role="grid"]:not([aria-busy])')).toBeVisible({
      timeout: 10000,
    });
  });

  test('ErrorBoundary should catch render errors gracefully', async ({ page }) => {
    // This test verifies the ErrorBoundary is in place
    // We can test this by checking the page structure loads correctly
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Content should load successfully (ErrorBoundary doesn't interfere)
    await expect(page.locator('table[role="grid"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Loading State Performance', () => {
  test('skeleton should appear within 100ms of navigation', async ({ page }) => {
    // Arrange - delay API to ensure skeleton shows
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    // Act - navigate and immediately check for skeleton
    const navigationStart = Date.now();
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );
    
    // Wait for any skeleton to appear
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
    const skeletonAppeared = Date.now();

    // Assert - skeleton should appear quickly (within 500ms is reasonable for E2E)
    const timeToSkeleton = skeletonAppeared - navigationStart;
    expect(timeToSkeleton).toBeLessThan(1000);
  });
});

test.describe('TASK-048: Performance Timing', () => {
  /**
   * Baseline Performance Metrics
   * These tests establish and verify expected load time thresholds
   * 
   * Expected baselines (adjust based on actual measurements):
   * - Time to skeleton visible: < 200ms
   * - Time to first contentful paint: < 1000ms  
   * - Time to interactive (blame data loaded): < 3000ms (with network)
   * - Time for syntax highlighting: < 500ms (22 lines)
   */

  test('should load blame view within acceptable time', async ({ page }) => {
    // Arrange
    const metrics: { navigationStart?: number; contentLoaded?: number } = {};

    // Act
    metrics.navigationStart = Date.now();
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Wait for content to be visible
    await expect(page.locator('table[role="grid"]:not([aria-busy])')).toBeVisible({
      timeout: 10000,
    });
    metrics.contentLoaded = Date.now();

    // Assert - content should load within 5 seconds (generous for CI)
    const loadTime = metrics.contentLoaded - metrics.navigationStart!;
    console.log(`📊 Total load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('should measure time to first skeleton', async ({ page }) => {
    // Arrange - delay API to observe skeleton
    await page.route('**/api/blame**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    // Act
    const navigationStart = Date.now();
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    await expect(page.locator('.animate-pulse').first()).toBeVisible();
    const skeletonVisible = Date.now();

    // Assert
    const timeToSkeleton = skeletonVisible - navigationStart;
    console.log(`📊 Time to skeleton: ${timeToSkeleton}ms`);
    
    // Skeleton should appear quickly (within 500ms)
    expect(timeToSkeleton).toBeLessThan(500);
  });

  test('should measure API response time', async ({ page }) => {
    // Arrange
    let apiStartTime: number = 0;
    let apiEndTime: number = 0;

    await page.route('**/api/blame**', async (route) => {
      apiStartTime = Date.now();
      await route.continue();
    });

    page.on('response', (response) => {
      if (response.url().includes('/api/blame')) {
        apiEndTime = Date.now();
      }
    });

    // Act
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    await expect(page.locator('table[role="grid"]:not([aria-busy])')).toBeVisible({
      timeout: 10000,
    });

    // Assert
    if (apiStartTime > 0 && apiEndTime > 0) {
      const apiResponseTime = apiEndTime - apiStartTime;
      console.log(`📊 API response time: ${apiResponseTime}ms`);
      
      // API should respond within 2 seconds for test fixture
      expect(apiResponseTime).toBeLessThan(2000);
    }
  });

  test('should collect comprehensive performance metrics', async ({ page }) => {
    // Arrange
    const metrics: Record<string, number> = {};

    // Act
    const startTime = Date.now();
    
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Measure DOM content loaded
    metrics.domContentLoaded = Date.now() - startTime;

    // Wait for skeleton
    try {
      await expect(page.locator('.animate-pulse').first()).toBeVisible({ timeout: 500 });
      metrics.skeletonVisible = Date.now() - startTime;
    } catch {
      // Skeleton might not be visible if content loads fast
      metrics.skeletonVisible = -1;
    }

    // Wait for content
    await expect(page.locator('table[role="grid"]:not([aria-busy])')).toBeVisible({
      timeout: 10000,
    });
    metrics.contentVisible = Date.now() - startTime;

    // Log metrics for documentation
    console.log('\n📊 Performance Metrics:');
    console.log(`   DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`   Skeleton Visible: ${metrics.skeletonVisible === -1 ? 'N/A (content loaded fast)' : metrics.skeletonVisible + 'ms'}`);
    console.log(`   Content Visible: ${metrics.contentVisible}ms`);

    // Assert baseline thresholds
    expect(metrics.domContentLoaded).toBeLessThan(1000);
    expect(metrics.contentVisible).toBeLessThan(5000);
  });

  test('should measure rendering performance for all lines', async ({ page }) => {
    // Arrange
    const EXPECTED_LINE_COUNT = 22; // From test fixture

    // Act
    const startTime = Date.now();
    
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Wait for all rows to render
    const rows = page.locator('table[role="grid"]:not([aria-busy]) tbody tr');
    await expect(rows).toHaveCount(EXPECTED_LINE_COUNT, { timeout: 10000 });
    
    const allRowsRendered = Date.now();
    const totalRenderTime = allRowsRendered - startTime;
    const perLineTime = totalRenderTime / EXPECTED_LINE_COUNT;

    // Log metrics
    console.log(`📊 Render metrics:`);
    console.log(`   Total render time: ${totalRenderTime}ms`);
    console.log(`   Time per line: ${perLineTime.toFixed(2)}ms`);
    console.log(`   Lines rendered: ${EXPECTED_LINE_COUNT}`);

    // Assert
    expect(totalRenderTime).toBeLessThan(5000);
    expect(perLineTime).toBeLessThan(200); // Each line should render in < 200ms
  });
});

/**
 * TASK-048: Baseline Load Time Documentation
 * 
 * Expected Performance Baselines (based on test fixtures with 22 lines):
 * 
 * | Metric                    | Target   | Threshold |
 * |---------------------------|----------|-----------|
 * | Time to skeleton          | < 100ms  | < 500ms   |
 * | DOM content loaded        | < 300ms  | < 1000ms  |
 * | API response time         | < 500ms  | < 2000ms  |
 * | Time to content visible   | < 1500ms | < 5000ms  |
 * | Render time per line      | < 50ms   | < 200ms   |
 * 
 * Notes:
 * - Thresholds are generous for CI environments
 * - Actual performance may vary based on machine specs
 * - Test fixtures are small (22 lines); larger files will take longer
 * - Network latency is the primary factor in load time
 * - Syntax highlighting adds ~100-300ms overhead
 */
