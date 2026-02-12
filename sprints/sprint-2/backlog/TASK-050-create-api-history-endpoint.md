# TASK-050: Create /api/history endpoint

| Field | Value |
|-------|-------|
| **Task ID** | TASK-050 |
| **Story** | STORY-008 |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create an API endpoint to retrieve file history including rename tracking.

## Acceptance Criteria

- [ ] Create `/api/history` endpoint
- [ ] Accept `repo` and `file` query parameters
- [ ] Return file history with rename information
- [ ] Include validation (reuse from STORY-006)
- [ ] Return appropriate error responses

## Technical Notes

- Reuse validation from TASK-033/034/035
- Consider pagination for files with long history
- Include rate limiting considerations

## Implementation

```typescript
// app/api/history/route.ts
import { NextResponse } from 'next/server';
import { parseGitLogFollow } from '@/lib/git/history';
import { blameRequestSchema } from '@/lib/validation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const validation = blameRequestSchema.safeParse({
    repo: searchParams.get('repo'),
    file: searchParams.get('file'),
  });
  
  if (!validation.success) {
    return NextResponse.json({
      success: false,
      errors: validation.error.issues.map(i => ({
        code: 'VALIDATION_ERROR',
        message: i.message,
        field: i.path[0],
      })),
    }, { status: 400 });
  }
  
  try {
    const history = await parseGitLogFollow(
      validation.data.repo,
      validation.data.file
    );
    
    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      errors: [{ code: 'GIT_ERROR', message: error.message }],
    }, { status: 500 });
  }
}
```

## Dependencies

- TASK-049 (git log --follow parser)
- TASK-033 (Zod validation schema)

## Blocked By

- TASK-049
