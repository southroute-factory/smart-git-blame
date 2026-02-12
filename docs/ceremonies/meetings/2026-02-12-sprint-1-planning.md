# Sprint 1 Planning Meeting

## Meeting Details

| Field | Value |
|-------|-------|
| **Date** | 2026-02-12 |
| **Sprint** | Sprint 1 |
| **Duration** | 2 weeks |
| **Sprint Goal** | Deliver core blame view with commit/merge drill-down |
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

## Sprint Backlog

### Committed Stories

| Story ID | Title | Points | Owner |
|----------|-------|--------|-------|
| STORY-001 | Enter repository and file path | 2 | BE, FE |
| STORY-002 | View file with git blame annotations | 5 | BE, FE |
| STORY-003 | View commit details for a line | 3 | BE, FE |
| STORY-004 | View merge commit context | 5 | BE, FE |
| STORY-005 | Handle direct commits to main | 2 | BE, FE |

**Total Committed:** 17 points

---

## Capacity Planning

| Team Member | Availability | Notes |
|-------------|--------------|-------|
| BE | 100% | Full sprint |
| FE | 100% | Full sprint |
| UX | 50% | Design support as needed |
| QA | 100% | Testing from mid-sprint |
| QAA | 100% | Test automation setup + tests |

---

## Task Breakdown

### STORY-001: Enter repository and file path (2 pts)

| Task ID | Task | Owner | Estimate |
|---------|------|-------|----------|
| TASK-001 | Create API route for blame endpoint | BE | 2h |
| TASK-002 | Create RepoInput form component | FE | 2h |
| TASK-003 | Implement form submission and navigation | FE | 1h |
| TASK-004 | E2E test for form submission | QAA | 1h |

### STORY-002: View file with git blame annotations (5 pts)

| Task ID | Task | Owner | Estimate |
|---------|------|-------|----------|
| TASK-005 | Implement git blame parser | BE | 4h |
| TASK-006 | Create blame API endpoint | BE | 2h |
| TASK-007 | Set up syntax highlighting (Shiki) | FE | 3h |
| TASK-008 | Create BlameView component | FE | 4h |
| TASK-009 | Implement visual grouping for consecutive lines | FE | 2h |
| TASK-010 | Add line click handlers | FE | 1h |
| TASK-011 | E2E tests for blame view | QAA | 2h |

### STORY-003: View commit details for a line (3 pts)

| Task ID | Task | Owner | Estimate |
|---------|------|-------|----------|
| TASK-012 | Create commit details API endpoint | BE | 2h |
| TASK-013 | Parse git show output | BE | 2h |
| TASK-014 | Create ChangePanel slide-out component | FE | 3h |
| TASK-015 | Display commit metadata in panel | FE | 2h |
| TASK-016 | Implement panel open/close/update logic | FE | 2h |
| TASK-017 | E2E tests for commit panel | QAA | 2h |

### STORY-004: View merge commit context (5 pts)

| Task ID | Task | Owner | Estimate |
|---------|------|-------|----------|
| TASK-018 | Implement merge commit ancestry lookup | BE | 4h |
| TASK-019 | Create merge details API endpoint | BE | 2h |
| TASK-020 | Implement merge lookup caching | BE | 2h |
| TASK-021 | Extend ChangePanel for merge view | FE | 3h |
| TASK-022 | Display commit list in merge view | FE | 2h |
| TASK-023 | Create test fixtures repo | QAA | 2h |
| TASK-024 | E2E tests for merge context | QAA | 2h |

### STORY-005: Handle direct commits to main (2 pts)

| Task ID | Task | Owner | Estimate |
|---------|------|-------|----------|
| TASK-025 | Add direct commit detection logic | BE | 1h |
| TASK-026 | Return null merge for direct commits | BE | 1h |
| TASK-027 | Conditional UI for direct commits | FE | 1h |
| TASK-028 | Add direct commit badge/indicator | FE | 1h |
| TASK-029 | E2E tests for direct commits | QAA | 1h |

---

## Task Summary

| Owner | Task Count | Total Estimate |
|-------|------------|----------------|
| BE | 11 | 22h |
| FE | 13 | 24h |
| QAA | 6 | 10h |

---

## Dependencies

```
TASK-001 ─┬─► TASK-005 ─► TASK-006 ─┬─► TASK-007 ─► TASK-008
          │                         │
          └─► TASK-002 ─► TASK-003 ─┘
                                    │
                                    ▼
                              TASK-012 ─► TASK-013 ─► TASK-014 ─► TASK-015
                                    │
                                    ▼
                              TASK-018 ─► TASK-019 ─► TASK-021
                                    │
                                    ▼
                              TASK-025 ─► TASK-027
```

---

## Sprint Goal

> **Deliver a working blame viewer where a developer can enter a repo/file path, see blame annotations, and drill down to commit and merge context.**

---

## Risks & Mitigations

| Risk | Mitigation | Owner |
|------|------------|-------|
| Git blame slow on large files | Defer optimization to Sprint 2 if needed | BE |
| Syntax highlighting library issues | Shiki selected; fallback to Prism | FE |
| Merge ancestry complex edge cases | Focus on happy path; edge cases Sprint 2 | BE |

---

## Definition of Done (Sprint)

- [ ] All stories meet acceptance criteria
- [ ] Code reviewed and merged
- [ ] E2E tests passing
- [ ] No critical bugs
- [ ] Demo-able to stakeholders

---

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| Create all task files in sprint backlog | SM | Today |
| Begin TASK-001, TASK-002 | BE, FE | Day 1 |
| Set up test fixtures repo | QAA | Day 2 |

---

*Meeting notes by: SM*
