# TASK-095: Design Prompt Template for Code Explanation

| Field | Value |
|-------|-------|
| **Task ID** | TASK-095 |
| **Story** | STORY-012 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Design and document the prompt template for generating LLM explanations of code history.

## Acceptance Criteria

- [ ] Create prompt template focused on "why" not "what"
- [ ] Include placeholders for all context types
- [ ] Optimize for concise, developer-relevant output
- [ ] Test prompt with sample data
- [ ] Document token budget and truncation strategy

## Prompt Template (Draft)

```
You are analyzing the history of a line of code to explain why it exists.

Current line (line {lineNumber} in {filePath}):
```
{lineContent}
```

Surrounding context (±5 lines):
```
{surroundingCode}
```

Commit history (oldest to newest):
{commitHistory}

File movements:
{fileMovements}

Cross-file origins:
{crossFileOrigins}

Provide a 2-3 sentence summary explaining:
1. Why this line exists (its purpose)
2. Key changes in its history (if notable)
3. Any important context from file moves or refactoring

Be concise and focus on developer-relevant insights.
```

## Token Budget

- Max total tokens: 4000 (input)
- Reserve for response: 500
- Truncation priority:
  1. Old commits (keep recent)
  2. Surrounding context (reduce from 5 to 3 lines)
  3. Commit messages (truncate long ones)

## Dependencies

- None

## Blocked By

- Nothing
