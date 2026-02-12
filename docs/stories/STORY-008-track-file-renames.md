# STORY-008: Track Line History Across File Renames

## Story

**As a** developer,
**I want** to see the full history of a line including when its file was renamed,
**So that** I can trace code changes even after refactoring moved files around.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-008 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P1 |
| **Sprint** | Sprint 2 |
| **Estimated Points** | 5 |

---

## Acceptance Criteria

### AC1: Detect file renames in lineage
**Given** a file "src/new-name.ts" was renamed from "src/old-name.ts"
**When** I view the blame for a line in "src/new-name.ts"
**And** that line existed before the rename
**Then** the lineage shows the commit where the file was renamed
**And** displays both the old and new file paths

### AC2: Lineage displays in chronological order
**Given** a line has history spanning multiple file renames
**When** I view the full lineage
**Then** events are shown oldest to newest
**And** each rename is clearly marked with before/after paths

### AC3: Performance requirement
**Given** a repository with 10,000+ commits
**When** I click on a line to view history
**Then** the lineage loads within 3 seconds
**Or** I see a loading indicator with progress

### AC4: Multiple rename chain
**Given** a file was renamed A → B → C → D
**When** I view a line's lineage
**Then** all rename steps are visible in the history

---

## Technical Notes

- Use `git log --follow --name-status -- <file>` to detect renames
- Use `git blame --follow` for blame across renames
- Cache results per file path + commit SHA
- Consider using `-M` flag with similarity threshold

## Team Input

### BE (Backend Engineer)
- **Estimate:** 5 points
- **Approach:** Use `git log --follow --name-status` to build rename chain
- **Risk:** Large repos with many renames may be slow
- **Mitigation:** Cache aggressively, use `--first-parent` for initial pass

### FE (Frontend Engineer)
- **Estimate:** Included in panel work
- **Notes:** Display rename events in lineage timeline with visual distinction

### UX (UI/UX Designer)
- **Recommendation:** Show renames as distinct nodes in timeline with "═" thick connector
- **Visual:** Different icon for rename events vs regular commits

### QAA (Quality Engineer - Automation)
- **Test Fixtures Needed:** Repos with simple rename, directory move, rename chain
- **Test Cases:** Verify all renames detected, chronological order correct

---

## Dependencies

- STORY-002 (blame view exists)
- STORY-003 (commit panel exists)

---

## Out of Scope

- Detecting content-based moves (without git rename)
- Cross-repository tracking
