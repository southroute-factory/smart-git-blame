# TASK-041: Unit tests for Zod schema

| Field | Value |
|-------|-------|
| **Task ID** | TASK-041 |
| **Story** | STORY-006 |
| **Owner** | QAA |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create unit tests for the Zod validation schema to ensure correct validation behavior.

## Acceptance Criteria

- [ ] Test valid inputs pass validation
- [ ] Test empty strings fail validation
- [ ] Test path traversal patterns are rejected
- [ ] Test edge cases (special characters, unicode)
- [ ] Test error messages are correct
- [ ] Achieve 100% coverage on schema module

## Technical Notes

- Use Bun test runner for unit tests
- Test schema independently from API
- Include boundary conditions

## Test Cases

```typescript
import { describe, test, expect } from 'bun:test';
import { blameRequestSchema } from './validation';

describe('blameRequestSchema', () => {
  test('accepts valid input', () => {
    const result = blameRequestSchema.safeParse({
      repo: '/path/to/repo',
      file: 'src/index.ts',
    });
    expect(result.success).toBe(true);
  });
  
  test('rejects empty repo', () => {
    const result = blameRequestSchema.safeParse({
      repo: '',
      file: 'file.ts',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Repository path is required');
  });
  
  test('rejects path traversal', () => {
    const result = blameRequestSchema.safeParse({
      repo: '../../../etc',
      file: 'passwd',
    });
    expect(result.success).toBe(false);
  });
  
  test('handles special characters', () => {
    const result = blameRequestSchema.safeParse({
      repo: '/path/to/my-repo',
      file: 'src/components/MyComponent.tsx',
    });
    expect(result.success).toBe(true);
  });
});
```

## Dependencies

- TASK-033 (Zod schema must exist)

## Blocked By

- TASK-033
