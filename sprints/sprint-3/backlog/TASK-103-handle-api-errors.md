# TASK-103: Handle API Errors Gracefully

| Field | Value |
|-------|-------|
| **Task ID** | TASK-103 |
| **Story** | STORY-012 |
| **Owner** | FE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Handle Anthropic API errors with clear user feedback.

## Acceptance Criteria

- [ ] Show error message on API failure
- [ ] Handle invalid API key error specifically
- [ ] Handle rate limit errors with retry guidance
- [ ] Handle network errors
- [ ] Keep commit history visible despite error

## Technical Notes

Error handling:
```typescript
try {
  await generateExplanation();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      setErrorMessage('Invalid API key. Please check your settings.');
    } else if (error.status === 429) {
      setErrorMessage('Rate limit reached. Please try again in a few minutes.');
    } else {
      setErrorMessage(`API error: ${error.message}`);
    }
  } else if (error instanceof TypeError) {
    setErrorMessage('Network error. Please check your connection.');
  } else {
    setErrorMessage('Something went wrong. Please try again.');
  }
}
```

UI:
```tsx
{error && (
  <div className="bg-red-50 text-red-700 p-3 rounded">
    ⚠️ {errorMessage}
    <button onClick={retry} className="ml-2 underline">
      Try again
    </button>
  </div>
)}
```

## Dependencies

- TASK-100

## Blocked By

- Summary display must be working
