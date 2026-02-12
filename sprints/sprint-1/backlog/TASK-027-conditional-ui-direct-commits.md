# TASK-027: Conditional UI for direct commits

| Field | Value |
|-------|-------|
| **Task ID** | TASK-027 |
| **Story** | STORY-005 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Update panel UI to handle direct commits differently.

## Acceptance Criteria

- [ ] "View Merge" button hidden when `mergeCommit` is null
- [ ] Panel layout remains consistent (no empty space)
- [ ] No errors when mergeCommit is null

## Technical Notes

- Conditional render based on `commitData.mergeCommit`
- Simple boolean check in JSX

## Code Example

```tsx
{commitData.mergeCommit && (
  <button onClick={handleViewMerge}>View Merge</button>
)}
```

## Dependencies

- TASK-025 (API returns mergeCommit field)
- TASK-021 (merge view exists)

## Blocked By

- TASK-025
