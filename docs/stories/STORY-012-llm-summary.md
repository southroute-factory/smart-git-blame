# STORY-012: Generate LLM Summary of Line History

## Story

**As a** developer,
**I want** to get an AI-generated explanation of why a line of code exists,
**So that** I can quickly understand the context without reading through all commits.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-012 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P1 |
| **Sprint** | Sprint 3 |
| **Estimated Points** | 5 |

---

## Acceptance Criteria

### AC1: Trigger summary generation
**Given** I am viewing the commit panel for a line
**And** I have configured my Anthropic API key
**When** I click "Explain History"
**Then** an LLM request is initiated
**And** I see a loading indicator

### AC2: Display streaming summary
**Given** the LLM request is in progress
**When** tokens are received
**Then** the summary streams in word-by-word
**And** I see typing indicator during generation

### AC3: Summary content quality
**Given** the LLM request completes successfully
**When** the summary is displayed
**Then** I see a 2-4 sentence explanation
**And** the explanation references specific commits or events from the lineage
**And** the explanation focuses on "why" not just "what"

### AC4: Handle missing API key
**Given** I have NOT configured an API key
**When** I click "Explain History"
**Then** I see a message "API key required"
**And** a link to configure it in settings

### AC5: Handle API errors
**Given** my API key is invalid or the request fails
**When** I click "Explain History"
**Then** I see an error message explaining the issue
**And** the full commit history remains visible below

### AC6: Context sent to LLM
**Given** I request an explanation
**When** the LLM processes the request
**Then** it receives:
- The current line content
- Surrounding code context (±5 lines)
- The full commit chain
- File rename history (if any)
- The merge commit context (if any)

### AC7: Cache responses
**Given** I request explanation for a line
**When** I request the same explanation again
**Then** the cached response is shown immediately
**And** no new API call is made

---

## Technical Notes

- API call made from browser directly to Anthropic (no proxy needed for MVP)
- Use streaming for better UX
- Cache by: file path + line number + HEAD commit SHA
- Prompt engineering for concise, developer-focused output
- Token limit handling: truncate history if > 4000 tokens

## Prompt Template (Draft)

```
You are analyzing the history of a line of code to explain why it exists.

Current line (line {lineNumber} in {filePath}):
```
{lineContent}
```

Surrounding context:
```
{surroundingCode}
```

Commit history (oldest to newest):
{commitHistory}

File movements:
{fileMovements}

Provide a 2-3 sentence summary explaining:
1. Why this line exists (its purpose)
2. Key changes in its history (if notable)
3. Any important context from file moves or refactoring

Be concise and focus on developer-relevant insights.
```

## Team Input

### BE (Backend Engineer)
- **Estimate:** 3 points
- **Work:** 
  - Gather lineage context for prompt
  - Format prompt with token limits
  - Handle Anthropic API response parsing
- **Notes:** Consider API route for key security (optional for MVP)

### FE (Frontend Engineer)
- **Estimate:** 3 points
- **Components:**
  - "Explain History" button in ChangePanel
  - Streaming text display with cursor
  - Loading/error states
  - Collapsible summary section
- **Pattern:** Use SSE or fetch with streaming

### UX (UI/UX Designer)
- **Summary Display:**
  - Prominent section labeled "💡 WHY THIS EXISTS"
  - Distinct from raw git data
  - Thumbs up/down feedback option
- **Trust indicators:**
  - "Based on X commits, Y file moves"
  - Link to view source data

### QAA (Quality Engineer - Automation)
- **Challenge:** LLM output is non-deterministic
- **Strategy:**
  - Mock API for unit/integration tests
  - Verify correct context sent in prompt
  - Validate output structure (not exact content)
  - 1-2 e2e tests with real API (nightly only)

---

## Dependencies

- STORY-011 (API key configuration)
- STORY-008 (file rename tracking for context)
- STORY-009 (line movement tracking for context)

---

## Out of Scope

- Multiple LLM provider support
- Custom prompt configuration
- Conversation/follow-up questions
- Caching on server-side
