# TASK-013: Parse git show output

| Field | Value |
|-------|-------|
| **Task ID** | TASK-013 |
| **Story** | STORY-003 |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create parser for `git show --stat` command output.

## Acceptance Criteria

- [ ] Parse commit SHA from output
- [ ] Parse author name and email
- [ ] Parse commit date
- [ ] Parse full commit message (including multi-line)
- [ ] Parse list of changed files from --stat output

## Technical Notes

- Use regex or line-by-line parsing
- Handle multi-line commit messages
- Handle commits with many files

## Example Input

```
commit abc123def456...
Author: John Doe <john@example.com>
Date:   Mon Feb 10 10:00:00 2026 -0500

    feat: add new feature
    
    This is the body of the commit message.

 src/file1.ts | 10 ++++++++++
 src/file2.ts |  5 ++---
 2 files changed, 12 insertions(+), 3 deletions(-)
```

## Dependencies

- TASK-012 (API endpoint to use parser)

## Blocked By

- Nothing (can develop parser independently)
