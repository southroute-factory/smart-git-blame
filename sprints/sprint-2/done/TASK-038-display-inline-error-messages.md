# TASK-038: Display inline error messages

| Field | Value |
|-------|-------|
| **Task ID** | TASK-038 |
| **Story** | STORY-006 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create UI components to display validation error messages inline with form fields.

## Acceptance Criteria

- [ ] Create reusable error message component
- [ ] Display errors below relevant form fields
- [ ] Style errors with appropriate visual treatment (red, icon)
- [ ] Support both client-side and server-side errors
- [ ] Animate error appearance/disappearance

## Technical Notes

- Use consistent styling with existing design system
- Consider accessibility (aria-invalid, aria-describedby)
- Handle multiple errors per field

## Implementation

```typescript
interface FieldErrorProps {
  message?: string;
  fieldId: string;
}

function FieldError({ message, fieldId }: FieldErrorProps) {
  if (!message) return null;
  
  return (
    <span 
      id={`${fieldId}-error`}
      role="alert"
      className="text-red-500 text-sm mt-1 flex items-center gap-1"
    >
      <AlertIcon className="w-4 h-4" />
      {message}
    </span>
  );
}
```

## Dependencies

- TASK-037 (Client-side validation provides error state)

## Blocked By

- TASK-037
