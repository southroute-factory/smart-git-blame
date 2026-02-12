# TASK-101: Implement Response Caching by Line/Commit

| Field | Value |
|-------|-------|
| **Task ID** | TASK-101 |
| **Story** | STORY-012 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Cache LLM responses to avoid repeated API calls for the same line.

## Acceptance Criteria

- [ ] Cache key: file path + line number + HEAD commit SHA
- [ ] Store in sessionStorage (or memory)
- [ ] Return cached response immediately when available
- [ ] Cache expires on page reload (sessionStorage) or after TTL
- [ ] Log cache hits for debugging

## Technical Notes

```typescript
interface CachedExplanation {
  explanation: string;
  timestamp: number;
}

const CACHE_KEY_PREFIX = 'llm_explanation:';

function getCacheKey(filePath: string, lineNumber: number, headSha: string): string {
  return `${CACHE_KEY_PREFIX}${filePath}:${lineNumber}:${headSha}`;
}

function getCachedExplanation(key: string): string | null {
  const cached = sessionStorage.getItem(key);
  if (!cached) return null;
  
  const { explanation, timestamp } = JSON.parse(cached) as CachedExplanation;
  // Optional: Check TTL
  return explanation;
}

function cacheExplanation(key: string, explanation: string): void {
  sessionStorage.setItem(key, JSON.stringify({
    explanation,
    timestamp: Date.now(),
  }));
}
```

## Dependencies

- TASK-100

## Blocked By

- Summary display must be working
