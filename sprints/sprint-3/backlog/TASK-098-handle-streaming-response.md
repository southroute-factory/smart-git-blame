# TASK-098: Handle Streaming Response Display

| Field | Value |
|-------|-------|
| **Task ID** | TASK-098 |
| **Story** | STORY-012 |
| **Owner** | FE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Implement streaming text display for LLM responses with typing effect.

## Acceptance Criteria

- [ ] Display text as it streams in word-by-word
- [ ] Show typing cursor during generation
- [ ] Smooth animation without flickering
- [ ] Handle stream interruption gracefully
- [ ] Support markdown in response

## Technical Notes

```tsx
function StreamingText({ stream }: { stream: AsyncIterable<string> }) {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function consume() {
      for await (const chunk of stream) {
        if (!mounted) break;
        setText(prev => prev + chunk);
      }
      if (mounted) setIsStreaming(false);
    }
    
    consume();
    return () => { mounted = false; };
  }, [stream]);

  return (
    <div className="prose">
      {text}
      {isStreaming && <span className="animate-pulse">▊</span>}
    </div>
  );
}
```

## Dependencies

- TASK-097

## Blocked By

- Anthropic client must be working
