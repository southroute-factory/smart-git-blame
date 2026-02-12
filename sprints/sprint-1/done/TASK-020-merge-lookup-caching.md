# TASK-020: Implement merge lookup caching

| Field | Value |
|-------|-------|
| **Task ID** | TASK-020 |
| **Story** | STORY-004 |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Add caching layer for merge ancestry lookups to improve performance.

## Acceptance Criteria

- [ ] Cache merge lookup results in memory
- [ ] Cache key: `{repoPath}:{commitSha}`
- [ ] Cache hit returns immediately without git command
- [ ] Cache has reasonable TTL or max size

## Technical Notes

- Use simple Map or LRU cache
- Cache is per-request or short-lived (repo state can change)
- Consider using `node-lru-cache` package or simple Map

## Cache Strategy

```typescript
const mergeCache = new Map<string, string | null>();

function getMergeCommit(repo: string, sha: string): string | null {
  const key = `${repo}:${sha}`;
  if (mergeCache.has(key)) {
    return mergeCache.get(key);
  }
  const merge = lookupMergeAncestry(repo, sha);
  mergeCache.set(key, merge);
  return merge;
}
```

## Dependencies

- TASK-018 (merge lookup to cache)

## Blocked By

- TASK-018
