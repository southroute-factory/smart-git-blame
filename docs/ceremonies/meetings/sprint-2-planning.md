# Sprint 2 Planning Meeting

## Meeting Details

| Field | Value |
|-------|-------|
| **Date** | 2026-02-12 |
| **Sprint** | Sprint 2 |
| **Duration** | 10 days (2 weeks) |
| **Sprint Goal** | Add robustness with input validation, loading UX, and enhanced line history tracking |
| **Facilitator** | SM (Scrum Master) |

---

## Attendees

| Role | Name | Present |
|------|------|---------|
| Product Manager | PM | ☐ (delegated to team) |
| Scrum Master | SM | ☑ |
| Backend Engineer | BE | ☑ |
| Frontend Engineer | FE | ☑ |
| UX Designer | UX | ☑ |
| QA Engineer (Manual) | QA | ☑ |
| QA Engineer (Automation) | QAA | ☑ |
| Business Stakeholder | BIZ | ☑ |

**Note:** Product Owner not attending. Team has authority to make scope decisions.

---

## Sprint Backlog

### Bug (P0 - First Priority)

| Bug ID | Title | Estimate | Owner | Priority |
|--------|-------|----------|-------|----------|
| BUG-001 | Playwright/Bun test runner fix | 1h | QAA | P0 |

### Committed Stories

| Story ID | Title | Points | Owner(s) |
|----------|-------|--------|----------|
| STORY-006 | Validate repository and file inputs | 3 | BE, FE |
| STORY-007 | Display loading states | 3 | FE |
| STORY-008 | Track line history across file renames | 5 | BE, FE |
| STORY-009 | Track line movement within file | 3 | BE, FE |

**Total Committed:** 14 points + 1 bug fix

---

## Capacity Planning

| Team Member | Availability | Notes |
|-------------|--------------|-------|
| BE | 100% | Full sprint |
| FE | 100% | Full sprint |
| UX | 25% | Design consultation only |
| QA | 100% | Manual testing from mid-sprint |
| QAA | 100% | Automation throughout |

**Previous Sprint Velocity:** 17 points (Sprint 1)
**Sprint 2 Commitment:** 14 points (conservative for new complexity)

---

## Task Breakdown

### BUG-001: Fix Playwright/Bun Test Runner Incompatibility (P0)

| Task ID | Task | Owner | Estimate | Priority |
|---------|------|-------|----------|----------|
| TASK-030 | Create bunfig.toml with e2e exclusion | QAA | 0.5h | P0 |
| TASK-031 | Update package.json with test:unit script | QAA | 0.25h | P0 |
| TASK-032 | Verify bun test and npm run test:e2e work | QAA | 0.25h | P0 |

**Subtotal:** 1h

---

### STORY-006: Validate Repository and File Inputs (3 pts)

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-033 | Implement directory existence check | BE | 1h | - |
| TASK-034 | Implement git repository validation | BE | 1h | TASK-033 |
| TASK-035 | Implement file existence check | BE | 1h | TASK-034 |
| TASK-036 | Implement git tracking check | BE | 1h | TASK-035 |
| TASK-037 | Create validation error response format | BE | 0.5h | TASK-036 |
| TASK-038 | Create error message component | FE | 1h | - |
| TASK-039 | Implement inline error display on form | FE | 1.5h | TASK-038 |
| TASK-040 | Add error dismissal on input change | FE | 0.5h | TASK-039 |
| TASK-041 | E2E tests for validation errors | QAA | 2h | TASK-040 |

**Subtotal:** 9.5h

---

### STORY-007: Display Loading States (3 pts)

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-042 | Create skeleton loader component | FE | 2h | - |
| TASK-043 | Add skeleton loader for blame view | FE | 1.5h | TASK-042 |
| TASK-044 | Add loading spinner for commit panel | FE | 1h | - |
| TASK-045 | Add loading spinner for merge details | FE | 0.5h | TASK-044 |
| TASK-046 | Disable form during submission | FE | 0.5h | - |
| TASK-047 | Prevent duplicate line click requests | FE | 1h | - |
| TASK-048 | E2E tests for loading states | QAA | 1.5h | TASK-047 |

**Subtotal:** 8h

---

### STORY-008: Track Line History Across File Renames (5 pts)

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-049 | Implement git log --follow parser | BE | 3h | - |
| TASK-050 | Create rename detection service | BE | 2h | TASK-049 |
| TASK-051 | Create rename history API endpoint | BE | 2h | TASK-050 |
| TASK-052 | Add rename caching layer | BE | 1.5h | TASK-051 |
| TASK-053 | Create rename event display in lineage | FE | 2h | TASK-051 |
| TASK-054 | Add old/new path indicators | FE | 1h | TASK-053 |
| TASK-055 | Create test fixtures for renames | QAA | 1h | - |
| TASK-056 | E2E tests for file rename tracking | QAA | 2h | TASK-054 |

**Subtotal:** 14.5h

---

