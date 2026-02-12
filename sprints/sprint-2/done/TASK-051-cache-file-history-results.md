# TASK-051: Cache file history results

| Field | Value |
|-------|-------|
| **Task ID** | TASK-051 |
| **Story** | STORY-008 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Implement caching for file history results to improve performance on repeated requests.

## Acceptance Criteria

- [ ] Cache file history results in memory
- [ ] Use repo+file+HEAD as cache key
- [ ] Invalidate cache when HEAD changes
- [ ] Set reasonable TTL (e.g., 5 minutes)
- [ ] Limit cache size to prevent memory issues

## Technical Notes

- Use in-memory LRU cache (consider lru-cache package)
- Include current HEAD SHA in cache key for freshness
- Consider using Redis for production scalability

## Implementation

```typescript
import LRUCache from 'lru-cache';
import { execSync } from 'child_process';

interface CacheKey {
  repo: string;
  file: string;
  head: string;
}

const historyCache = new LRUCache<string, FileHistory>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

function getCacheKey(repo: string, file: string): string {
  const head = execSync('git rev-parse HEAD', { cwd: repo, encoding: 'utf-8' }).trim();
  return `${repo}:${file}:${head}`;
}

export async function getFileHistory(repo: string, file: string): Promise<FileHistory> {
  const key = getCacheKey(repo, file);
  
  const cached = historyCache.get(key);
  if (cached) {
    return cached;
  }
  
  const history = await parseGitLogFollow(repo, file);
  historyCache.set(key, history);
  
  return history;
}
```

## Dependencies

- TASK-049 (Parser to cache results from)
- TASK-050 (API endpoint to integrate caching)

## Blocked By

- TASK-049
