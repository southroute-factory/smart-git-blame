# TASK-085: Add "View Original File" Link

| Field | Value |
|-------|-------|
| **Task ID** | TASK-085 |
| **Story** | STORY-010 |
| **Owner** | FE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Allow users to click through to view the original file at the commit where the move occurred.

## Acceptance Criteria

- [ ] Add clickable link on source file path
- [ ] Link navigates to blame view of original file
- [ ] Show original file at the specific commit (not HEAD)
- [ ] Handle case where original file no longer exists
- [ ] Accessible link with proper labeling

## Technical Notes

Link construction:
```tsx
<Link 
  href={`/blame?repo=${repoPath}&file=${sourceFile}&commit=${commitSha}`}
  title={`View ${sourceFile} at ${commitSha.slice(0, 7)}`}
>
  View original →
</Link>
```

Handle edge cases:
- Original file deleted: Show "(file no longer exists)" label
- Original still exists: Normal navigation

## Dependencies

- TASK-083

## Blocked By

- TASK-083 move indicator must be in place
