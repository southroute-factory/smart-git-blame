# STORY-002: View File with Git Blame Annotations

## Story

**As a** developer,
**I want** to see a file displayed with git blame annotations for each line,
**So that** I can identify when and by whom each line was last modified.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-002 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P1 |
| **Sprint** | Sprint 1 |
| **Estimated Points** | 5 |

---

## Team Input

### BE (Backend Engineer)
- **Estimate:** 3 points
- **Notes:** git blame parsing requires structured response
- **Approach:** Use `git blame --porcelain` for machine-readable output, parse into JSON
- **Risk:** Large files may be slow - consider streaming

### FE (Frontend Engineer)
- **Estimate:** 5 points
- **Notes:** Line rendering, syntax highlighting, visual grouping adds complexity
- **Approach:** Virtualized list for large files, Prism or Shiki for syntax highlighting
- **Decision Needed:** Select syntax highlighting library before sprint

### UX (UI/UX Designer)
- **Notes:** Visual grouping critical for scannability
- **Recommendations:** 
  - Background color bands for consecutive lines from same commit
  - Subtle hover state to indicate clickability
  - Monospace font for code, proportional for blame metadata
- **Action Item:** Finalize visual grouping design before Sprint 1

### QA (Quality Engineer - Manual)
- **Test Focus:** Various file types, large files, syntax highlighting accuracy
- **Key Scenarios:** 
  - Different languages (.js, .ts, .py, .md)
  - Files with 1000+ lines
  - Files with many authors
  - Binary files (should error gracefully)

### QAA (Quality Engineer - Automation)
- **Estimate:** 2 points for test coverage
- **Test Plan:** Multiple assertions per line (SHA, author, date, content)
- **Priority:** High
- **Notes:** Need visual regression tests for syntax highlighting

---

## Acceptance Criteria

### AC1: Display file content with line numbers
**Given** I have submitted a valid repository and file path,
**When** the blame view loads,
**Then** I see the file content displayed with line numbers.

### AC2: Show blame annotation per line
**Given** I am viewing the blame view,
**When** I look at any line,
**Then** I see the commit SHA (abbreviated), author name, and date for that line.

### AC3: Visual grouping of consecutive lines
**Given** multiple consecutive lines were modified in the same commit,
**When** I view those lines,
**Then** they are visually grouped (e.g., shared background color or border).

### AC4: Lines are clickable
**Given** I am viewing the blame view,
**When** I hover over a line,
**Then** the line is highlighted to indicate it is clickable.

### AC5: Syntax highlighting
**Given** I am viewing a source code file,
**When** the blame view renders,
**Then** the code has basic syntax highlighting appropriate to the file type.

---

## Technical Notes

- Use `git blame --porcelain` for structured output
- Detect file type from extension for syntax highlighting
- Consider virtualized list for large files (optimization, can defer)

---

## Dependencies

- STORY-001 (input form provides repo/file path)

---

## Out of Scope

- Code folding
- Search within file
- Multi-file navigation
