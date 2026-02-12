# TASK-109: Create /api/files Endpoint

| Field | Value |
|-------|-------|
| **Task ID** | TASK-109 |
| **Story** | STORY-013 |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create the main API endpoint for file browser functionality at `/api/files`.

## Acceptance Criteria

- [ ] Create /src/app/api/files/route.ts
- [ ] Accept GET request with `path` query parameter
- [ ] Return JSON response with directory contents
- [ ] Include file metadata (name, type, size, modified date)
- [ ] Handle root path case
- [ ] Return appropriate error responses

## Technical Notes

```typescript
// src/app/api/files/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';
  
  // Validate path
  // List directory contents
  // Return file metadata
}

interface FileEntry {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
  path: string;
}
```

## Dependencies

- None

## Blocked By

- None - can start immediately
