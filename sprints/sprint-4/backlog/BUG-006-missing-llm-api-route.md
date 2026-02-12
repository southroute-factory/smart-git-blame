# BUG-006: Create Missing /api/llm/explain Route

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-006 |
| **Priority** | HIGH (P0) |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |
| **Sprint** | Sprint 4 (First Task) |

## Description

Create the missing API route that LLMSummary.tsx expects. The component calls `/api/llm/explain` but the route doesn't exist.

## Acceptance Criteria

- [ ] Create /src/app/api/llm/explain/route.ts
- [ ] Accept POST with request body
- [ ] Call Anthropic API with streaming
- [ ] Return streaming response to client
- [ ] Handle all error cases
- [ ] Add integration test

## Technical Implementation

```typescript
// src/app/api/llm/explain/route.ts
export async function POST(request: Request) {
  const { repo, file, commitSha, commitMessage, author, date, apiKey } = await request.json();
  
  // Build context
  // Call Anthropic with streaming
  // Return streamed response
}
```

## Dependencies
- None (P0, do first)

## Root Cause
- Architecture mismatch: llm.ts designed for client-side, component expects server route
- Insufficient integration testing during STORY-012
