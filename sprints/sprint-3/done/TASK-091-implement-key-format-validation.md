# TASK-091: Implement Key Format Validation (Soft)

| Field | Value |
|-------|-------|
| **Task ID** | TASK-091 |
| **Story** | STORY-011 |
| **Owner** | FE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Add soft validation for Anthropic API key format without blocking saves.

## Acceptance Criteria

- [ ] Validate key starts with `sk-ant-`
- [ ] Show warning if format doesn't match
- [ ] Allow saving anyway (soft validation only)
- [ ] Clear warning when format matches
- [ ] Helpful message with expected format

## Technical Notes

```typescript
const ANTHROPIC_KEY_PATTERN = /^sk-ant-/;

function validateApiKeyFormat(key: string): { valid: boolean; warning?: string } {
  if (!key) return { valid: false };
  if (!ANTHROPIC_KEY_PATTERN.test(key)) {
    return {
      valid: true, // Still allow saving
      warning: "This doesn't look like a valid Anthropic API key. Keys typically start with 'sk-ant-'."
    };
  }
  return { valid: true };
}
```

Show warning in yellow below input, but don't disable Save button.

## Dependencies

- TASK-090

## Blocked By

- Persistence must be in place
