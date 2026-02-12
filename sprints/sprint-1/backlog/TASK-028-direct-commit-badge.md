# TASK-028: Add direct commit badge/indicator

| Field | Value |
|-------|-------|
| **Task ID** | TASK-028 |
| **Story** | STORY-005 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Add visual indicator showing when viewing a direct commit.

## Acceptance Criteria

- [ ] Badge or label shows "Direct commit" in panel
- [ ] Indicator is subtle (not alarming)
- [ ] Positioned near commit SHA or in header
- [ ] Only appears when `mergeCommit` is null

## Technical Notes

- Small pill/badge component
- Neutral color (gray or blue, not red/yellow)
- Tooltip optional: "This commit was made directly to main"

## Design

```
┌─────────────────────────────┐
│ Commit abc123  [Direct] [Copy] │
```

## Dependencies

- TASK-027 (conditional UI logic)

## Blocked By

- TASK-027
