import { test, expect } from '@playwright/test';

/**
 * BUG-007 Investigation: Code text missing from DOM
 * User reports text is not present in HTML elements when inspecting
 */
test.describe('Blame View Code Text Visibility', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the blame API to return known content
    await page.route('/api/blame*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          repo: '/test/repo',
          file: 'test.ts',
          lines: [
            {
              lineNumber: 1,
              content: 'const hello = "world";',
              sha: 'abc1234567890',
              author: 'Test Author',
              authorEmail: 'test@example.com',
              timestamp: Date.now(),
            },
            {
              lineNumber: 2,
              content: 'function greet(name: string) {',
              sha: 'abc1234567890',
              author: 'Test Author',
              authorEmail: 'test@example.com',
              timestamp: Date.now(),
            },
            {
              lineNumber: 3,
              content: '  return `Hello, ${name}!`;',
              sha: 'def7890123456',
              author: 'Another Author',
              authorEmail: 'another@example.com',
              timestamp: Date.now(),
            },
            {
              lineNumber: 4,
              content: '}',
              sha: 'def7890123456',
              author: 'Another Author',
              authorEmail: 'another@example.com',
              timestamp: Date.now(),
            },
          ],
        }),
      });
    });

    // Mock merge API
    await page.route('/api/merge*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sha: 'abc1234567890',
          isDirectCommit: true,
          isMergeCommit: false,
        }),
      });
    });
  });

  test('code content is present in DOM', async ({ page }) => {
    await page.goto('/blame?repo=/test/repo&file=test.ts');
    
    // Wait for loading to complete
    await page.waitForSelector('table[role="grid"]');
    
    // Check that code cells contain actual text content
    const codeCells = page.locator('td').last();
    await expect(codeCells).toBeVisible();
    
    // Get all code cells (last column in each row)
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Check first row has code content
    const firstRowCodeCell = rows.first().locator('td').last();
    const textContent = await firstRowCodeCell.textContent();
    
    console.log('First row code cell text content:', JSON.stringify(textContent));
    
    // Text should contain our code
    expect(textContent).toContain('const');
    expect(textContent).toContain('hello');
  });

  test('code text is visible (not transparent or hidden)', async ({ page }) => {
    await page.goto('/blame?repo=/test/repo&file=test.ts');
    await page.waitForSelector('table[role="grid"]');
    
    const rows = page.locator('tbody tr');
    const firstRowCodeCell = rows.first().locator('td').last();
    
    // Get the inner HTML to see what's actually rendered
    const innerHTML = await firstRowCodeCell.innerHTML();
    console.log('First row code cell innerHTML:', innerHTML);
    
    // Check that innerHTML contains our code text
    expect(innerHTML).toContain('const');
    expect(innerHTML).toContain('hello');
    expect(innerHTML).toContain('world');
  });

  test('highlighted code spans contain text', async ({ page }) => {
    await page.goto('/blame?repo=/test/repo&file=test.ts');
    await page.waitForSelector('table[role="grid"]');
    
    // Wait a bit for syntax highlighting to complete
    await page.waitForTimeout(500);
    
    const rows = page.locator('tbody tr');
    const firstRowCodeCell = rows.first().locator('td').last();
    
    // Get all spans inside the code cell
    const spans = firstRowCodeCell.locator('span');
    const spanCount = await spans.count();
    
    console.log('Number of spans in code cell:', spanCount);
    
    // Get text from each span
    const allText: string[] = [];
    for (let i = 0; i < spanCount; i++) {
      const spanText = await spans.nth(i).textContent();
      if (spanText) {
        allText.push(spanText);
      }
    }
    
    console.log('Text from spans:', allText);
    
    // Combined text should contain our code
    const combinedText = allText.join('');
    expect(combinedText).toContain('const');
  });

  test('dangerouslySetInnerHTML renders content', async ({ page }) => {
    await page.goto('/blame?repo=/test/repo&file=test.ts');
    await page.waitForSelector('table[role="grid"]');
    
    // Check the actual HTML structure
    const codeCell = page.locator('tbody tr').first().locator('td').last();
    const outerHTML = await codeCell.evaluate(el => el.outerHTML);
    
    console.log('Code cell outerHTML:', outerHTML);
    
    // The span with dangerouslySetInnerHTML should have content
    const innerSpan = codeCell.locator('span').first();
    const spanHTML = await innerSpan.evaluate(el => el.outerHTML);
    
    console.log('Inner span outerHTML:', spanHTML);
    
    // Should not be empty
    expect(spanHTML.length).toBeGreaterThan(20);
  });

  test('raw line content available without highlighting', async ({ page }) => {
    await page.goto('/blame?repo=/test/repo&file=test.ts');
    await page.waitForSelector('table[role="grid"]');
    
    // Get all visible text on the page
    const pageText = await page.locator('body').textContent();
    
    console.log('Page contains "const":', pageText?.includes('const'));
    console.log('Page contains "hello":', pageText?.includes('hello'));
    console.log('Page contains "function":', pageText?.includes('function'));
    console.log('Page contains "greet":', pageText?.includes('greet'));
    
    // The code content should be somewhere on the page
    expect(pageText).toContain('const');
    expect(pageText).toContain('function');
  });
});
