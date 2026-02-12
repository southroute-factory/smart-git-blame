# STORY-003: View Commit Details for a Line

## Story

**As a** developer,
**I want** to click on a line and see the full commit details,
**So that** I can understand the context of when and why that line was changed.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-003 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P1 |
| **Sprint** | Sprint 1 |
| **Estimated Points** | 3 |

---

## Team Input

### BE (Backend Engineer)
- **Estimate:** 2 points
- **Notes:** git show command parsing straightforward
- **Approach:** Use `git show --stat {sha}` for commit details and file list

### FE (Frontend Engineer)
- **Estimate:** 3 points
- **Notes:** Panel component with layout, animations, close behavior
- **Approach:** Slide-out drawer component, CSS transitions, click-outside handling

### UX (UI/UX Designer)
- **Notes:** Context preservation is key
- **Recommendations:**
  - Slide-out drawer (not modal) - keeps blame view visible
  - Panel width ~400px, slides from right
  - Clear visual hierarchy: SHA, author, date, then message
  - File list collapsible if many files
- **Decision:** Slide-out drawer over modal

### QA (Quality Engineer - Manual)
- **Test Focus:** Panel interactions, data accuracy
- **Key Scenarios:**
  - Open panel, verify all fields populated
  - Click different line, panel updates
  - Close via X button, click outside, escape key
  - Long commit messages display correctly

### QAA (Quality Engineer - Automation)
- **Estimate:** 2 points for test coverage
- **Test Plan:** Panel open/close/update state transitions
- **Priority:** High

---

## Acceptance Criteria

### AC1: Click line to open details panel
**Given** I am viewing the blame view,
**When** I click on a line,
**Then** a details panel opens showing the commit information.

### AC2: Display commit metadata
**Given** the details panel is open,
**When** I view the panel,
**Then** I see:
- Full commit SHA
- Author name and email
- Commit date and time
- Full commit message

### AC3: Display files changed in commit
**Given** the details panel is open,
**When** I view the panel,
**Then** I see a list of files that were modified in that commit.

### AC4: Close panel
**Given** the details panel is open,
**When** I click a close button or click outside the panel,
**Then** the panel closes.

### AC5: Panel updates on new selection
**Given** the details panel is open for one line,
**When** I click on a different line,
**Then** the panel updates to show the new commit's details.

---

## Technical Notes

- Use `git show --stat {sha}` for commit details and file list
- Panel could be slide-out drawer or modal (UX decision)
- Cache commit details to avoid repeated git calls

---

## Dependencies

- STORY-002 (blame view with clickable lines)

---

## Out of Scope

- Viewing the actual diff of changes
- Navigating to other files in the commit
