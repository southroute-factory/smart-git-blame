# TASK-099: Create "Explain History" Button in ChangePanel

| Field | Value |
|-------|-------|
| **Task ID** | TASK-099 |
| **Story** | STORY-012 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Add "Explain History" button to the ChangePanel component to trigger LLM explanation.

## Acceptance Criteria

- [ ] Add button in ChangePanel header area
- [ ] Button text: "Explain History" or "💡 Explain"
- [ ] Button disabled when no API key configured
- [ ] Tooltip explains requirement when disabled
- [ ] Click triggers LLM request

## Technical Notes

```tsx
function ChangePanel({ lineData }: { lineData: BlameLine }) {
  const { hasApiKey } = useApiKey();
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="change-panel">
      <header className="flex justify-between items-center">
        <h2>Line History</h2>
        <button
          onClick={() => setShowExplanation(true)}
          disabled={!hasApiKey}
          title={!hasApiKey ? 'Configure API key in settings to enable' : undefined}
          className="btn-secondary"
        >
          💡 Explain History
        </button>
      </header>
      
      {showExplanation && (
        <ExplanationSection lineData={lineData} />
      )}
      
      {/* Existing commit history */}
    </div>
  );
}
```

## Dependencies

- TASK-096 (context gathering)
- TASK-092 (API key context)

## Blocked By

- Lineage context and API key provider must be available
