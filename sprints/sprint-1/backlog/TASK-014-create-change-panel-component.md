# TASK-014: Create ChangePanel slide-out component

| Field | Value |
|-------|-------|
| **Task ID** | TASK-014 |
| **Story** | STORY-003 |
| **Owner** | FE |
| **Estimate** | 3h |
| **Status** | Backlog |

## Description

Create the slide-out panel component for displaying commit/merge details.

## Acceptance Criteria

- [ ] Panel slides in from right side
- [ ] Panel width ~400px
- [ ] Close button (X) in header
- [ ] Click outside panel closes it
- [ ] Escape key closes panel
- [ ] Smooth CSS transition animation

## Technical Notes

- Use fixed positioning with transform for slide
- Add backdrop overlay (semi-transparent)
- Trap focus within panel for accessibility
- Located at `src/components/ChangePanel.tsx`

## Dependencies

- None (can build shell independently)

## Blocked By

- Nothing
