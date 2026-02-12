# TASK-115: E2E Test Files API

| Field | Value |
|-------|-------|
| **Task ID** | TASK-115 |
| **Story** | STORY-013 |
| **Owner** | QAA |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create end-to-end tests for the files API endpoint.

## Acceptance Criteria

- [ ] Test listing root directory
- [ ] Test listing subdirectories
- [ ] Test hidden files toggle
- [ ] Test git repo detection
- [ ] Test security - path traversal blocked
- [ ] Test security - symlink handling
- [ ] Test error cases (non-existent paths)
- [ ] Test caching behavior
- [ ] All tests pass in CI

## Test Cases

```typescript
describe('/api/files', () => {
  describe('GET', () => {
    it('lists directory contents', async () => {
      const response = await fetch('/api/files?path=/test-fixtures');
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data.entries)).toBe(true);
    });

    it('detects git repository', async () => {
      const response = await fetch('/api/files?path=/test-fixtures/test-repo');
      const data = await response.json();
      expect(data.isGitRepo).toBe(true);
    });

    it('blocks path traversal', async () => {
      const response = await fetch('/api/files?path=../../../etc');
      expect(response.status).toBe(403);
    });

    it('handles non-existent path', async () => {
      const response = await fetch('/api/files?path=/nonexistent');
      expect(response.status).toBe(404);
    });
  });
});
```

## Dependencies

- TASK-109 through TASK-114

## Blocked By

- All backend API tasks must be complete
