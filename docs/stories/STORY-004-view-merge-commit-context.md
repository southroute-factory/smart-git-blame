# STORY-004: View Merge Commit Context

## Story

**As a** developer,
**I want** to see the parent merge commit that introduced a change to main,
**So that** I can understand the full context of the change (equivalent to viewing a PR).

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-004 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P1 |
| **Sprint** | Sprint 1 |
| **Estimated Points** | 5 |

---

## Team Input

### BE (Backend Engineer)
- **Estimate:** 5 points
- **Notes:** Complex git traversal, most challenging backend story
- **Approach:** 
  - Use `git log --merges --ancestry-path {sha}..main` to find parent merge
  - Use `git log {merge_sha}^..{merge_sha}` to list commits in merge
- **Risk:** Expensive operation on repos with deep history
- **Mitigation:** Cache merge lookups (LRU cache in memory)

### FE (Frontend Engineer)
- **Estimate:** 3 points
- **Notes:** Extend existing panel for merge view
- **Approach:** 
  - "View Merge" button in commit panel
  - Merge view shows message + scrollable commit list
  - Click commit to see its details

### UX (UI/UX Designer)
- **Notes:** Clear visual distinction between commit and merge views
- **Recommendations:**
  - Different header color/icon for merge view
  - Commit list as compact cards with SHA + title
  - Breadcrumb or back button to return to commit view

### QA (Quality Engineer - Manual)
- **Test Focus:** Edge cases with merge histories
- **Key Scenarios:**
  - Standard merge commit
  - Squash merges
  - Merge commits with many commits (10+)
  - Nested merges
- **Action Item:** Need test fixtures with known merge histories

### QAA (Quality Engineer - Automation)
- **Estimate:** 3 points for test coverage
- **Test Plan:** Need repos with various merge patterns
- **Priority:** High
- **Action Item:** Create test fixtures repo with controlled merge history

---

## Acceptance Criteria

### AC1: Show merge commit link
**Given** the commit details panel is open,
**When** the commit was part of a merge to main,
**Then** I see a "View Merge" link/button with the merge commit title.

### AC2: Display merge commit details
**Given** I click "View Merge",
**When** the merge details load,
**Then** I see:
- Merge commit SHA
- Merge author and date
- Full merge commit message (PR description equivalent)

### AC3: List all commits in merge
**Given** I am viewing the merge commit details,
**When** I look at the commits section,
**Then** I see a list of all commits included in that merge.

### AC4: Navigate to individual commits
**Given** I am viewing the list of commits in a merge,
**When** I click on a commit,
**Then** I see that commit's details (as in STORY-003).

### AC5: Visual hierarchy
**Given** I am viewing merge details,
**When** I compare to regular commit view,
**Then** the merge view is visually distinct (e.g., different header, icon, or color).

---

## Technical Notes

- Use `git log --merges --ancestry-path {sha}..main` to find parent merge
- Use `git log {merge_sha}^..{merge_sha}` to list commits in merge
- Cache merge lookups as they're expensive

---

## Dependencies

- STORY-003 (commit details panel)

---

## Out of Scope

- Viewing diffs between merge and main
- Merge conflict information
