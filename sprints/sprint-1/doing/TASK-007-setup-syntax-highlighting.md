# TASK-007: Set up syntax highlighting (Shiki)

| Field | Value |
|-------|-------|
| **Task ID** | TASK-007 |
| **Story** | STORY-002 |
| **Owner** | FE |
| **Estimate** | 3h |
| **Status** | Backlog |

## Description

Integrate Shiki syntax highlighting library for code display.

## Acceptance Criteria

- [ ] Shiki installed and configured
- [ ] Utility function to highlight code by language
- [ ] Language detection from file extension
- [ ] Support for common languages: JS, TS, Python, Go, Rust, JSON, YAML, MD

## Technical Notes

- Use `shiki` package
- Pre-load common themes (dark theme default)
- Consider server-side highlighting to reduce client bundle
- Fallback: plain text if language unknown

## Dependencies

- None (can be done in parallel)

## Blocked By

- Nothing
