# TASK-086: Create Test Fixtures for Cross-File Moves

| Field | Value |
|-------|-------|
| **Task ID** | TASK-086 |
| **Story** | STORY-010 |
| **Owner** | QAA |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create test fixtures demonstrating cross-file code movement scenarios.

## Acceptance Criteria

- [ ] Create fixture for function extracted to new file
- [ ] Create fixture for code copied between files
- [ ] Create fixture for class split across files
- [ ] Document fixture scenarios in README
- [ ] Fixtures work with git blame -C -C -C

## Test Scenarios

1. **Extract function:**
   - Commit 1: utils.ts with calculateTotal function
   - Commit 2: Move calculateTotal to pricing.ts, delete from utils.ts

2. **Copy function:**
   - Commit 1: helpers.ts with formatDate function
   - Commit 2: Copy formatDate to dateUtils.ts (original remains)

3. **Split class:**
   - Commit 1: Large god-class.ts
   - Commit 2: Split into service.ts, repository.ts, controller.ts

## Location

`test-fixtures/cross-file-moves/`

## Dependencies

- None (can start in parallel)

## Blocked By

- Nothing
