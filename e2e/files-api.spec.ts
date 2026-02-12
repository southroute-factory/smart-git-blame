import { test, expect } from '@playwright/test';

/**
 * E2E tests for /api/files endpoint (TASK-115)
 * 
 * Tests the file browser API endpoint for:
 * - Directory listing functionality
 * - Security (path traversal prevention)
 * - Error handling
 * - Git repository detection
 * 
 * Security is critical - all path validation must happen server-side.
 */

const API_ENDPOINT = '/api/files';

// Test paths using known project structure
const VALID_PATH = '/root/web-app';
const VALID_SUBDIR = '/root/web-app/src';
const GIT_REPO_PATH = '/root/web-app';
const NON_GIT_PATH = '/tmp';
const TEST_FIXTURES_PATH = '/root/web-app/test-fixtures/sample-repo';
const NONEXISTENT_PATH = '/nonexistent/path/that/does/not/exist';

test.describe('/api/files - Directory Listing', () => {
  test('should return directory listing for valid absolute path', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: VALID_PATH },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Should have entries array
    expect(data).toHaveProperty('entries');
    expect(Array.isArray(data.entries)).toBe(true);
    expect(data.entries.length).toBeGreaterThan(0);
    
    // Check entry structure
    const entry = data.entries[0];
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('type');
    expect(['file', 'directory']).toContain(entry.type);
  });

  test('should return entries with correct metadata structure', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: VALID_PATH },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Find a known file or directory
    const srcEntry = data.entries.find((e: { name: string }) => e.name === 'src');
    expect(srcEntry).toBeDefined();
    expect(srcEntry.type).toBe('directory');
    expect(srcEntry).toHaveProperty('path');
  });

  test('should list contents of subdirectory', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: VALID_SUBDIR },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.entries.length).toBeGreaterThan(0);
    
    // Should find app directory in src
    const appEntry = data.entries.find((e: { name: string }) => e.name === 'app');
    expect(appEntry).toBeDefined();
    expect(appEntry.type).toBe('directory');
  });
});

test.describe('/api/files - Input Validation', () => {
  test('should return 400 for missing path parameter', async ({ request }) => {
    // Act - no path parameter
    const response = await request.get(API_ENDPOINT);

    // Assert
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/path|required|missing/i);
  });

  test('should return 400 for empty path parameter', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: '' },
    });

    // Assert
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should return 400 for relative path', async ({ request }) => {
    // Act - relative path without leading /
    const response = await request.get(API_ENDPOINT, {
      params: { path: 'relative/path/to/dir' },
    });

    // Assert
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/absolute|invalid/i);
  });

  test('should return 400 for path starting with ./', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: './some/path' },
    });

    // Assert
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});

test.describe('/api/files - Security: Path Traversal Prevention', () => {
  /**
   * CRITICAL: These tests verify that path traversal attacks are blocked.
   * The API must validate paths server-side to prevent directory escape.
   */

  test('should return 400 for path with ../ traversal', async ({ request }) => {
    // Act - attempt to escape using ../
    const response = await request.get(API_ENDPOINT, {
      params: { path: '/root/web-app/../../../etc' },
    });

    // Assert - should be blocked with 400 (invalid path)
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/traversal|invalid|blocked/i);
  });

  test('should return 400 for encoded path traversal (%2e%2e)', async ({ request }) => {
    // Act - URL-encoded ..
    const response = await request.get(API_ENDPOINT, {
      params: { path: '/root/web-app/%2e%2e/%2e%2e/etc' },
    });

    // Assert
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should return 400 for double-encoded traversal', async ({ request }) => {
    // Act - double-encoded ..
    const response = await request.get(API_ENDPOINT, {
      params: { path: '/root/web-app/%252e%252e/etc' },
    });

    // Assert
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should return 400 for path with null byte', async ({ request }) => {
    // Act - null byte injection
    const response = await request.get(API_ENDPOINT, {
      params: { path: '/root/web-app\x00/etc/passwd' },
    });

    // Assert
    expect(response.status()).toBe(400);
  });

  test('should return 400 for path traversal in middle of path', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: '/root/web-app/src/../../../../../../etc/passwd' },
    });

    // Assert
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should return 400 for backslash path traversal', async ({ request }) => {
    // Act - Windows-style path traversal (should still be blocked on Linux)
    const response = await request.get(API_ENDPOINT, {
      params: { path: '/root/web-app\\..\\..\\etc' },
    });

    // Assert
    expect(response.status()).toBe(400);
  });
});

test.describe('/api/files - Non-existent Paths', () => {
  test('should return 404 for non-existent directory', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: NONEXISTENT_PATH },
    });

    // Assert
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/not found|does not exist|no such/i);
  });

  test('should return 404 for path to a file (not directory)', async ({ request }) => {
    // Act - package.json is a file, not directory
    const response = await request.get(API_ENDPOINT, {
      params: { path: '/root/web-app/package.json' },
    });

    // Assert - should return 404 or appropriate error (not a directory)
    expect([400, 404]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should return 404 for path with non-existent parent', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: '/nonexistent-parent/child/grandchild' },
    });

    // Assert
    expect(response.status()).toBe(404);
  });
});

