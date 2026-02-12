# TASK-097: Implement Anthropic API Client (Browser-Side)

| Field | Value |
|-------|-------|
| **Task ID** | TASK-097 |
| **Story** | STORY-012 |
| **Owner** | FE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Implement browser-side Anthropic API client for making LLM requests directly from the frontend.

## Acceptance Criteria

- [ ] Create fetch-based Anthropic API client
- [ ] Support streaming responses
- [ ] Use API key from context
- [ ] Handle CORS requirements
- [ ] Implement proper error handling

## Technical Notes

```typescript
interface AnthropicClientOptions {
  apiKey: string;
  model?: string;
}

class AnthropicClient {
  constructor(private options: AnthropicClientOptions) {}

  async createMessage(prompt: string): AsyncGenerator<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.options.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.options.model || 'claude-3-haiku-20240307',
        max_tokens: 500,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    // Handle streaming response
    const reader = response.body?.getReader();
    // ... yield chunks
  }
}
```

Note: Browser access requires special header and has rate limits.

## Dependencies

- STORY-011 (API key must be available)

## Blocked By

- API key configuration complete
