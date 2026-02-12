# TASK-082: Cache Cross-File Detection Results

| Field | Value |
|-------|-------|
| **Task ID** | TASK-082 |
| **Story** | STORY-010 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Implement caching for cross-file detection to avoid expensive repeated git operations.

## Acceptance Criteria

- [ ] Cache cross-file detection results per file
- [ ] Cache key includes file path and HEAD commit SHA
- [ ] Set appropriate TTL (or invalidate on HEAD change)
- [ ] Cache misses trigger fresh computation
- [ ] Log cache hit/miss for monitoring

## Technical Notes

Cache key format:
```
crossfile:${repoPath}:${filePath}:${headSha}
```

Implementation options:
- In-memory LRU cache (simpler)
- File-based cache (persistent)
- Map with WeakRef (auto-cleanup)

Consider cache size limits given expensive computation.

## Dependencies

- TASK-081

## Blocked By

- TASK-081 copy/move distinction complete
