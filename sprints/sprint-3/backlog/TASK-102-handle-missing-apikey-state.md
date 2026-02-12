# TASK-102: Handle Missing API Key State

| Field | Value |
|-------|-------|
| **Task ID** | TASK-102 |
| **Story** | STORY-012 |
| **Owner** | FE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Show helpful message when user tries to use LLM feature without API key.

## Acceptance Criteria

- [ ] Show "API key required" message
- [ ] Include link to settings to configure
- [ ] Message is friendly and actionable
- [ ] Don't block viewing regular commit history

## Technical Notes

```tsx
function ExplanationSection({ lineData }: { lineData: BlameLine }) {
  const { hasApiKey } = useApiKey();

  if (!hasApiKey) {
    return (
      <div className="bg-muted p-4 rounded">
        <p className="text-muted-foreground">
          🔑 API key required for AI explanations.
        </p>
        <button 
          onClick={openSettings}
          className="text-blue-600 hover:underline mt-2"
        >
          Configure in Settings →
        </button>
      </div>
    );
  }

  // ... normal explanation UI
}
```

## Dependencies

- TASK-092 (API key context)

## Blocked By

- API key context must be available
