# STORY-005: Handle Direct Commits to Main

## Story

**As a** developer,
**I want** direct commits to main (non-merge) to be displayed as standalone change units,
**So that** I have a consistent experience regardless of how changes were introduced.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-005 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P1 |
| **Sprint** | Sprint 1 |
| **Estimated Points** | 2 |

---

## Team Input

### BE (Backend Engineer)
- **Estimate:** 1 point
- **Notes:** Simple logic branch
- **Approach:** If no merge found in ancestry, return `mergeCommit: null`

### FE (Frontend Engineer)
- **Estimate:** 1 point
- **Notes:** Conditional UI rendering
- **Approach:** 
  - Hide "View Merge" button when no merge
  - Show "Direct commit" label/badge
  - Same panel layout otherwise

### UX (UI/UX Designer)
- **Notes:** Keep experience consistent
- **Recommendations:**
  - Subtle badge or icon indicating "Direct commit"
  - Don't make it feel like an error or warning
  - Same information hierarchy as merged commits

### QA (Quality Engineer - Manual)
- **Test Focus:** Both commit paths
- **Key Scenarios:**
  - Line from merged commit (has View Merge)
  - Line from direct commit (no View Merge, shows badge)
  - Mix of both in same file

### QAA (Quality Engineer - Automation)
- **Estimate:** 1 point for test coverage
- **Test Plan:** Add direct commit test case to existing suite
- **Priority:** Medium

---

## Acceptance Criteria

### AC1: Identify direct commits
**Given** I click on a line,
**When** the commit was made directly to main (not via merge),
**Then** the panel indicates this is a "Direct commit" (not part of a merge).

### AC2: No merge link for direct commits
**Given** I am viewing a direct commit's details,
**When** I look for the "View Merge" option,
**Then** no merge link is displayed.

### AC3: Consistent panel layout
**Given** I am viewing a direct commit's details,
**When** I compare to a merged commit's details,
**Then** the layout is consistent (same fields shown, merge section simply absent).

### AC4: Visual indicator
**Given** I am viewing the blame annotations,
**When** a line was introduced via direct commit,
**Then** there is a subtle visual distinction (e.g., different icon or label) from merged commits.

---

## Technical Notes

- Check if commit has merge parent: `git log --merges --ancestry-path {sha}..main`
- If no merge found, treat as direct commit
- Same data model, just `mergeCommit: null`

---

## Dependencies

- STORY-003 (commit details panel)
- STORY-004 (merge commit context - to understand the contrast)

---

## Out of Scope

- Flagging direct commits as "policy violations"
- Statistics on direct vs merged commits
