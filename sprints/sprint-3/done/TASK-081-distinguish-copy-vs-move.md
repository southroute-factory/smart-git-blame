# TASK-081: Distinguish Copy vs Move

| Field | Value |
|-------|-------|
| **Task ID** | TASK-081 |
| **Story** | STORY-010 |
| **Owner** | BE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Determine whether code was copied (original still exists) or moved (original deleted/modified).

## Acceptance Criteria

- [ ] Check if original code still exists at source location
- [ ] Label as "copied from" if original exists
- [ ] Label as "moved from" if original was deleted/changed
- [ ] Handle partial moves (some lines remain)
- [ ] Include move type in API response

## Technical Notes

To check if original exists:
```bash
# Check if source file still exists at HEAD
git show HEAD:<source-file-path>

# Check if specific lines still exist
git blame HEAD -- <source-file-path> | grep <content>
```

Edge cases:
- File renamed but content same → "moved"
- File still exists with same content → "copied"
- File exists but content changed → "moved" (original evolved)

## Dependencies

- TASK-080

## Blocked By

- TASK-080 API structure must be defined
