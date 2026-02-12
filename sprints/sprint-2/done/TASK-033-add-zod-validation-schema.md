# TASK-033: Add Zod validation schema

| Field | Value |
|-------|-------|
| **Task ID** | TASK-033 |
| **Story** | STORY-006 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create a Zod validation schema for the blame API request parameters to ensure type-safe validation.

## Acceptance Criteria

- [ ] Create Zod schema for blame API request
- [ ] Validate `repo` parameter is a valid path string
- [ ] Validate `file` parameter is a valid file path string
- [ ] Export schema for use in API route and client
- [ ] Add custom error messages for each field

## Technical Notes

- Use Zod library for schema validation
- Schema should be reusable on both client and server
- Consider path format validation (no traversal attacks)

## Implementation

```typescript
import { z } from 'zod';

export const blameRequestSchema = z.object({
  repo: z.string()
    .min(1, 'Repository path is required')
    .refine(path => !path.includes('..'), 'Invalid path'),
  file: z.string()
    .min(1, 'File path is required')
    .refine(path => !path.includes('..'), 'Invalid path'),
});

export type BlameRequest = z.infer<typeof blameRequestSchema>;
```

## Dependencies

- None (foundational task)

## Blocked By

- Nothing