test.describe('/api/files - Git Repository Detection', () => {
  test('should return isGitRepo: true for git repository', async ({ request }) => {
    // Act - /root/web-app is a git repo
    const response = await request.get(API_ENDPOINT, {
      params: { path: GIT_REPO_PATH },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('isGitRepo');
    expect(data.isGitRepo).toBe(true);
  });

  test('should return isGitRepo: true for test fixtures sample repo', async ({ request }) => {
    // Act - test fixtures has a sample git repo
    const response = await request.get(API_ENDPOINT, {
      params: { path: TEST_FIXTURES_PATH },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('isGitRepo');
    expect(data.isGitRepo).toBe(true);
  });

  test('should return isGitRepo: false for non-git directory', async ({ request }) => {
    // Act - /tmp is not a git repo
    const response = await request.get(API_ENDPOINT, {
      params: { path: NON_GIT_PATH },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('isGitRepo');
    expect(data.isGitRepo).toBe(false);
  });

  test('should return isGitRepo: true for subdirectory within git repo', async ({ request }) => {
    // Act - src is inside a git repo
    const response = await request.get(API_ENDPOINT, {
      params: { path: VALID_SUBDIR },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('isGitRepo');
    expect(data.isGitRepo).toBe(true);
  });
});

test.describe('/api/files - File Type Detection', () => {
  test('should correctly identify directories', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: VALID_PATH },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // src should be a directory
    const srcEntry = data.entries.find((e: { name: string }) => e.name === 'src');
    expect(srcEntry).toBeDefined();
    expect(srcEntry.type).toBe('directory');
    
    // node_modules should be a directory if present
    const nodeModulesEntry = data.entries.find((e: { name: string }) => e.name === 'node_modules');
    if (nodeModulesEntry) {
      expect(nodeModulesEntry.type).toBe('directory');
    }
  });

  test('should correctly identify files', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: VALID_PATH },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // package.json should be a file
    const packageJsonEntry = data.entries.find((e: { name: string }) => e.name === 'package.json');
    expect(packageJsonEntry).toBeDefined();
    expect(packageJsonEntry.type).toBe('file');
    
    // tsconfig.json should be a file
    const tsconfigEntry = data.entries.find((e: { name: string }) => e.name === 'tsconfig.json');
    expect(tsconfigEntry).toBeDefined();
    expect(tsconfigEntry.type).toBe('file');
  });

  test('should return TypeScript files with file type', async ({ request }) => {
    // Act - list test-fixtures sample repo src
    const response = await request.get(API_ENDPOINT, {
      params: { path: `${TEST_FIXTURES_PATH}/src` },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Should have example.ts
    const exampleTs = data.entries.find((e: { name: string }) => e.name === 'example.ts');
    expect(exampleTs).toBeDefined();
    expect(exampleTs.type).toBe('file');
  });

  test('should handle mixed directory contents', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: VALID_PATH },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Should have both files and directories
    const files = data.entries.filter((e: { type: string }) => e.type === 'file');
    const directories = data.entries.filter((e: { type: string }) => e.type === 'directory');
    
    expect(files.length).toBeGreaterThan(0);
    expect(directories.length).toBeGreaterThan(0);
  });
});

test.describe('/api/files - Response Format', () => {
  test('should return JSON content type', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: VALID_PATH },
    });

    // Assert
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('should return consistent error response structure', async ({ request }) => {
    // Act - trigger a validation error
    const response = await request.get(API_ENDPOINT, {
      params: { path: '../invalid' },
    });

    // Assert
    expect(response.status()).toBe(400);
    const data = await response.json();
    
    // Error responses should have consistent structure
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
    
    // Optionally may have error code
    if (data.code) {
      expect(typeof data.code).toBe('string');
    }
  });

  test('should return path in response for valid requests', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: VALID_PATH },
    });

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('path');
    expect(data.path).toBe(VALID_PATH);
  });
});

test.describe('/api/files - Edge Cases', () => {
  test('should handle paths with trailing slash', async ({ request }) => {
    // Act
    const response = await request.get(API_ENDPOINT, {
      params: { path: `${VALID_PATH}/` },
    });

    // Assert - should work (normalize trailing slash)
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('entries');
  });

  test('should handle root path', async ({ request }) => {
    // Act - root filesystem path
    const response = await request.get(API_ENDPOINT, {
      params: { path: '/' },
    });

    // Assert - should work
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('entries');
    expect(Array.isArray(data.entries)).toBe(true);
  });

  test('should handle paths with spaces (if they exist)', async ({ request }) => {
    // This is more of a format validation - the path may not exist
    // but the request format should be valid
    const response = await request.get(API_ENDPOINT, {
      params: { path: '/root/path with spaces' },
    });

    // Assert - should return 404 (not found) not 400 (bad request)
    // unless path validation rejects it
    expect([200, 404]).toContain(response.status());
  });
});
