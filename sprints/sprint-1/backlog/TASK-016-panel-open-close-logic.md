# TASK-016: Implement panel open/close/update logic

| Field | Value |
|-------|-------|
| **Task ID** | TASK-016 |
| **Story** | STORY-003 |
| **Owner** | FE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Wire up panel state management with blame view interactions.

## Acceptance Criteria

- [ ] Clicking line opens panel with that commit's details
- [ ] Clicking different line updates panel content
- [ ] Panel shows loading state while fetching
- [ ] Closing panel deselects line in blame view

## Technical Notes

- Lift state to parent page component
- Use React state for: isOpen, selectedSha, commitData
- Handle loading and error states

## State Flow

```
Line Click → setSelectedSha → fetch commit → setCommitData → panel renders
Close Panel → setSelectedSha(null) → panel hides → line deselected
```

## Dependencies

- TASK-010 (line click handlers)
- TASK-015 (panel content)

## Blocked By

- TASK-015
