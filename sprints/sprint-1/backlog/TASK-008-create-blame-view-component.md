# TASK-008: Create BlameView component

| Field | Value |
|-------|-------|
| **Task ID** | TASK-008 |
| **Story** | STORY-002 |
| **Owner** | FE |
| **Estimate** | 4h |
| **Status** | Backlog |

## Description

Create the main BlameView component that displays file content with blame annotations.

## Acceptance Criteria

- [ ] Display line numbers in left gutter
- [ ] Display blame info (SHA, author, date) per line
- [ ] Display syntax-highlighted code content
- [ ] Responsive layout that handles long lines
- [ ] Monospace font for code

## Technical Notes

- Use CSS Grid or Flexbox for three-column layout
- Integrate Shiki highlighting from TASK-007
- Consider virtualization for large files (defer if needed)
- Located at `src/components/BlameView.tsx`

## Layout

```
| Line # | Blame Info (SHA, Author, Date) | Code Content |
|--------|--------------------------------|--------------|
| 1      | abc123 John 2026-01-15         | import ...   |
| 2      | abc123 John 2026-01-15         | const x = ...   |
```

## Dependencies

- TASK-006 (blame API returns data)
- TASK-007 (syntax highlighting)

## Blocked By

- TASK-006, TASK-007
