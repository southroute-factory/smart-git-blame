# BUG-004: Poor Handling for Uncommitted Changes

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-004 |
| **Priority** | HIGH |
| **Status** | Needs QA Confirmation |
| **Reporter** | Product Owner |
| **Estimate** | QA: 1h confirm, BE: 3h fix |

## Description

The application does not handle uncommitted changes in the repository gracefully. Users may experience errors or unexpected behavior when viewing files with uncommitted modifications.

## Steps to Reproduce
1. Open a repository with uncommitted changes
2. Try to view blame for a modified file
3. Observe behavior

## Expected Behavior
- Clear indication that file has uncommitted changes
- Graceful handling (show warning, or show last committed state)
- No crashes or cryptic errors

## Actual Behavior
Poor handling - needs QA to document specific behavior.

## QA Confirmation Tasks
- [ ] Test with various uncommitted change scenarios:
  - Modified tracked files
  - New untracked files
  - Staged but uncommitted changes
  - Partially staged files
- [ ] Document error messages or failures
- [ ] Capture screenshots/logs
- [ ] Assess user impact

## Fix Tasks (After QA Confirmation)
- [ ] BE to detect uncommitted changes via `git status`
- [ ] Return appropriate response/warning
- [ ] FE to display uncommitted state indicator
- [ ] Add E2E tests for uncommitted scenarios

## Technical Notes
Git commands to detect:
- `git status --porcelain` - shows modified files
- `git diff --name-only` - unstaged changes
- `git diff --cached --name-only` - staged changes

## Dependencies
- QA confirmation required before BE/FE fix
