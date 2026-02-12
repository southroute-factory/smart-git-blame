# TASK-073: Display Uncommitted Indicator in UI

| Field | Value |
|-------|-------|
| **Task ID** | TASK-073 |
| **Bug** | BUG-004 |
| **Owner** | FE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Display warning indicator when viewing a file with uncommitted changes.

## Acceptance Criteria

- [ ] Show warning banner when file has uncommitted changes
- [ ] Display message explaining blame shows last committed state
- [ ] Use appropriate warning styling (yellow/amber)
- [ ] Warning is dismissible

## Technical Notes

UI component:
```tsx
{fileStatus?.hasUncommittedChanges && (
  <WarningBanner>
    ⚠️ This file has uncommitted changes. 
    Showing blame for last committed version.
  </WarningBanner>
)}
```

## Dependencies

- TASK-072

## Blocked By

- BE API changes must be complete
