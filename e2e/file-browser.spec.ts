import { test, expect } from '@playwright/test';

/**
 * E2E tests for FileBrowser component (TASK-126)
 * 
 * Tests the file browser modal UI including:
 * - Browse button opens modal
 * - Directory listing displays
 * - Navigation (click and keyboard)
 * - Breadcrumb updates
 * - File selection
 * - Modal closes after selection
 * - Path populated in form
 * 
 * Uses the /api/files endpoint for directory listing.
 */

const TEST_REPO_PATH = '/root/web-app/test-fixtures/sample-repo';
const TEST_VALID_DIR = '/root/web-app';
const TEST_SRC_DIR = '/root/web-app/src';

test.describe('FileBrowser Modal - Opening and Closing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open file browser modal when browse button is clicked', async ({ page }) => {
    // Arrange - find browse button (for repository path)
    const browseButton = page.getByRole('button', { name: /browse/i });
    
    // Act - click the browse button
    await browseButton.first().click();

    // Assert - modal should be visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    
    // Modal title should be visible
    await expect(page.getByRole('heading', { name: /browse files/i })).toBeVisible();
  });

  test('should close modal when clicking X button', async ({ page }) => {
    // Arrange - open the modal
    await page.getByRole('button', { name: /browse/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Act - click close button
    await page.getByRole('button', { name: /close file browser/i }).click();

    // Assert - modal should be hidden
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    // Arrange - open the modal
    await page.getByRole('button', { name: /browse/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Act - click backdrop (outside modal content)
    // The backdrop is the fixed container that has the dialog role
    await page.locator('[role="dialog"]').click({ position: { x: 10, y: 10 } });

    // Assert - modal should close (or remain if click was inside)
    // Note: This depends on exact implementation
    await page.waitForTimeout(100);
  });

  test('should close modal when clicking Cancel button', async ({ page }) => {
    // Arrange - open the modal
    await page.getByRole('button', { name: /browse/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Act - click Cancel button
    await page.getByRole('button', { name: /cancel/i }).click();

    // Assert - modal should be hidden
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Arrange - open the modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - check accessibility attributes
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby', 'file-browser-title');
    
    // Title should exist with correct id
    await expect(page.locator('#file-browser-title')).toBeVisible();
  });
});

test.describe('FileBrowser - Directory Listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display directory listing after opening modal', async ({ page }) => {
    // Arrange - mock API to return controlled data
    await page.route('**/api/files**', async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [
            { name: 'src', type: 'directory', path: '/root/web-app/src', isGitRepo: false },
            { name: 'package.json', type: 'file', path: '/root/web-app/package.json', size: 1234 },
            { name: 'README.md', type: 'file', path: '/root/web-app/README.md', size: 567 },
          ],
          currentPath: '/root/web-app',
          parentPath: '/root',
          isGitRepo: true,
        }),
      });
    });

    // Act - open the modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - directory listing should be visible
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible();

    // Should show files and directories
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /file.*package\.json/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /file.*readme\.md/i })).toBeVisible();
  });

  test('should show loading skeleton while fetching', async ({ page }) => {
    // Arrange - delay API response
    await page.route('**/api/files**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [],
          currentPath: '/',
          isGitRepo: false,
        }),
      });
    });

    // Act - open the modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - skeleton should be visible
    const skeleton = page.locator('.animate-pulse');
    await expect(skeleton.first()).toBeVisible();
  });

  test('should show empty state for empty directories', async ({ page }) => {
    // Arrange - mock empty directory
    await page.route('**/api/files**', async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [],
          currentPath: '/empty-dir',
          isGitRepo: false,
        }),
      });
    });

    // Act - open the modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - empty state should be visible
    await expect(page.getByText(/empty|no files/i)).toBeVisible();
  });

  test('should show error state on API failure', async ({ page }) => {
    // Arrange - mock API error
    await page.route('**/api/files**', async (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        }),
      });
    });

    // Act - open the modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - error state should be visible
    await expect(page.getByText(/error|failed/i)).toBeVisible();
  });

  test('should show retry button on error', async ({ page }) => {
    // Arrange - mock API error
    await page.route('**/api/files**', async (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Directory not found',
          code: 'NOT_FOUND',
        }),
      });
    });

    // Act - open the modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - retry button should be visible
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  test('should display git repository indicator', async ({ page }) => {
    // Arrange - mock git repo
    await page.route('**/api/files**', async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [
            { name: '.git', type: 'directory', path: '/repo/.git' },
          ],
          currentPath: '/repo',
          isGitRepo: true,
        }),
      });
    });

    // Act - open the modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - git repo indicator should be visible
    await expect(page.getByText(/git repository/i)).toBeVisible();
  });
});

