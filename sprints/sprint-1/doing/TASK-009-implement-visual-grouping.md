# TASK-009: Implement visual grouping for consecutive lines

| Field | Value |
|-------|-------|
| **Task ID** | TASK-009 |
| **Story** | STORY-002 |
| **Owner** | FE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Add visual grouping to indicate consecutive lines from the same commit.

## Acceptance Criteria

- [ ] Consecutive lines with same SHA share visual grouping
- [ ] Alternating background colors for different commit groups
- [ ] Only show blame info on first line of each group
- [ ] Subtle left border or background band per group

## Technical Notes

- Process blame data to identify groups
- Use CSS for alternating colors
- UX decision: subtle colors (not distracting)

## Dependencies

- TASK-008 (BlameView component)

## Blocked By

- TASK-008
