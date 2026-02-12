# TASK-077: Implement git blame -C -C -C Parsing

| Field | Value |
|-------|-------|
| **Task ID** | TASK-077 |
| **Story** | STORY-010 |
| **Owner** | BE |
| **Estimate** | 3h |
| **Status** | Backlog |

## Description

Implement parsing for `git blame -C -C -C` output to detect code moved from other files.

## Acceptance Criteria

- [ ] Execute `git blame -C -C -C --line-porcelain` command
- [ ] Parse `previous` header for original file info
- [ ] Extract source file path when content was copied/moved
- [ ] Handle performance concerns (triple -C is expensive)
- [ ] Implement timeout handling for large repos

## Technical Notes

Command format:
```bash
git blame -C -C -C --line-porcelain <filepath>
```

Triple `-C` searches:
- First -C: within same commit
- Second -C: across commits that created file
- Third -C: across all commits

Output includes:
```
<sha> <orig-line> <final-line> <num-lines>
previous <sha> <original-file-path>
filename <current-file-path>
```

Performance considerations:
- Very expensive on large repos (10k+ files)
- Consider single -C first, triple on demand
- Implement timeouts with partial results

## Dependencies

- STORY-008 and STORY-009 complete (builds on existing blame infrastructure)

## Blocked By

- Nothing
