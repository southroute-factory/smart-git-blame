# TASK-105: Create /api/llm/explain Route

| Field | Value |
|-------|-------|
| **Task ID** | TASK-105 |
| **Story** | BUG-006 |
| **Owner** | BE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Create the missing API route that LLMSummary.tsx expects at `/api/llm/explain`.

## Acceptance Criteria

- [ ] Create /src/app/api/llm/explain/route.ts
- [ ] Accept POST with JSON body containing repo, file, commitSha, commitMessage, author, date, apiKey
- [ ] Build context from request parameters
- [ ] Call Anthropic API with streaming enabled
- [ ] Return streaming response to client
- [ ] Handle all error cases (missing params, API errors, rate limits)

## Technical Notes

```typescript
// src/app/api/llm/explain/route.ts
export async function POST(request: Request) {
  const { repo, file, commitSha, commitMessage, author, date, apiKey } = await request.json();
  
  // Validate required fields
  // Build prompt with context
  // Call Anthropic with streaming
  // Return streamed response
}
```

## Dependencies

- None (P0 priority task)

## Blocked By

- None - this is the first task to complete
