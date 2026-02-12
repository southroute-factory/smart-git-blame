# TASK-006: Create blame API endpoint

| Field | Value |
|-------|-------|
| **Task ID** | TASK-006 |
| **Story** | STORY-002 |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Complete the blame API endpoint to return parsed blame data.

## Acceptance Criteria

- [ ] `/api/blame?repo={path}&file={path}` returns blame data
- [ ] Response includes array of BlameLine objects
- [ ] Response includes file metadata (name, total lines)
- [ ] Returns 500 with error message if git command fails

## Technical Notes

- Integrate TASK-005 parser into API route
- Add basic error handling for git failures

## Response Format

```typescript
interface BlameResponse {
  file: string;
  totalLines: number;
  lines: BlameLine[];
}
```

## Dependencies

- TASK-005 (blame parser)

## Blocked By

- TASK-005