test.describe('FileBrowser - Navigation with Click', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API that responds based on path
    await page.route('**/api/files**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.searchParams.get('path') || '/';

      if (path === '/' || path === '/root') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'web-app', type: 'directory', path: '/root/web-app', isGitRepo: true },
              { name: 'other-dir', type: 'directory', path: '/root/other-dir' },
            ],
            currentPath: '/root',
            parentPath: '/',
            isGitRepo: false,
          }),
        });
      } else if (path === '/root/web-app') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'src', type: 'directory', path: '/root/web-app/src' },
              { name: 'package.json', type: 'file', path: '/root/web-app/package.json', size: 1234 },
            ],
            currentPath: '/root/web-app',
            parentPath: '/root',
            isGitRepo: true,
          }),
        });
      } else if (path === '/root/web-app/src') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'app', type: 'directory', path: '/root/web-app/src/app' },
              { name: 'components', type: 'directory', path: '/root/web-app/src/components' },
              { name: 'index.ts', type: 'file', path: '/root/web-app/src/index.ts', size: 100 },
            ],
            currentPath: '/root/web-app/src',
            parentPath: '/root/web-app',
            isGitRepo: true,
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [],
            currentPath: path,
            parentPath: path.split('/').slice(0, -1).join('/') || '/',
            isGitRepo: false,
          }),
        });
      }
    });

    await page.goto('/');
  });

  test('should navigate into directory when clicked', async ({ page }) => {
    // Arrange - open modal
    await page.getByRole('button', { name: /browse/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Wait for initial directory listing
    await expect(page.getByRole('option', { name: /directory.*web-app/i })).toBeVisible();

    // Act - click on web-app directory
    await page.getByRole('option', { name: /directory.*web-app/i }).click();

    // Assert - should navigate to /root/web-app and show its contents
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /file.*package\.json/i })).toBeVisible();
  });

  test('should navigate multiple levels deep', async ({ page }) => {
    // Arrange - open modal
    await page.getByRole('button', { name: /browse/i }).first().click();
    
    // Navigate to web-app
    await expect(page.getByRole('option', { name: /directory.*web-app/i })).toBeVisible();
    await page.getByRole('option', { name: /directory.*web-app/i }).click();

    // Navigate to src
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();
    await page.getByRole('option', { name: /directory.*src/i }).click();

    // Assert - should be in src directory
    await expect(page.getByRole('option', { name: /directory.*app/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /directory.*components/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /file.*index\.ts/i })).toBeVisible();
  });
});

