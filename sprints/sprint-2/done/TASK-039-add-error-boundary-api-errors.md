# TASK-039: Add error boundary for API errors

| Field | Value |
|-------|-------|
| **Task ID** | TASK-039 |
| **Story** | STORY-006 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Implement error boundary and error handling for API validation errors returned from the server.

## Acceptance Criteria

- [ ] Create error boundary component for API errors
- [ ] Parse structured error responses from TASK-036
- [ ] Map server errors to form field errors
- [ ] Show toast/notification for general API errors
- [ ] Provide retry mechanism for transient errors

## Technical Notes

- Handle network errors vs validation errors differently
- Use React Error Boundary for unexpected errors
- Consider using react-query or SWR error handling patterns

## Implementation

```typescript
async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json();
    
    if (errorData.errors) {
      // Map to form errors
      const fieldErrors: Record<string, string> = {};
      errorData.errors.forEach((err: ValidationError) => {
        if (err.field) {
          fieldErrors[err.field] = err.message;
        }
      });
      throw new ValidationError(fieldErrors);
    }
    
    throw new ApiError(response.status, errorData.message);
  }
  
  return response.json();
}
```

## Dependencies

- TASK-036 (Structured error response format)
- TASK-037 (Form validation integration)

## Blocked By

- TASK-036
- TASK-037
