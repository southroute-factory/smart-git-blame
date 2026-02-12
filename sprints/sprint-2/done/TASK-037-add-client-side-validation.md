# TASK-037: Add client-side validation to form

| Field | Value |
|-------|-------|
| **Task ID** | TASK-037 |
| **Story** | STORY-006 |
| **Owner** | FE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Implement client-side form validation using the shared Zod schema before submission.

## Acceptance Criteria

- [ ] Validate form fields on blur and submit
- [ ] Use shared Zod schema from backend
- [ ] Prevent form submission with invalid data
- [ ] Show immediate feedback for invalid inputs
- [ ] Clear errors when user corrects input

## Technical Notes

- Reuse Zod schema from TASK-033
- Consider using react-hook-form with zod resolver
- Implement debounced validation for better UX

## Implementation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blameRequestSchema, type BlameRequest } from '@/lib/validation';

function BlameForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<BlameRequest>({
    resolver: zodResolver(blameRequestSchema),
  });
  
  const onSubmit = (data: BlameRequest) => {
    // Submit to API
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('repo')} />
      {errors.repo && <span>{errors.repo.message}</span>}
      {/* ... */}
    </form>
  );
}
```

## Dependencies

- TASK-033 (Zod schema must be exported and shareable)

## Blocked By

- TASK-033
