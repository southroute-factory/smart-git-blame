# TASK-072: Return Uncommitted State in Response

| Field | Value |
|-------|-------|
| **Task ID** | TASK-072 |
| **Bug** | BUG-004 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Add uncommitted file status to API response so frontend can display appropriate warnings.

## Acceptance Criteria

- [ ] Add `fileStatus` field to blame API response
- [ ] Include uncommitted change indicators
- [ ] Return last committed content when file has changes
- [ ] Include warning message for uncommitted state

## Technical Notes

Response structure:
```typescript
interface BlameResponse {
  // ... existing fields
  fileStatus: {
    hasUncommittedChanges: boolean;
    warningMessage?: string;  // "File has uncommitted changes. Showing last committed version."
  };
}
```

## Dependencies

- TASK-071

## Blocked By

- TASK-071 must be complete