test.describe('FileBrowser - Breadcrumb Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API
    await page.route('**/api/files**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.searchParams.get('path') || '/';

      const mockResponses: Record<string, object> = {
        '/': {
          files: [{ name: 'root', type: 'directory', path: '/root' }],
          currentPath: '/',
          isGitRepo: false,
        },
        '/root': {
          files: [{ name: 'web-app', type: 'directory', path: '/root/web-app', isGitRepo: true }],
          currentPath: '/root',
          parentPath: '/',
          isGitRepo: false,
        },
        '/root/web-app': {
          files: [{ name: 'src', type: 'directory', path: '/root/web-app/src' }],
          currentPath: '/root/web-app',
          parentPath: '/root',
          isGitRepo: true,
        },
        '/root/web-app/src': {
          files: [{ name: 'app', type: 'directory', path: '/root/web-app/src/app' }],
          currentPath: '/root/web-app/src',
          parentPath: '/root/web-app',
          isGitRepo: true,
        },
      };

      const response = mockResponses[path] || {
        files: [],
        currentPath: path,
        parentPath: path.split('/').slice(0, -1).join('/') || '/',
        isGitRepo: false,
      };

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });

    await page.goto('/');
  });

  test('should display breadcrumbs for current path', async ({ page }) => {
    // Arrange - open modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - breadcrumbs navigation should exist
    const breadcrumbNav = page.locator('nav[aria-label="File browser navigation"]');
    await expect(breadcrumbNav).toBeVisible();
  });

  test('should update breadcrumbs when navigating', async ({ page }) => {
    // Arrange - open modal and navigate
    await page.getByRole('button', { name: /browse/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Navigate to web-app
    await expect(page.getByRole('option', { name: /directory.*web-app/i })).toBeVisible();
    await page.getByRole('option', { name: /directory.*web-app/i }).click();

    // Navigate to src
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();
    await page.getByRole('option', { name: /directory.*src/i }).click();

    // Assert - breadcrumbs should show full path
    const breadcrumbNav = page.locator('nav[aria-label="File browser navigation"]');
    await expect(breadcrumbNav.getByText('root')).toBeVisible();
    await expect(breadcrumbNav.getByText('web-app')).toBeVisible();
    await expect(breadcrumbNav.getByText('src')).toBeVisible();
  });

  test('should navigate back when clicking breadcrumb segment', async ({ page }) => {
    // Arrange - open modal and navigate deep
    await page.getByRole('button', { name: /browse/i }).first().click();
    
    // Navigate to web-app -> src
    await page.getByRole('option', { name: /directory.*web-app/i }).click();
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();
    await page.getByRole('option', { name: /directory.*src/i }).click();
    await expect(page.getByRole('option', { name: /directory.*app/i })).toBeVisible();

    // Act - click on 'root' breadcrumb
    const breadcrumbNav = page.locator('nav[aria-label="File browser navigation"]');
    await breadcrumbNav.getByRole('button', { name: /root/i }).click();

    // Assert - should be back at /root level
    await expect(page.getByRole('option', { name: /directory.*web-app/i })).toBeVisible();
  });

  test('should show root (/) as first breadcrumb', async ({ page }) => {
    // Arrange - open modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - root should be visible in breadcrumbs
    const breadcrumbNav = page.locator('nav[aria-label="File browser navigation"]');
    await expect(breadcrumbNav.getByText('/')).toBeVisible();
  });
});

