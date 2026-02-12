# STORY-009: Track Line Movement Within File

## Story

**As a** developer,
**I want** to see when a line was moved to a different position in the same file,
**So that** I understand the refactoring history without losing context.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-009 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P1 |
| **Sprint** | Sprint 2 |
| **Estimated Points** | 3 |

---

## Acceptance Criteria

### AC1: Detect line movement within file
**Given** a line at position 45 was previously at position 120
**And** the move happened in commit ABC123
**When** I view the line's history
**Then** I see commit ABC123 marked as a "line moved" event
**And** the previous line number is shown

### AC2: Distinguish move from modification
**Given** a line was moved without content changes
**When** I view the lineage
**Then** the event is labeled as "moved" not "modified"

### AC3: Handle move with modification
**Given** a line was moved AND modified in the same commit
**When** I view the lineage
**Then** both the move and the modification are indicated

---

## Technical Notes

- Use `git blame -M` flag to detect moved lines within a file
- `-M` flag takes optional similarity threshold (default 50%)
- Parse `--line-porcelain` output for previous line numbers
- Movement detection is best-effort based on content similarity

## Team Input

### BE (Backend Engineer)
- **Estimate:** 3 points
- **Approach:** `git blame -M --line-porcelain` provides movement info
- **Notes:** `previous` header in porcelain shows original location

### FE (Frontend Engineer)
- **Estimate:** Included in panel work
- **Notes:** Show "Moved from line X" indicator in lineage

### UX (UI/UX Designer)
- **Recommendation:** Subtle indicator, not as prominent as file renames
- **Visual:** Small arrow icon with line number reference

### QAA (Quality Engineer - Automation)
- **Test Fixtures Needed:** File with lines reordered via refactoring
- **Test Cases:** Movement detected, original position shown

---

## Dependencies

- STORY-002 (blame view)
- STORY-008 (lineage infrastructure)

---

## Out of Scope

- Tracking line splits (one line becomes multiple)
- Tracking line merges (multiple lines become one)
