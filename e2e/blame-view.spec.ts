import { test, expect } from '@playwright/test';

/**
 * E2E tests for BlameView component (TASK-011)
 * Tests the blame view rendering, syntax highlighting, gutter info, and interactions
 */

const TEST_REPO = '/root/web-app/test-fixtures/sample-repo';
const TEST_FILE = 'src/example.ts';

// Expected data from the sample-repo test fixture
// File has 22 lines, 4 functions, 3 authors
const EXPECTED_AUTHORS = ['Alice Developer', 'Bob Engineer', 'Charlie Coder'];
const EXPECTED_LINE_COUNT = 22;

// SHA prefixes (first 7 chars) from the test repo
const EXPECTED_SHA_PREFIXES = ['32f2f38', 'cd36886', '2d766cb'];

test.describe('BlameView Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to blame page with test fixtures
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );
  });

  test('should render blame view with file content', async ({ page }) => {
    // Arrange & Act - page loaded in beforeEach

    // Assert - page header and info are visible
    await expect(page.getByRole('heading', { name: 'Blame View' })).toBeVisible();
    await expect(page.getByText(TEST_REPO)).toBeVisible();
    await expect(page.getByText(TEST_FILE)).toBeVisible();

    // Assert - blame table is rendered
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Assert - all expected lines are present (22 lines in example.ts)
    const rows = page.locator('table[role="grid"] tbody tr');
    await expect(rows).toHaveCount(EXPECTED_LINE_COUNT);

    // Assert - file content is rendered (check for function signatures)
    await expect(page.getByText('export function add')).toBeVisible();
    await expect(page.getByText('export function multiply')).toBeVisible();
    await expect(page.getByText('export function subtract')).toBeVisible();
    await expect(page.getByText('export function divide')).toBeVisible();
  });

  test('should apply syntax highlighting to code', async ({ page }) => {
    // Arrange & Act - page loaded in beforeEach
    
    // Wait for blame view to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Assert - syntax highlighting is applied (look for span elements with highlighted content)
    // TypeScript keywords like 'export', 'function', 'return', 'number' should be highlighted
    const codeCell = page.locator('table[role="grid"] tbody tr td').last();
    await expect(codeCell).toBeVisible();

    // Check that the code content contains HTML spans (indication of syntax highlighting)
    const highlightedContent = page.locator('table[role="grid"] tbody tr td:last-child span');
    const highlightCount = await highlightedContent.count();
    
    // Should have multiple highlighted spans (keywords, strings, etc.)
    expect(highlightCount).toBeGreaterThan(0);
  });

  test('should display SHA and author in blame gutter', async ({ page }) => {
    // Arrange & Act - page loaded in beforeEach
    
    // Wait for blame view to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Assert - all expected authors are visible in the gutter
    for (const author of EXPECTED_AUTHORS) {
      await expect(page.getByText(author).first()).toBeVisible();
    }

    // Assert - SHA prefixes are visible (at group starts)
    for (const sha of EXPECTED_SHA_PREFIXES) {
      await expect(page.getByText(sha).first()).toBeVisible();
    }
  });

  test('should show visual grouping for consecutive lines from same commit', async ({ page }) => {
    // Arrange & Act - page loaded in beforeEach
    
    // Wait for blame view to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    const rows = page.locator('table[role="grid"] tbody tr');
    
    // Get the first row (line 1 - Alice's commit, group start)
    const firstRow = rows.nth(0);
    
    // Assert - first row should have border-t class (group start indicator)
    await expect(firstRow).toHaveClass(/border-t/);
    
    // Check that different commit groups have different background colors
    // Even groups: bg-zinc-50, Odd groups: bg-white
    const row12 = rows.nth(11); // Bob's commit starts at line 12 (group 2 - even)
    const row16 = rows.nth(15); // Charlie's commit starts at line 16 (group 3 - odd)

    // Bob's group (even) should have bg-zinc-50 class
    await expect(row12).toHaveClass(/bg-zinc-50|dark:bg-zinc-900/);
    
    // Charlie's group (odd) should have bg-white class
    await expect(row16).toHaveClass(/bg-white|dark:bg-zinc-950/);
  });

  test('should have clickable lines with proper accessibility', async ({ page }) => {
    // Arrange & Act - page loaded in beforeEach
    
    // Wait for blame view to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Get a row element
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);
    
    // Assert - rows should have cursor-pointer class (indicating clickability)
    await expect(firstRow).toHaveClass(/cursor-pointer/);
    
    // Assert - rows should have hover styles
    await expect(firstRow).toHaveClass(/hover:bg-zinc-100|dark:hover:bg-zinc-800/);
    
    // Assert - rows should be keyboard accessible (have tabindex)
    await expect(firstRow).toHaveAttribute('tabindex', '0');
    
    // Assert - rows should have button role for accessibility
    await expect(firstRow).toHaveAttribute('role', 'button');
    
    // Assert - rows have aria-label with line info
    const ariaLabel = await firstRow.getAttribute('aria-label');
    expect(ariaLabel).toContain('Line 1');
    expect(ariaLabel).toContain('32f2f38'); // SHA prefix
    expect(ariaLabel).toContain('Alice Developer'); // Author
  });

  test('should respond to line click interaction', async ({ page }) => {
    // Arrange - page loaded in beforeEach
    
    // Wait for blame view to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Get the first row
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act - click on the first row
    await firstRow.click();

    // Assert - verify the click was registered (row should be focusable)
    // The component has onLineClick callback capability - verify row is interactive
    await expect(firstRow).toBeFocused();
  });

  test('should handle keyboard navigation on lines', async ({ page }) => {
    // Arrange - page loaded in beforeEach
    
    // Wait for blame view to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Get the first row
    const rows = page.locator('table[role="grid"] tbody tr');
    const firstRow = rows.nth(0);

    // Act - focus and press Enter
    await firstRow.focus();
    await expect(firstRow).toBeFocused();
    
    // Press Enter to simulate keyboard activation
    await page.keyboard.press('Enter');

    // Assert - element should still be focused (interaction completed)
    await expect(firstRow).toBeFocused();
  });

  test('should display line numbers correctly', async ({ page }) => {
    // Arrange & Act - page loaded in beforeEach
    
    // Wait for blame view to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible();

    // Assert - line numbers should be displayed
    // Check first and last line numbers
    await expect(page.getByLabel('Line 1')).toBeVisible();
    await expect(page.getByLabel(`Line ${EXPECTED_LINE_COUNT}`)).toBeVisible();
    
    // Check a middle line number
    await expect(page.getByLabel('Line 10')).toBeVisible();
  });

  test('should show loading skeleton while fetching data', async ({ page }) => {
    // Arrange - set up network interception to delay the API response
    await page.route('**/api/blame**', async (route) => {
      // Delay the response to observe loading state
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    // Act - navigate to the page (this will trigger the loading state)
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(TEST_FILE)}`
    );

    // Assert - loading skeleton should be visible initially
    const skeleton = page.locator('.animate-pulse');
    await expect(skeleton).toBeVisible();

    // Wait for content to load
    await expect(page.locator('table[role="grid"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('BlameView Error Handling', () => {
  test('should show error for non-existent file', async ({ page }) => {
    // Arrange & Act - navigate to blame page with non-existent file
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent('nonexistent.ts')}`
    );

    // Assert - error message should be displayed
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(page.getByText(/file not found|error/i)).toBeVisible();
  });

  test('should show error for invalid repository', async ({ page }) => {
    // Arrange & Act - navigate to blame page with invalid repository
    await page.goto(
      `/blame?repo=${encodeURIComponent('/invalid/repo/path')}&file=${encodeURIComponent('file.ts')}`
    );

    // Assert - error message should be displayed
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(page.getByText(/invalid|error|repository/i)).toBeVisible();
  });
});
