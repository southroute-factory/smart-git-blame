# TASK-114: Cache Directory Listings

| Field | Value |
|-------|-------|
| **Task ID** | TASK-114 |
| **Story** | STORY-013 |
| **Owner** | BE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Add caching for directory listings to improve performance on repeated requests.

## Acceptance Criteria

- [ ] Implement in-memory cache for directory listings
- [ ] Cache TTL of 30 seconds (configurable)
- [ ] Invalidate cache on file system changes if possible
- [ ] Cache key based on path and include hidden flag
- [ ] Set appropriate HTTP cache headers
- [ ] Monitor cache hit/miss rates

## Technical Notes

```typescript
import { LRUCache } from 'lru-cache';

const directoryCache = new LRUCache<string, FileEntry[]>({
  max: 100,           // Max 100 directory entries
  ttl: 30 * 1000,     // 30 second TTL
});

function getCacheKey(path: string, includeHidden: boolean): string {
  return `${path}:${includeHidden}`;
}

async function listDirectoryCached(path: string, includeHidden: boolean) {
  const key = getCacheKey(path, includeHidden);
  
  let result = directoryCache.get(key);
  if (!result) {
    result = await listDirectory(path, includeHidden);
    directoryCache.set(key, result);
  }
  
  return result;
}
```

## HTTP Caching

```typescript
return new Response(JSON.stringify(result), {
  headers: {
    'Cache-Control': 'private, max-age=30',
    'Content-Type': 'application/json',
  },
});
```

## Dependencies

- TASK-110

## Blocked By

- Directory listing must work first