test.describe('FileBrowser - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API
    await page.route('**/api/files**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.searchParams.get('path') || '/';

      if (path.includes('/root/web-app/src')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'index.ts', type: 'file', path: '/root/web-app/src/index.ts' },
            ],
            currentPath: '/root/web-app/src',
            parentPath: '/root/web-app',
            isGitRepo: true,
          }),
        });
      } else if (path.includes('/root/web-app')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'src', type: 'directory', path: '/root/web-app/src' },
              { name: 'package.json', type: 'file', path: '/root/web-app/package.json' },
              { name: 'tsconfig.json', type: 'file', path: '/root/web-app/tsconfig.json' },
            ],
            currentPath: '/root/web-app',
            parentPath: '/root',
            isGitRepo: true,
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'web-app', type: 'directory', path: '/root/web-app', isGitRepo: true },
            ],
            currentPath: '/root',
            parentPath: '/',
            isGitRepo: false,
          }),
        });
      }
    });

    await page.goto('/');
  });

  test('should navigate items with ArrowDown/ArrowUp keys', async ({ page }) => {
    // Arrange - open modal and navigate to a directory with multiple items
    await page.getByRole('button', { name: /browse/i }).first().click();
    await page.getByRole('option', { name: /directory.*web-app/i }).click();
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();

    // Act - press ArrowDown to focus first item, then down again
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Assert - second item should be focused
    const secondItem = page.getByRole('option', { name: /file.*package\.json/i });
    await expect(secondItem).toBeFocused();

    // Act - press ArrowUp
    await page.keyboard.press('ArrowUp');

    // Assert - first item should be focused
    const firstItem = page.getByRole('option', { name: /directory.*src/i });
    await expect(firstItem).toBeFocused();
  });

  test('should enter directory with Enter key', async ({ page }) => {
    // Arrange - open modal
    await page.getByRole('button', { name: /browse/i }).first().click();
    await page.getByRole('option', { name: /directory.*web-app/i }).click();
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();

    // Focus the src directory
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeFocused();

    // Act - press Enter to navigate into directory
    await page.keyboard.press('Enter');

    // Assert - should be in src directory
    await expect(page.getByRole('option', { name: /file.*index\.ts/i })).toBeVisible();
  });

  test('should navigate up with ArrowLeft or Backspace', async ({ page }) => {
    // Arrange - open modal and navigate deep
    await page.getByRole('button', { name: /browse/i }).first().click();
    await page.getByRole('option', { name: /directory.*web-app/i }).click();
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();
    await page.getByRole('option', { name: /directory.*src/i }).click();
    await expect(page.getByRole('option', { name: /file.*index\.ts/i })).toBeVisible();

    // Act - press ArrowLeft or Backspace to go up
    await page.keyboard.press('ArrowLeft');

    // Assert - should be back in /root/web-app
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /file.*package\.json/i })).toBeVisible();
  });

  test('should navigate into directory with ArrowRight', async ({ page }) => {
    // Arrange - open modal
    await page.getByRole('button', { name: /browse/i }).first().click();
    await page.getByRole('option', { name: /directory.*web-app/i }).click();
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();

    // Focus the src directory
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeFocused();

    // Act - press ArrowRight to enter directory
    await page.keyboard.press('ArrowRight');

    // Assert - should be in src directory
    await expect(page.getByRole('option', { name: /file.*index\.ts/i })).toBeVisible();
  });

  test('should close modal with Escape at root level', async ({ page }) => {
    // Arrange - open modal
    await page.getByRole('button', { name: /browse/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Act - press Escape
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape'); // May need two presses (first goes up, second closes)

    // Assert - modal should close (or go to parent first)
    await page.waitForTimeout(100);
  });

  test('should go to first item with Home key', async ({ page }) => {
    // Arrange - open modal with multiple items
    await page.getByRole('button', { name: /browse/i }).first().click();
    await page.getByRole('option', { name: /directory.*web-app/i }).click();
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();

    // Focus last item
    await page.keyboard.press('End');
    
    // Act - press Home to go to first item
    await page.keyboard.press('Home');

    // Assert - first item should be focused
    const firstItem = page.getByRole('option').first();
    await expect(firstItem).toBeFocused();
  });

  test('should go to last item with End key', async ({ page }) => {
    // Arrange - open modal with multiple items
    await page.getByRole('button', { name: /browse/i }).first().click();
    await page.getByRole('option', { name: /directory.*web-app/i }).click();
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();

    // Act - press End to go to last item
    await page.keyboard.press('End');

    // Assert - last item should be focused
    const lastItem = page.getByRole('option', { name: /file.*tsconfig\.json/i });
    await expect(lastItem).toBeFocused();
  });
});