### STORY-009: Track Line Movement Within File (3 pts)

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-057 | Implement git blame -M parsing | BE | 2h | - |
| TASK-058 | Extract line movement metadata | BE | 1.5h | TASK-057 |
| TASK-059 | Add movement info to blame API response | BE | 1h | TASK-058 |
| TASK-060 | Display "moved from line X" indicator | FE | 1.5h | TASK-059 |
| TASK-061 | Distinguish move from modification in UI | FE | 1h | TASK-060 |
| TASK-062 | Create test fixtures for line movement | QAA | 0.5h | - |
| TASK-063 | E2E tests for line movement detection | QAA | 1.5h | TASK-061 |

**Subtotal:** 9h

---

## Task Summary

| Owner | Task Count | Total Estimate |
|-------|------------|----------------|
| BE | 12 | 17h |
| FE | 13 | 14h |
| QAA | 9 | 11h |

**Total:** 34 tasks, 42h estimated

---

## Dependencies Map

```
BUG-001 (P0 - Do First!)
└── TASK-030 → TASK-031 → TASK-032

STORY-006 (Validation)
├── Backend: TASK-033 → TASK-034 → TASK-035 → TASK-036 → TASK-037
└── Frontend: TASK-038 → TASK-039 → TASK-040 → TASK-041

STORY-007 (Loading States)
├── Skeleton: TASK-042 → TASK-043
├── Spinners: TASK-044 → TASK-045
└── Guards: TASK-046, TASK-047 → TASK-048

STORY-008 (File Renames) - Depends on existing blame infrastructure
├── Backend: TASK-049 → TASK-050 → TASK-051 → TASK-052
├── Frontend: TASK-053 → TASK-054 (depends on TASK-051)
└── QAA: TASK-055, TASK-056 (depends on TASK-054)

STORY-009 (Line Movement) - Depends on existing blame infrastructure
├── Backend: TASK-057 → TASK-058 → TASK-059
├── Frontend: TASK-060 → TASK-061 (depends on TASK-059)
└── QAA: TASK-062, TASK-063 (depends on TASK-061)
```

### Critical Path

```
Day 1-2:   BUG-001 (P0) → Must complete before other QAA work
Day 1-4:   STORY-006 (BE) → STORY-006 (FE) → E2E tests
Day 1-4:   STORY-007 (FE parallel track) → E2E tests
Day 3-7:   STORY-008 (BE) → STORY-008 (FE) → E2E tests
Day 4-8:   STORY-009 (BE) → STORY-009 (FE) → E2E tests
Day 8-10:  Buffer for integration and edge cases
```

---

## Sprint Goal

> **Enhance user experience with robust input validation, clear loading states, and advanced git history tracking for file renames and line movement.**

### Goal Breakdown
1. **Robustness:** Users get clear feedback when inputs are invalid
2. **UX Polish:** Loading states provide confidence the app is working
3. **Advanced History:** Track code across renames and within-file moves

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Git log --follow slow on large repos | High | Medium | Cache aggressively, use --first-parent | BE |
| Skeleton loader design complexity | Low | Low | Start with simple gray bars | FE |
| Rename detection edge cases | Medium | Medium | Focus on happy path, note limitations | BE |
| Line movement false positives | Low | Medium | Use conservative similarity threshold | BE |

---

## Definition of Done (Sprint)

- [ ] All stories meet acceptance criteria
- [ ] Code reviewed and merged
- [ ] E2E tests passing (Playwright)
- [ ] Unit tests passing (Bun)
- [ ] No critical bugs
- [ ] Loading states visible in all async operations
- [ ] Validation errors user-friendly

---

## Decisions Made

| Decision | Rationale | Owner |
|----------|-----------|-------|
| BUG-001 is P0 | Blocks QAA from adding unit tests | SM |
| 14 points vs 17 | New complexity (git history parsing) warrants caution | Team |
| Skeleton over spinner for blame view | UX best practice - perceived performance | FE, UX |
| Cache rename results | Performance critical for large repos | BE |

---

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| Create all task files in sprint-2/backlog | SM | Today |
| Complete BUG-001 first | QAA | Day 1 |
| Begin TASK-033 (validation BE) | BE | Day 1 |
| Begin TASK-042 (skeleton loader) | FE | Day 1 |
| Design skeleton loader mockup | UX | Day 2 |

---

## Sprint Commitment Confirmation

**The team commits to:**
- [ ] Sprint Goal: Enhance UX with validation, loading, and history tracking
- [ ] Delivering 14 story points + 1 bug fix
- [ ] BUG-001 resolved by Day 1

**Confidence Level:** 4/5 (high confidence with conservative commitment)

---

## Next Steps

1. SM to create task files for all 34 tasks
2. QAA starts BUG-001 immediately
3. BE and FE begin parallel work on STORY-006 and STORY-007
4. Daily standups to track progress

---

*Meeting notes by: SM (Scrum Master)*
*Sprint 2 Start: 2026-02-12*
*Sprint 2 End: 2026-02-26*
