# Story Writing Session

## Meeting Details

| Field | Value |
|-------|-------|
| **Date** | 2026-02-12 |
| **Time** | -- |
| **Purpose** | Write user stories for Semantic Source Code Viewer MVP |
| **Facilitator** | SM (Scrum Master) |

---

## Attendees

| Role | Name | Present |
|------|------|---------|
| Product Manager | PM | ☑ |
| Scrum Master | SM | ☑ |

---

## Context

Stories derived from Epic Kickoff meeting (2026-02-12). MVP scope:
- Web app (Next.js)
- Local git repo + file path input
- Blame view with clickable lines
- Drill-down to commit/merge details
- Git-only (no GitHub/GitLab API)

---

## Stories Created

| Story ID | Title | Priority |
|----------|-------|----------|
| STORY-001 | Enter repository and file path | P1 |
| STORY-002 | View file with git blame annotations | P1 |
| STORY-003 | View commit details for a line | P1 |
| STORY-004 | View merge commit context | P1 |
| STORY-005 | Handle direct commits to main | P1 |
| STORY-006 | Validate repository and file inputs | P2 |
| STORY-007 | Display loading states | P2 |

---

## Discussion Notes

**PM:** Starting with the core user journey - enter repo, see blame, drill down. Each step is a story.

**SM:** Agreed. Keeping stories small and vertical - each delivers user value independently.

**PM:** Stories 1-5 are P1 (Sprint 1). Stories 6-7 are P2 (Sprint 2) - important but not blocking the core flow.

**SM:** We should also consider error handling as a separate story.

**PM:** Added as part of STORY-006 (validation). We can split later if it grows.

---

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Create story ticket files | PM | 2026-02-12 | ☑ |
| Schedule Backlog Refinement | SM | Before Sprint 1 | ☐ |
| Estimate stories with team | Team | Backlog Refinement | ☐ |

---

*Meeting notes by: SM*