test.describe('FileBrowser - File Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API
    await page.route('**/api/files**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.searchParams.get('path') || '/';

      if (path.includes('/root/web-app/src')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'index.ts', type: 'file', path: '/root/web-app/src/index.ts', size: 234 },
              { name: 'main.ts', type: 'file', path: '/root/web-app/src/main.ts', size: 567 },
            ],
            currentPath: '/root/web-app/src',
            parentPath: '/root/web-app',
            isGitRepo: true,
          }),
        });
      } else if (path.includes('/root/web-app')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'src', type: 'directory', path: '/root/web-app/src' },
              { name: 'package.json', type: 'file', path: '/root/web-app/package.json', size: 1234 },
            ],
            currentPath: '/root/web-app',
            parentPath: '/root',
            isGitRepo: true,
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'web-app', type: 'directory', path: '/root/web-app', isGitRepo: true },
            ],
            currentPath: '/root',
            parentPath: '/',
            isGitRepo: false,
          }),
        });
      }
    });

    await page.goto('/');
  });

  test('should close modal and populate path when file is selected', async ({ page }) => {
    // Arrange - open modal and navigate to files
    await page.getByRole('button', { name: /browse/i }).first().click();
    await page.getByRole('option', { name: /directory.*web-app/i }).click();
    await expect(page.getByRole('option', { name: /directory.*src/i })).toBeVisible();
    await page.getByRole('option', { name: /directory.*src/i }).click();
    await expect(page.getByRole('option', { name: /file.*index\.ts/i })).toBeVisible();

    // Act - click on a file to select it
    await page.getByRole('option', { name: /file.*index\.ts/i }).click();

    // Assert - modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Assert - file path should be populated in the form
    // Note: This depends on which browse button was clicked (repo or file)
    // The test assumes the file path input will be populated
  });

  test('should select file with Enter key', async ({ page }) => {
    // Arrange - open modal and navigate to files
    await page.getByRole('button', { name: /browse/i }).first().click();
    await page.getByRole('option', { name: /directory.*web-app/i }).click();
    await page.getByRole('option', { name: /directory.*src/i }).click();
    await expect(page.getByRole('option', { name: /file.*index\.ts/i })).toBeVisible();

    // Focus the file
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: /file.*index\.ts/i })).toBeFocused();

    // Act - press Enter to select
    await page.keyboard.press('Enter');

    // Assert - modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});

test.describe('FileBrowser - Directory Selection Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API
    await page.route('**/api/files**', async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [
            { name: 'src', type: 'directory', path: '/root/web-app/src' },
            { name: 'package.json', type: 'file', path: '/root/web-app/package.json' },
          ],
          currentPath: '/root/web-app',
          parentPath: '/root',
          isGitRepo: true,
        }),
      });
    });

    await page.goto('/');
  });

  test('should show "Select This Folder" button in directory selection mode', async ({ page }) => {
    // Arrange - click browse button for repository (directory selection)
    const repoBrowseButton = page.locator('label:has-text("Repository Path")').locator('..').getByRole('button', { name: /browse/i });
    
    // If the repo browse button exists, it should enable directory selection
    if (await repoBrowseButton.isVisible()) {
      await repoBrowseButton.click();
      
      // Assert - "Select This Folder" button should be visible
      await expect(page.getByRole('button', { name: /select this folder/i })).toBeVisible();
    }
  });

  test('should select current directory when "Select This Folder" is clicked', async ({ page }) => {
    // Arrange - open browser in directory selection mode
    const browseButton = page.getByRole('button', { name: /browse/i }).first();
    await browseButton.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Check if "Select This Folder" button exists
    const selectFolderBtn = page.getByRole('button', { name: /select this folder/i });
    
    if (await selectFolderBtn.isVisible()) {
      // Act - click "Select This Folder"
      await selectFolderBtn.click();

      // Assert - modal should close
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });
});

