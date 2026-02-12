# TASK-023: Create test fixtures repo

| Field | Value |
|-------|-------|
| **Task ID** | TASK-023 |
| **Story** | STORY-004 |
| **Owner** | QAA |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create a git repository with controlled history for testing.

## Acceptance Criteria

- [ ] Repo with known file content and blame history
- [ ] At least one merge commit with multiple child commits
- [ ] At least one direct commit to main
- [ ] Files in multiple languages (.ts, .js, .py, .md)
- [ ] At least one file with 100+ lines
- [ ] Multiple authors in history

## Test Scenarios Covered

| Scenario | Setup |
|----------|-------|
| Standard merge | Branch with 3 commits, merged to main |
| Direct commit | Single commit directly to main |
| Multiple authors | Commits by different authors |
| Large file | File with 100+ lines |
| Various languages | .ts, .js, .py, .md files |

## Technical Notes

- Create as script to regenerate repo
- Store in `test/fixtures/test-repo/` or similar
- Document expected values for assertions

## Dependencies

- None (can be done early)

## Blocked By

- Nothing
