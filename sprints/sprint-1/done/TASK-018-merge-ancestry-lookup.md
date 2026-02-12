# TASK-018: Implement merge commit ancestry lookup

| Field | Value |
|-------|-------|
| **Task ID** | TASK-018 |
| **Story** | STORY-004 |
| **Owner** | BE |
| **Estimate** | 4h |
| **Status** | Backlog |

## Description

Implement logic to find the merge commit that introduced a given commit to main.

## Acceptance Criteria

- [ ] Given a commit SHA, find its parent merge commit to main
- [ ] Return null if commit was made directly to main
- [ ] Handle edge cases: first commit, orphan branches

## Technical Notes

- Use `git log --merges --ancestry-path {sha}..main --oneline -1`
- If no result, commit was direct to main
- May need to handle different default branch names (main, master)

## Algorithm

```
1. Run ancestry-path query from commit to main
2. If merge found, return first merge SHA
3. If no merge found, return null (direct commit)
```

## Dependencies

- TASK-012 (commit API pattern)

## Blocked By

- TASK-012
