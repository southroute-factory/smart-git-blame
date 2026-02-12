# TASK-090: Add localStorage Persistence for Key

| Field | Value |
|-------|-------|
| **Task ID** | TASK-090 |
| **Story** | STORY-011 |
| **Owner** | FE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Implement secure localStorage persistence for the Anthropic API key.

## Acceptance Criteria

- [ ] Save key to localStorage with key `anthropic_api_key`
- [ ] Load saved key on settings page open
- [ ] Show confirmation "API key saved" on successful save
- [ ] Key is NOT sent to any server
- [ ] Handle localStorage errors gracefully

## Technical Notes

```typescript
const STORAGE_KEY = 'anthropic_api_key';

export function saveApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch (e) {
    console.error('Failed to save API key:', e);
    throw new Error('Could not save API key. Check browser storage settings.');
  }
}

export function getApiKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
```

**Security:** Never log the actual key value.

## Dependencies

- TASK-089

## Blocked By

- Input component must be complete