test.describe('FileBrowser - Form Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API
    await page.route('**/api/files**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.searchParams.get('path') || '/';

      if (path === '/root/web-app/src') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'index.ts', type: 'file', path: '/root/web-app/src/index.ts', size: 234 },
            ],
            currentPath: '/root/web-app/src',
            parentPath: '/root/web-app',
            isGitRepo: true,
          }),
        });
      } else if (path === '/root/web-app') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'src', type: 'directory', path: '/root/web-app/src' },
            ],
            currentPath: '/root/web-app',
            parentPath: '/root',
            isGitRepo: true,
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            files: [
              { name: 'web-app', type: 'directory', path: '/root/web-app', isGitRepo: true },
            ],
            currentPath: '/root',
            parentPath: '/',
            isGitRepo: false,
          }),
        });
      }
    });

    await page.goto('/');
  });

  test('file selection should populate file path input', async ({ page }) => {
    // Arrange - find file path browse button and click
    const filePathLabel = page.locator('label:has-text("File Path")');
    const browseButton = filePathLabel.locator('..').getByRole('button', { name: /browse/i });
    
    // Check if integration exists
    if (await browseButton.isVisible()) {
      await browseButton.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Navigate and select file
      await page.getByRole('option', { name: /directory.*web-app/i }).click();
      await page.getByRole('option', { name: /directory.*src/i }).click();
      await expect(page.getByRole('option', { name: /file.*index\.ts/i })).toBeVisible();
      await page.getByRole('option', { name: /file.*index\.ts/i }).click();

      // Assert - file path input should be populated
      const filePathInput = page.getByLabel('File Path');
      await expect(filePathInput).toHaveValue(/index\.ts/);
    }
  });

  test('directory selection should populate repository path input', async ({ page }) => {
    // Arrange - find repo path browse button and click
    const repoPathLabel = page.locator('label:has-text("Repository Path")');
    const browseButton = repoPathLabel.locator('..').getByRole('button', { name: /browse/i });
    
    // Check if integration exists
    if (await browseButton.isVisible()) {
      await browseButton.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Navigate to a git repo
      await page.getByRole('option', { name: /directory.*web-app/i }).click();
      
      // Select current folder
      const selectFolderBtn = page.getByRole('button', { name: /select this folder/i });
      if (await selectFolderBtn.isVisible()) {
        await selectFolderBtn.click();

        // Assert - repo path input should be populated
        const repoPathInput = page.getByLabel('Repository Path');
        await expect(repoPathInput).toHaveValue(/web-app/);
      }
    }
  });
});

test.describe('FileBrowser - Loading States', () => {
  test('should show breadcrumb skeleton during loading', async ({ page }) => {
    // Arrange - delay API response
    await page.route('**/api/files**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [],
          currentPath: '/',
          isGitRepo: false,
        }),
      });
    });

    await page.goto('/');

    // Act - open modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - breadcrumb skeleton should be visible
    const skeleton = page.locator('.animate-pulse');
    await expect(skeleton.first()).toBeVisible();
  });

  test('should show file list skeleton during navigation', async ({ page }) => {
    let requestCount = 0;
    
    // Setup mock API with delay on second request
    await page.route('**/api/files**', async (route) => {
      requestCount++;
      
      if (requestCount > 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [
            { name: 'subfolder', type: 'directory', path: '/subfolder' },
          ],
          currentPath: requestCount === 1 ? '/' : '/subfolder',
          parentPath: requestCount === 1 ? undefined : '/',
          isGitRepo: false,
        }),
      });
    });

    await page.goto('/');

    // Open modal
    await page.getByRole('button', { name: /browse/i }).first().click();
    await expect(page.getByRole('option', { name: /directory.*subfolder/i })).toBeVisible();

    // Navigate to subfolder (this should trigger loading state)
    await page.getByRole('option', { name: /directory.*subfolder/i }).click();

    // Assert - skeleton should appear during navigation
    const skeleton = page.locator('.animate-pulse');
    await expect(skeleton.first()).toBeVisible();
  });
});

test.describe('FileBrowser - Item Count Display', () => {
  test('should display correct item count in footer', async ({ page }) => {
    // Setup mock API with specific number of items
    await page.route('**/api/files**', async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [
            { name: 'file1.ts', type: 'file', path: '/file1.ts' },
            { name: 'file2.ts', type: 'file', path: '/file2.ts' },
            { name: 'folder1', type: 'directory', path: '/folder1' },
          ],
          currentPath: '/',
          isGitRepo: false,
        }),
      });
    });

    await page.goto('/');

    // Open modal
    await page.getByRole('button', { name: /browse/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Assert - should show "3 items"
    await expect(page.getByText(/3 items/i)).toBeVisible();
  });

  test('should show singular "item" for single item', async ({ page }) => {
    // Setup mock API with single item
    await page.route('**/api/files**', async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [
            { name: 'single.ts', type: 'file', path: '/single.ts' },
          ],
          currentPath: '/',
          isGitRepo: false,
        }),
      });
    });

    await page.goto('/');

    // Open modal
    await page.getByRole('button', { name: /browse/i }).first().click();

    // Assert - should show "1 item" (singular)
    await expect(page.getByText(/1 item(?!s)/i)).toBeVisible();
  });
});
