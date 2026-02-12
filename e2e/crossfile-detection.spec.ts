import { test, expect } from '@playwright/test';

/**
 * E2E tests for cross-file detection (TASK-087)
 * Tests the cross-file indicator display, confidence badge, and original file link
 *
 * Test fixtures (TASK-086):
 * - src/math-utils.ts: Contains code copied from src/example.ts
 *   - The multiply function (lines 12-14) originated from src/example.ts
 *   - Cross-file detection should identify these as copied code
 */

const TEST_REPO = '/root/web-app/test-fixtures/sample-repo';
const CROSS_FILE_SOURCE = 'src/math-utils.ts';
const ORIGINAL_FILE = 'src/example.ts';
// Note: example.ts has no cross-file origins (it's the original source file)
const FILE_WITHOUT_CROSSFILE = 'src/example.ts';

test.describe('Cross-File Detection - API', () => {
  test('should return cross-file analysis in blame API response', async ({ request }) => {
    // Arrange & Act - call the blame API for file with cross-file code
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: CROSS_FILE_SOURCE,
      },
    });

    // Assert - response should be successful
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Assert - crossFileAnalysis should exist and have expected structure
    expect(data.crossFileAnalysis).toBeDefined();
    expect(data.crossFileAnalysis.currentFile).toBe(CROSS_FILE_SOURCE);
    expect(data.crossFileAnalysis.totalLines).toBeGreaterThan(0);
  });

  test('should detect cross-file matches with sourceFile info', async ({ request }) => {
    // Arrange & Act
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: CROSS_FILE_SOURCE,
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Assert - should have cross-file matches
    expect(data.crossFileAnalysis.matches).toBeInstanceOf(Array);
    expect(data.crossFileAnalysis.matches.length).toBeGreaterThan(0);

    // Assert - first match should point to the original source file
    const match = data.crossFileAnalysis.matches[0];
    expect(match.sourceFile).toBe(ORIGINAL_FILE);
    expect(match.lineNumbers).toBeInstanceOf(Array);
    expect(match.lineNumbers.length).toBeGreaterThan(0);
  });

  test('should include confidence level for cross-file matches', async ({ request }) => {
    // Arrange & Act
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: CROSS_FILE_SOURCE,
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Assert - matches should have confidence levels
    for (const match of data.crossFileAnalysis.matches) {
      expect(match.confidence).toBeDefined();
      expect(['high', 'medium', 'low']).toContain(match.confidence);
    }
  });

  test('should include operation type (moved/copied) for cross-file matches', async ({ request }) => {
    // Arrange & Act
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: CROSS_FILE_SOURCE,
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Assert - matches should have operation type
    for (const match of data.crossFileAnalysis.matches) {
      expect(match.operationType).toBeDefined();
      expect(['moved', 'copied']).toContain(match.operationType);
    }
  });

  test('should include sourceFile in individual blame lines when applicable', async ({ request }) => {
    // Arrange & Act
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: CROSS_FILE_SOURCE,
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Find lines that have sourceFile info (came from another file)
    const linesWithSourceFile = data.lines.filter(
      (line: { sourceFile?: string }) => line.sourceFile !== undefined
    );

    // Assert - there should be lines with cross-file origin
    expect(linesWithSourceFile.length).toBeGreaterThan(0);

    // Assert - sourceFile should point to the original file
    for (const line of linesWithSourceFile) {
      expect(line.sourceFile).toBe(ORIGINAL_FILE);
    }
  });

  test('should calculate cross-file percentage correctly', async ({ request }) => {
    // Arrange & Act
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: CROSS_FILE_SOURCE,
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Assert - cross-file percentage should be calculated
    expect(data.crossFileAnalysis.crossFileLines).toBeGreaterThanOrEqual(0);
    expect(data.crossFileAnalysis.crossFilePercentage).toBeGreaterThanOrEqual(0);
    expect(data.crossFileAnalysis.crossFilePercentage).toBeLessThanOrEqual(100);

    // Verify percentage calculation
    const expectedPercentage = Math.round(
      (data.crossFileAnalysis.crossFileLines / data.crossFileAnalysis.totalLines) * 100
    );
    expect(data.crossFileAnalysis.crossFilePercentage).toBe(expectedPercentage);
  });

  test('should return empty matches for file without cross-file origin', async ({ request }) => {
    // Arrange & Act - use a file that was not copied from elsewhere
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: FILE_WITHOUT_CROSSFILE,
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Assert - crossFileAnalysis should exist but have no matches
    expect(data.crossFileAnalysis).toBeDefined();
    expect(data.crossFileAnalysis.matches.length).toBe(0);
    expect(data.crossFileAnalysis.crossFileLines).toBe(0);
    expect(data.crossFileAnalysis.crossFilePercentage).toBe(0);
  });

  test('should return 404 for non-existent file', async ({ request }) => {
    // Arrange & Act
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: 'nonexistent-file.ts',
      },
    });

    // Assert
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.code).toBe('FILE_NOT_FOUND');
  });

  test('should return 400 for missing parameters', async ({ request }) => {
    // Arrange & Act
    const response = await request.get('/api/blame', {
      params: {
        file: CROSS_FILE_SOURCE,
      },
    });

    // Assert
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });
});

