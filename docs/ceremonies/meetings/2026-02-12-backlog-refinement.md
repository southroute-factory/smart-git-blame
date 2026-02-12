# Backlog Refinement Meeting

## Meeting Details

| Field | Value |
|-------|-------|
| **Date** | 2026-02-12 |
| **Epic** | EPIC-001: Semantic Source Code Viewer |
| **Purpose** | Estimate stories, clarify requirements, identify risks |
| **Facilitator** | SM (Scrum Master) |

---

## Attendees

| Role | Name | Present |
|------|------|---------|
| Product Manager | PM | ☑ |
| Scrum Master | SM | ☑ |
| Backend Engineer | BE | ☑ |
| Frontend Engineer | FE | ☑ |
| UX Designer | UX | ☑ |
| QA Engineer (Manual) | QA | ☑ |
| QA Engineer (Automation) | QAA | ☑ |
| Business Stakeholder | BIZ | ☑ |

---

## Stories for Refinement

### STORY-001: Enter repository and file path

| Estimator | Points | Notes |
|-----------|--------|-------|
| BE | 2 | Simple API route, path handling |
| FE | 2 | Basic form, two inputs, navigation |
| QA | - | Straightforward to test |
| QAA | 1 | Basic e2e test for form submission |

**Consensus:** 2 points

**Questions/Clarifications:**
- None - straightforward

**Definition of Ready:** ☑ Ready for Sprint

---

### STORY-002: View file with git blame annotations

| Estimator | Points | Notes |
|-----------|--------|-------|
| BE | 3 | git blame parsing, structured response |
| FE | 5 | Line rendering, syntax highlighting, visual grouping |
| QA | - | Need test cases for various file types |
| QAA | 2 | Multiple assertions per line |

**Consensus:** 5 points

**Questions/Clarifications:**
- UX: Need to finalize visual grouping design
- FE: Syntax highlighting library choice (suggest Prism or Shiki)

**Definition of Ready:** ☑ Ready for Sprint

---

### STORY-003: View commit details for a line

| Estimator | Points | Notes |
|-----------|--------|-------|
| BE | 2 | git show command, parse output |
| FE | 3 | Panel component, layout, close behavior |
| QA | - | Test panel interactions |
| QAA | 2 | Panel open/close/update tests |

**Consensus:** 3 points

**Questions/Clarifications:**
- UX: Slide-out drawer recommended over modal

**Definition of Ready:** ☑ Ready for Sprint

---

### STORY-004: View merge commit context

| Estimator | Points | Notes |
|-----------|--------|-------|
| BE | 5 | Complex git traversal, ancestry path, caching |
| FE | 3 | Extend panel for merge view, commit list |
| QA | - | Edge cases with merge histories |
| QAA | 3 | Need repos with various merge patterns |

**Consensus:** 5 points

**Questions/Clarifications:**
- BE: Caching strategy needed for performance
- QA: Need test fixtures with known merge histories

**Definition of Ready:** ☑ Ready for Sprint

---

### STORY-005: Handle direct commits to main

| Estimator | Points | Notes |
|-----------|--------|-------|
| BE | 1 | Logic branch, null merge handling |
| FE | 1 | Conditional UI, visual indicator |
| QA | - | Test both paths |
| QAA | 1 | Add direct commit test case |

**Consensus:** 2 points

**Questions/Clarifications:**
- None - well defined

**Definition of Ready:** ☑ Ready for Sprint

---

### STORY-006: Validate repository and file inputs

| Estimator | Points | Notes |
|-----------|--------|-------|
| BE | 3 | Multiple validation checks, error responses |
| FE | 2 | Error display, dismissal logic |
| QA | - | Comprehensive error case testing |
| QAA | 2 | Negative test cases |

**Consensus:** 3 points

**Questions/Clarifications:**
- PM: Error messages should be user-friendly, not technical

**Definition of Ready:** ☑ Ready for Sprint

---

### STORY-007: Display loading states

| Estimator | Points | Notes |
|-----------|--------|-------|
| BE | 0 | No backend work |
| FE | 3 | Multiple loading states, skeleton loaders |
| QA | - | Visual verification |
| QAA | 1 | Loading state assertions |

**Consensus:** 3 points

**Questions/Clarifications:**
- UX: Skeleton loaders preferred over spinners

**Definition of Ready:** ☑ Ready for Sprint

---

## Summary

### Sprint 1 (P1 Stories)

| Story | Points |
|-------|--------|
| STORY-001 | 2 |
| STORY-002 | 5 |
| STORY-003 | 3 |
| STORY-004 | 5 |
| STORY-005 | 2 |
| **Total** | **17** |

### Sprint 2 (P2 Stories)

| Story | Points |
|-------|--------|
| STORY-006 | 3 |
| STORY-007 | 3 |
| **Total** | **6** |

### Epic Total: 23 points

---

## Technical Risks Identified

| Risk | Story | Mitigation | Owner |
|------|-------|------------|-------|
| Git blame slow on large files | STORY-002 | Stream/paginate results | BE |
| Merge ancestry traversal expensive | STORY-004 | Cache merge lookups | BE |
| Syntax highlighting bundle size | STORY-002 | Use lightweight library | FE |

---

## UX Decisions

| Decision | Rationale | Story |
|----------|-----------|-------|
| Slide-out drawer over modal | Better context preservation | STORY-003 |
| Skeleton loaders over spinners | Perceived performance | STORY-007 |
| Visual grouping via background color | Familiar pattern from GitHub | STORY-002 |

---

## QA Test Planning

| Story | Key Test Areas |
|-------|----------------|
| STORY-001 | Form submission, navigation |
| STORY-002 | Various file types, large files, syntax highlighting |
| STORY-003 | Panel interactions, data accuracy |
| STORY-004 | Merge histories, commit lists |
| STORY-005 | Direct vs merged commits |
| STORY-006 | All error conditions |
| STORY-007 | Loading state visibility, timing |

---

## Automation Test Planning

| Story | Test Type | Priority |
|-------|-----------|----------|
| STORY-001 | e2e | High |
| STORY-002 | e2e + visual | High |
| STORY-003 | e2e | High |
| STORY-004 | e2e | High |
| STORY-005 | e2e | Medium |
| STORY-006 | e2e (negative) | Medium |
| STORY-007 | e2e | Low |

---

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Create test fixtures repo with merge histories | QAA | Before Sprint 1 | ☐ |
| Finalize visual grouping design | UX | Before Sprint 1 | ☐ |
| Select syntax highlighting library | FE | Sprint Planning | ☐ |
| Design skeleton loader components | UX | Sprint 2 | ☐ |

---

## Definition of Ready Checklist

All stories meet DoR:
- [x] User story clearly written (As a... I want... So that...)
- [x] Acceptance criteria defined (Given/When/Then)
- [x] Story estimated by team
- [x] Dependencies identified
- [x] Technical approach understood
- [x] UX requirements clear (or flagged for resolution)

---

*Meeting notes by: SM*
*All stories ready for Sprint Planning*
