# TASK-036: Return structured validation errors

| Field | Value |
|-------|-------|
| **Task ID** | TASK-036 |
| **Story** | STORY-006 |
| **Owner** | BE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Implement structured error responses for validation failures that the frontend can easily parse and display.

## Acceptance Criteria

- [ ] Define consistent error response format
- [ ] Include field-level errors for form validation
- [ ] Include error codes for programmatic handling
- [ ] Return appropriate HTTP status codes (400, 404)
- [ ] Format Zod validation errors into structured response

## Technical Notes

- Use consistent error structure across all API endpoints
- Include both human-readable messages and error codes
- Support multiple field errors in single response

## Implementation

```typescript
interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

interface ErrorResponse {
  success: false;
  errors: ValidationError[];
}

// Example response:
{
  "success": false,
  "errors": [
    {
      "code": "REPO_NOT_FOUND",
      "message": "Repository path does not exist",
      "field": "repo"
    },
    {
      "code": "FILE_NOT_FOUND", 
      "message": "File does not exist in repository",
      "field": "file"
    }
  ]
}
```

## Dependencies

- TASK-033 (Zod schema for error formatting)
- TASK-034 (Repo validation errors)
- TASK-035 (File validation errors)

## Blocked By

- TASK-033
