# TASK-010: Add line click handlers

| Field | Value |
|-------|-------|
| **Task ID** | TASK-010 |
| **Story** | STORY-002 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Make lines clickable to trigger commit details panel.

## Acceptance Criteria

- [ ] Each line row is clickable
- [ ] Hover state indicates clickability (cursor, highlight)
- [ ] Click fires callback with line's commit SHA
- [ ] Selected line has distinct visual state

## Technical Notes

- Pass onClick handler as prop to BlameView
- Manage selected line state in parent component
- Use `cursor-pointer` and hover styles

## Dependencies

- TASK-008 (BlameView component)

## Blocked By

- TASK-008
