# BUG-006: Missing /api/llm/explain Route - 404 Error

**Submitted by:** Product Owner
**Date:** 2026-02-12
**Type:** bug
**Priority:** HIGH (P0)
**Affects:** STORY-012 LLM Summary feature - completely broken
**Severity:** Critical - Feature non-functional

## Description

The "Explain History" button in the ChangePanel returns a 404 error. The LLMSummary component attempts to POST to `/api/llm/explain`, but this API route was never created.

## Steps to Reproduce
1. Open blame view for any file
2. Click on a line to open ChangePanel
3. Click "Explain History" button
4. Observe 404 error

## Root Cause

**Architecture mismatch between implementation files:**

1. `src/lib/llm.ts` - Designed for CLIENT-SIDE direct calls to Anthropic API
2. `src/components/LLMSummary.tsx` - Expects SERVER-SIDE route at `/api/llm/explain`

The component calls:
```typescript
const response = await fetch('/api/llm/explain', { method: 'POST', ... });
```

But this route does not exist. Only these API routes exist:
- /api/blame
- /api/commit
- /api/history
- /api/merge

## Impact
- **Severity:** Critical - STORY-012 feature is completely non-functional
- **User Impact:** Cannot use AI explanation feature at all
- **Sprint 3 Deliverable:** Marked complete but actually broken

## Proposed Fix

Create `/src/app/api/llm/explain/route.ts` that:
1. Accepts POST with { repo, file, commitSha, commitMessage, author, date, apiKey }
2. Builds LineageContext using lineage.ts
3. Calls Anthropic API (can use llm.ts functions or direct call)
4. Streams response back to client

## Acceptance Criteria
- [ ] /api/llm/explain route exists
- [ ] Returns streaming response from Anthropic
- [ ] Handles errors (invalid key, rate limit, network)
- [ ] "Explain History" button works end-to-end
- [ ] E2E test verifies functionality

## Process Review Required
This bug indicates a gap in our Definition of Done:
- Feature was marked complete without E2E verification
- Integration between components not tested
- No smoke test before sprint review
