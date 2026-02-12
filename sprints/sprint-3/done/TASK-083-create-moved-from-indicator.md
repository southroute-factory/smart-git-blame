# TASK-083: Create "Moved From File" Lineage Indicator

| Field | Value |
|-------|-------|
| **Task ID** | TASK-083 |
| **Story** | STORY-010 |
| **Owner** | FE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Display visual indicator in the lineage view when code was moved from another file.

## Acceptance Criteria

- [ ] Show "moved from" or "copied from" label in lineage
- [ ] Display source file name clearly
- [ ] Show commit that performed the move
- [ ] Visual distinction from regular commits
- [ ] Accessible and clear iconography

## Technical Notes

UI design:
```tsx
<LineageEvent type="cross-file-move">
  <Icon name="file-symlink" />
  <span className="text-blue-600">
    {moveType === 'moved' ? 'Moved from' : 'Copied from'}
  </span>
  <FilePath>{sourceFile}</FilePath>
  <CommitInfo sha={commitSha} message={commitMessage} />
</LineageEvent>
```

Use distinct color (blue?) to differentiate from regular commits (gray).

## Dependencies

- TASK-080 (API must return cross-file info)

## Blocked By

- BE API changes must be complete
