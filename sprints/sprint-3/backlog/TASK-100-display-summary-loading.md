# TASK-100: Display Summary with Loading States

| Field | Value |
|-------|-------|
| **Task ID** | TASK-100 |
| **Story** | STORY-012 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create the explanation display section with proper loading and completion states.

## Acceptance Criteria

- [ ] Show loading indicator while waiting for response
- [ ] Display "💡 Why This Exists" header
- [ ] Show streaming summary content
- [ ] Final state shows complete summary
- [ ] Collapsible section to minimize

## Technical Notes

```tsx
function ExplanationSection({ lineData }: { lineData: BlameLine }) {
  const { apiKey } = useApiKey();
  const [status, setStatus] = useState<'idle' | 'loading' | 'streaming' | 'done'>('idle');
  const [explanation, setExplanation] = useState('');

  async function generateExplanation() {
    setStatus('loading');
    // Fetch context, build prompt
    // Call Anthropic API
    setStatus('streaming');
    // Stream response
    setStatus('done');
  }

  return (
    <div className="explanation-section">
      <h3>💡 Why This Exists</h3>
      
      {status === 'loading' && (
        <div className="flex items-center gap-2">
          <Spinner />
          <span>Analyzing history...</span>
        </div>
      )}
      
      {(status === 'streaming' || status === 'done') && (
        <StreamingText content={explanation} isComplete={status === 'done'} />
      )}
    </div>
  );
}
```

## Dependencies

- TASK-098

## Blocked By

- Streaming response handling must work
