# TASK-003: Implement form submission and navigation

| Field | Value |
|-------|-------|
| **Task ID** | TASK-003 |
| **Story** | STORY-001 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Wire up form submission to navigate to the blame view with URL parameters.

## Acceptance Criteria

- [ ] Form submit navigates to `/blame?repo={repoPath}&file={filePath}`
- [ ] Paths are URL-encoded
- [ ] Form prevents default submission behavior

## Technical Notes

- Use Next.js `useRouter` for navigation
- URL encode paths with `encodeURIComponent`

## Dependencies

- TASK-002 (RepoInput component)

## Blocked By

- TASK-002