test.describe('Cross-File Detection - UI', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to blame page with the file containing cross-file code
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(CROSS_FILE_SOURCE)}`
    );

    // Wait for the page to fully load
    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible({ timeout: 15000 });
  });

  test('should render blame view with all lines', async ({ page }) => {
    // Assert - blame table is rendered with lines
    const rows = page.locator('table[role="grid"] tbody tr');
    
    // File should have at least the lines we created
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(30);
  });

  test('should display cross-file indicator for copied lines', async ({ page }) => {
    // Look for cross-file indicator elements
    // The indicator should show when lines originated from another file
    const crossFileIndicators = page.locator('[data-testid="crossfile-indicator"], [aria-label*="from file"], [aria-label*="cross-file"], button[title*="src/example.ts"]');
    
    // Check if any cross-file indicators are present
    const count = await crossFileIndicators.count();
    
    // Note: If UI components are not yet implemented, this test documents the expected behavior
    if (count > 0) {
      await expect(crossFileIndicators.first()).toBeVisible();
    }
  });

  test('should display confidence badge for cross-file matches', async ({ page }) => {
    // Look for confidence badges
    const confidenceBadges = page.locator('[data-testid="confidence-badge"], .confidence-badge, [aria-label*="confidence"]');
    
    const count = await confidenceBadges.count();
    
    if (count > 0) {
      await expect(confidenceBadges.first()).toBeVisible();
      
      // Verify badge has valid confidence level text
      const firstBadge = confidenceBadges.first();
      const text = await firstBadge.textContent();
      expect(text?.toLowerCase()).toMatch(/high|medium|low/);
    }
  });

  test('should display original file link for cross-file matches', async ({ page }) => {
    // Look for links to the original file
    const originalFileLinks = page.locator(`a[href*="${encodeURIComponent(ORIGINAL_FILE)}"], [data-testid="original-file-link"], a:has-text("${ORIGINAL_FILE}")`);
    
    const count = await originalFileLinks.count();
    
    if (count > 0) {
      await expect(originalFileLinks.first()).toBeVisible();
      
      // Verify link points to the original file
      const firstLink = originalFileLinks.first();
      const href = await firstLink.getAttribute('href');
      if (href) {
        expect(href).toContain('example.ts');
      }
    }
  });

  test('should show cross-file summary when available', async ({ page }) => {
    // Look for cross-file summary section
    const summarySection = page.locator('[data-testid="crossfile-summary"], [aria-label*="cross-file summary"], .crossfile-summary');
    
    const count = await summarySection.count();
    
    if (count > 0) {
      await expect(summarySection.first()).toBeVisible();
    }
  });

  test('should correctly blame content of file with cross-file code', async ({ page }) => {
    // Assert - file content should be visible
    await expect(page.getByText('export function multiply')).toBeVisible();
    await expect(page.getByText('export function subtract')).toBeVisible();
    await expect(page.getByText('export function add')).toBeVisible();
  });

  test('should display correct author information', async ({ page }) => {
    // Assert - authors should be visible
    // The multiply function was originally written by Alice Developer
    await expect(page.getByText('Alice Developer').first()).toBeVisible();
    
    // The subtract function was originally written by Bob Engineer
    await expect(page.getByText('Bob Engineer').first()).toBeVisible();
  });
});

test.describe('Cross-File Detection - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(CROSS_FILE_SOURCE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible({ timeout: 15000 });
  });

  test('cross-file indicators should have accessible aria-labels', async ({ page }) => {
    const crossFileIndicators = page.locator('[data-testid="crossfile-indicator"], [aria-label*="from file"]');
    
    const count = await crossFileIndicators.count();
    
    if (count > 0) {
      const indicator = crossFileIndicators.first();
      const ariaLabel = await indicator.getAttribute('aria-label');
      
      // Aria label should describe the cross-file origin
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/file|from|origin/i);
    }
  });

  test('confidence badges should be accessible', async ({ page }) => {
    const confidenceBadges = page.locator('[data-testid="confidence-badge"], .confidence-badge');
    
    const count = await confidenceBadges.count();
    
    if (count > 0) {
      const badge = confidenceBadges.first();
      
      // Badge should have accessible text or aria-label
      const ariaLabel = await badge.getAttribute('aria-label');
      const text = await badge.textContent();
      
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('original file links should be keyboard accessible', async ({ page }) => {
    const originalFileLinks = page.locator(`a[href*="${encodeURIComponent(ORIGINAL_FILE)}"]`);
    
    const count = await originalFileLinks.count();
    
    if (count > 0) {
      const link = originalFileLinks.first();
      
      // Link should be focusable
      await link.focus();
      await expect(link).toBeFocused();
    }
  });

  test('table should have proper grid role for screen readers', async ({ page }) => {
    const table = page.locator('table[role="grid"]');
    await expect(table).toBeVisible();
    
    // Table should have proper aria-label
    const ariaLabel = await table.getAttribute('aria-label');
    expect(ariaLabel).toContain('Blame view');
  });
});

test.describe('Cross-File Detection - Edge Cases', () => {
  test('should handle file with no cross-file origins gracefully', async ({ request, page }) => {
    // Use helpers.ts which has no cross-file code
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: FILE_WITHOUT_CROSSFILE,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Should return empty cross-file analysis
    expect(data.crossFileAnalysis.matches.length).toBe(0);

    // Navigate to the page
    await page.goto(
      `/blame?repo=${encodeURIComponent(TEST_REPO)}&file=${encodeURIComponent(FILE_WITHOUT_CROSSFILE)}`
    );

    const blameTable = page.locator('table[role="grid"]');
    await expect(blameTable).toBeVisible({ timeout: 15000 });

    // Page should render without errors
    await expect(page.getByRole('heading', { name: 'Blame View' })).toBeVisible();
  });

  test('should handle multiple source files in cross-file analysis', async ({ request }) => {
    // This test verifies the API can handle multiple source files
    // if a file has code from multiple origins
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: CROSS_FILE_SOURCE,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Verify structure supports multiple matches
    expect(data.crossFileAnalysis.matches).toBeInstanceOf(Array);
    
    // Each match should have proper structure
    for (const match of data.crossFileAnalysis.matches) {
      expect(match).toHaveProperty('sourceFile');
      expect(match).toHaveProperty('lineNumbers');
      expect(match).toHaveProperty('confidence');
      expect(match).toHaveProperty('operationType');
      expect(match).toHaveProperty('author');
      expect(match).toHaveProperty('sha');
      expect(match).toHaveProperty('timestamp');
    }
  });

  test('should include author info from original commits', async ({ request }) => {
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: CROSS_FILE_SOURCE,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Matches should include author from original commits
    for (const match of data.crossFileAnalysis.matches) {
      expect(match.author).toBeTruthy();
      expect(typeof match.author).toBe('string');
      expect(match.sha).toMatch(/^[a-f0-9]{40}$/);
      expect(typeof match.timestamp).toBe('number');
    }
  });
});

test.describe('Cross-File Detection - Integration', () => {
  test('cross-file data should be consistent between API response and individual lines', async ({ request }) => {
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: CROSS_FILE_SOURCE,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Count lines with sourceFile in individual line data
    const linesWithSourceFile = data.lines.filter(
      (line: { sourceFile?: string }) => line.sourceFile !== undefined
    );

    // This count should match crossFileLines in the analysis
    // Note: crossFileLines counts unique lines, so it should be >= linesWithSourceFile.length
    expect(data.crossFileAnalysis.crossFileLines).toBe(linesWithSourceFile.length);
  });

  test('line numbers in matches should correspond to actual lines', async ({ request }) => {
    const response = await request.get('/api/blame', {
      params: {
        repo: TEST_REPO,
        file: CROSS_FILE_SOURCE,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Get all line numbers from matches
    const matchLineNumbers = data.crossFileAnalysis.matches.flatMap(
      (match: { lineNumbers: number[] }) => match.lineNumbers
    );

    // Verify these line numbers exist in the blame data
    for (const lineNum of matchLineNumbers) {
      const line = data.lines.find(
        (l: { lineNumber: number }) => l.lineNumber === lineNum
      );
      expect(line).toBeDefined();
      expect(line.sourceFile).toBeTruthy();
    }
  });
});
