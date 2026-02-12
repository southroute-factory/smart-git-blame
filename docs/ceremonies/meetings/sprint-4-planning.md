# Sprint 4 Planning Meeting

## Meeting Details

| Field | Value |
|-------|-------|
| **Date** | 2026-02-27 |
| **Sprint** | Sprint 4 |
| **Duration** | 10 days (2 weeks) |
| **Sprint Goal** | Restore STORY-012 functionality and implement file browser navigation |
| **Facilitator** | SM (Scrum Master) |

---

## ⚠️ Critical Context from Sprint 3 Retrospective

Before planning, the team acknowledges the **CRITICAL PROCESS FAILURE** discovered post-Sprint 3:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    🚨 BUG-006: P0 PRIORITY 🚨                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   STORY-012 (LLM Summary) is COMPLETELY NON-FUNCTIONAL             │
│                                                                     │
│   Issue: LLMSummary.tsx calls /api/llm/explain                     │
│          This API route was NEVER CREATED                           │
│                                                                     │
│   Result: "Explain History" button returns 404 error               │
│           Feature marked "complete" but doesn't work               │
│                                                                     │
│   Root Cause: Architecture mismatch between llm.ts (client-side)   │
│               and LLMSummary.tsx (expects server route)            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Sprint 4 begins with BUG-006 as the FIRST priority - no other work until this is verified fixed.**

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

## Sprint Goal

> **Restore LLM functionality by fixing BUG-006 (P0), then enable intuitive file navigation with a visual file browser.**

### Goal Breakdown
1. **P0 Fix First:** Create missing /api/llm/explain route, verify E2E with real API call
2. **Process Verification:** Apply new DoD requirements (integration verification, QA smoke test, live demo)
3. **Feature Delivery:** Implement file browser navigation (STORY-013) if time permits after bug fix

---

## Updated Definition of Done (v2.0)

Based on Sprint 3 Retrospective learnings, the team adopts an **enhanced Definition of Done**:

### Definition of Done v2.0

**Code Quality:**
- [ ] Code reviewed and merged
- [ ] Unit tests passing (Bun)
- [ ] E2E tests passing (Playwright)
- [ ] No lint errors
- [ ] No TypeScript errors

**Integration Verification (NEW):**
- [ ] All API endpoints called by UI components exist and respond
- [ ] Integration between frontend and backend verified manually
- [ ] No 404/500 errors in happy path flow

**Verification (NEW):**
- [ ] QA smoke test completed (manual happy-path verification)
- [ ] Feature can be demonstrated live with real data
- [ ] Primary user flow exercised end-to-end

**Documentation:**
- [ ] Acceptance criteria met
- [ ] Architecture changes documented and communicated

---

## Sprint Backlog

### P0 Bug Fix (MUST FIX FIRST)

| Bug ID | Title | Estimate | Owner | Priority |
|--------|-------|----------|-------|----------|
| BUG-006 | Create missing /api/llm/explain route | 2h | BE | **P0** |

**BUG-006 must be verified COMPLETE (with live demo) before starting any story work.**

### Committed Stories

| Story ID | Title | Points | Owner(s) | Notes |
|----------|-------|--------|----------|-------|
| STORY-013 | File browser navigation | 8 | BE, FE | Contingent on BUG-006 completion |

**Total Committed:** 8 points + 1 P0 bug fix

---

## Capacity Planning

| Team Member | Availability | Notes |
|-------------|--------------|-------|
| BE | 100% | BUG-006 first, then STORY-013 backend |
| FE | 100% | STORY-013 frontend after BUG-006 verified |
| UX | 25% | File browser design consultation |
| QA | 100% | BUG-006 smoke test, STORY-013 manual testing |
| QAA | 100% | Integration tests for both |

**Previous Sprint Velocity:** 15 points (Sprint 3 - but with STORY-012 defect)
**Sprint 4 Commitment:** 8 points + 1 P0 bug (conservative due to new process overhead)

---

## Task Breakdown

### BUG-006: Create Missing /api/llm/explain Route (P0)

| Task ID | Task | Owner | Estimate | Priority |
|---------|------|-------|----------|----------|
| TASK-105 | Create /src/app/api/llm/explain/route.ts | BE | 1h | P0 |
| TASK-106 | Implement POST handler with request body parsing | BE | 0.5h | P0 |
| TASK-107 | Add Anthropic API streaming call | BE | 0.5h | P0 |
| TASK-108 | Add integration test hitting real endpoint | QAA | 1h | P0 |
| TASK-109 | QA smoke test - verify "Explain History" works E2E | QA | 0.5h | P0 |
| TASK-110 | Live demo to stakeholders | FE | 0.5h | P0 |

**Subtotal:** 4h (includes verification overhead)

**Acceptance Criteria for BUG-006:**
- [ ] /api/llm/explain route exists and accepts POST
- [ ] Returns streaming response from Anthropic
- [ ] Handles all error cases (missing key, API errors)
- [ ] Integration test passes (not mocked)
- [ ] QA verified happy path manually
- [ ] Live demo shows working feature

---

### STORY-013: File Browser Navigation (8 pts)

**Prerequisites:**
- BUG-006 must be verified COMPLETE before starting
- Security review sign-off required before deployment

#### Backend Tasks

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-111 | Create /api/files/route.ts endpoint | BE | 1.5h | - |
| TASK-112 | Implement directory listing with fs.readdir | BE | 1h | TASK-111 |
| TASK-113 | Add path traversal security validation | BE | 2h | TASK-112 |
| TASK-114 | Block symlinks resolving outside repo root | BE | 1h | TASK-113 |
| TASK-115 | Implement lazy loading response format | BE | 0.5h | TASK-112 |
| TASK-116 | Add git repository detection | BE | 0.5h | TASK-115 |
| TASK-117 | Unit tests for filesystem service | QAA | 1h | TASK-114 |

**Backend Subtotal:** 7.5h

#### Frontend Tasks

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-118 | Create FileBrowserModal.tsx component | FE | 1.5h | - |
| TASK-119 | Create FileTree.tsx recursive component | FE | 2h | TASK-118 |
| TASK-120 | Create FileTreeNode.tsx for folder/file items | FE | 1h | TASK-119 |
| TASK-121 | Implement folder expand/collapse logic | FE | 1h | TASK-119 |
| TASK-122 | Add PathBreadcrumb.tsx navigation | FE | 1h | TASK-118 |
| TASK-123 | Implement file/folder selection callbacks | FE | 0.5h | TASK-120 |
| TASK-124 | Add loading indicator for lazy loading | FE | 0.5h | TASK-121 |
| TASK-125 | Display "Not a git repo" warning | FE | 0.5h | TASK-116 |
| TASK-126 | Implement keyboard navigation (arrows, enter, esc) | FE | 2h | TASK-120 |
| TASK-127 | Add "Browse" buttons to RepoInput component | FE | 1h | TASK-118 |
| TASK-128 | Style file browser with Tailwind | FE | 1h | TASK-119 |

**Frontend Subtotal:** 12h

#### QA/Testing Tasks

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-129 | Create test repo with nested structure | QAA | 0.5h | - |
| TASK-130 | E2E tests - repository folder selection | QAA | 1h | TASK-127 |
| TASK-131 | E2E tests - file tree navigation | QAA | 1.5h | TASK-126 |
| TASK-132 | E2E tests - keyboard accessibility | QAA | 1h | TASK-126 |
| TASK-133 | Security tests - path traversal prevention | QAA | 1.5h | TASK-113 |
| TASK-134 | Security tests - symlink blocking | QAA | 1h | TASK-114 |
| TASK-135 | Manual testing - large repo performance | QA | 1h | TASK-127 |
| TASK-136 | Manual testing - cross-browser validation | QA | 1h | TASK-128 |
| TASK-137 | Accessibility audit (WCAG compliance) | QA | 1h | TASK-126 |
| TASK-138 | QA smoke test - full happy path verification | QA | 0.5h | All |
| TASK-139 | Live demo preparation and execution | FE | 0.5h | All |

**QA/Testing Subtotal:** 10.5h

**STORY-013 Total:** 30h (~3-4 days with parallel work)

---

## Task Summary

| Owner | Task Count | Total Estimate |
|-------|------------|----------------|
| BE | 8 | 8h |
| FE | 13 | 15.5h |
| QA | 5 | 4.5h |
| QAA | 8 | 8h |

**Total:** 34 tasks, ~36h estimated

---

## Dependencies Map

```
BUG-006 (P0 - Must Complete First)
├── TASK-105 → TASK-106 → TASK-107 (BE creates route)
├── TASK-108 (QAA integration test)
├── TASK-109 (QA smoke test)
└── TASK-110 (FE live demo)

STORY-013 (Starts ONLY after BUG-006 verified)
├── Backend: TASK-111 → TASK-112 → TASK-113 → TASK-114
│           TASK-112 → TASK-115 → TASK-116
│           TASK-117 (tests, depends on TASK-114)
├── Frontend: TASK-118 → TASK-119 → TASK-120 → TASK-121
│            TASK-118 → TASK-122
│            TASK-120 → TASK-123, TASK-126
│            TASK-116 → TASK-125
│            TASK-118 → TASK-127
│            TASK-119 → TASK-128
├── QA/Tests: TASK-129 (parallel)
│            TASK-113 → TASK-133
│            TASK-114 → TASK-134
│            TASK-126 → TASK-131, TASK-132
│            TASK-127 → TASK-130
│            All → TASK-138 (smoke test)
│            All → TASK-139 (live demo)
```

---

## Sprint Execution Plan

### Day 1: BUG-006 Resolution (All Hands)

```
Morning:
├── BE: Create /api/llm/explain route (TASK-105, 106, 107)
└── QAA: Prepare integration test (TASK-108)

Afternoon:
├── QAA: Run integration test, verify endpoint works
├── QA: Smoke test "Explain History" with real API key (TASK-109)
├── FE: Live demo to team (TASK-110)
└── SM: Verify DoD v2.0 checklist complete for BUG-006

End of Day 1 Gate:
✅ BUG-006 MUST be verified complete before Day 2 story work
```

### Day 2-4: STORY-013 Backend + Frontend Start

```
BE Track:
├── Day 2: TASK-111, 112, 113 (API endpoint + security)
├── Day 3: TASK-114, 115, 116 (symlinks, lazy load, git detection)
└── Day 4: Buffer + support FE integration

FE Track:
├── Day 2: TASK-118, 119 (Modal, FileTree)
├── Day 3: TASK-120, 121, 122 (Node, expand/collapse, breadcrumb)
└── Day 4: TASK-123, 124, 125 (selection, loading, warnings)

QAA Track:
├── Day 2: TASK-129 (test fixtures)
├── Day 3: TASK-117 (unit tests for backend)
└── Day 4: TASK-133, 134 (security tests)
```

### Day 5-7: STORY-013 Frontend Complete + E2E Tests

```
FE Track:
├── Day 5: TASK-126 (keyboard navigation - critical)
├── Day 6: TASK-127, 128 (Browse buttons, styling)
└── Day 7: TASK-139 (demo prep)

QAA Track:
├── Day 5: TASK-130 (E2E repo selection)
├── Day 6: TASK-131 (E2E file tree)
└── Day 7: TASK-132 (E2E keyboard)

QA Track:
├── Day 5: TASK-135 (large repo perf)
├── Day 6: TASK-136 (cross-browser)
└── Day 7: TASK-137 (accessibility audit)
```

### Day 8-10: Integration, Polish, Verification

```
All Tracks:
├── Day 8: Integration testing, edge cases
├── Day 9: Bug fixes, polish, TASK-138 (QA smoke test)
└── Day 10: TASK-139 (live demo), buffer, retrospective prep
```

---

## Process Improvements Applied

From Sprint 3 Retrospective, the following improvements are **MANDATORY** this sprint:

### 1. Integration Verification (Before "Done")
| Check | How | Owner |
|-------|-----|-------|
| All APIs exist | Manual curl/fetch test | Developer |
| No 404/500 in happy path | Browser console check | QA |
| Frontend ↔ Backend connected | E2E test hits real endpoints | QAA |

### 2. QA Smoke Test Requirement
| Step | Description | When |
|------|-------------|------|
| Happy path walkthrough | QA manually executes primary user flow | Before marking complete |
| Real data verification | No mocked APIs for final verification | After integration test |
| Sign-off | QA approves functionality | Required for "Done" |

### 3. Live Demo Requirement
| Requirement | Description |
|-------------|-------------|
| User-facing features | Must be demonstrated live |
| Real API calls | Demo uses actual backend/integrations |
| Stakeholder visibility | Demo viewable by PM/BIZ |

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| BUG-006 takes longer than 2h | High | Low | Day 1 dedicated to bug; deprioritize STORY-013 if needed | SM |
| Path traversal security review delays | High | Medium | Start security tasks early; have BE review before QAA tests | BE |
| Keyboard navigation complexity | Medium | Medium | FE can start parallel; reference Headless UI patterns | FE |
| Large repo performance issues | Medium | Medium | Implement lazy loading first; test early on real repos | BE, QA |
| Process overhead slows delivery | Medium | Medium | 8 points vs 15 accounts for new verification steps | SM |

---

## Definition of Done (Sprint Level)

- [ ] **BUG-006 resolved and verified** (P0 gate for story work)
- [ ] All stories meet acceptance criteria
- [ ] All items pass DoD v2.0 checklist (integration + smoke test + demo)
- [ ] Code reviewed and merged
- [ ] E2E tests passing (Playwright)
- [ ] Unit tests passing (Bun)
- [ ] Security review completed (STORY-013)
- [ ] No path traversal vulnerabilities
- [ ] Accessibility audit passed (STORY-013)

---

## Decisions Made

| Decision | Rationale | Owner |
|----------|-----------|-------|
| BUG-006 is Day 1 blocker | Cannot claim LLM feature works until proven | SM |
| 8 points commitment (vs 15) | New DoD adds verification overhead; conservative planning | Team |
| Security-first for file browser | Path traversal is critical risk | BE, SM |
| No stretch goals this sprint | Focus on quality over quantity after Sprint 3 escape | PM |
| QA smoke test mandatory | Prevents repeat of BUG-006 pattern | QA, SM |

---

## Team Agreements

| Agreement | Description | Owner |
|-----------|-------------|-------|
| BUG-006 Day 1 Priority | No story work until bug verified complete | All |
| DoD v2.0 Enforcement | All new DoD items are mandatory, not optional | SM |
| Architecture Communication | Any API contract changes require immediate sync | BE, FE |
| Demo Before Done | User-facing features require working demo | FE, QA |
| Integration Tests Required | E2E tests must hit real endpoints (not mocked APIs) | QAA |

---

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| Create BUG-006 task files in sprint-4/backlog | SM | Today |
| Create STORY-013 task files in sprint-4/backlog | SM | Today |
| Start BUG-006 fix | BE | Day 1 AM |
| Prepare integration test for /api/llm/explain | QAA | Day 1 AM |
| QA smoke test BUG-006 fix | QA | Day 1 PM |
| Security review planning for STORY-013 | BE | Day 1 |
| UX consultation on file browser design | UX | Day 2 |

---

## Sprint Commitment Confirmation

**The team commits to:**
- [x] Sprint Goal: Restore LLM functionality and implement file browser navigation
- [x] Resolving BUG-006 (P0) on Day 1 with full verification
- [x] Delivering STORY-013 (8 points) with security review
- [x] Applying DoD v2.0 to all completed items
- [x] No item marked "Done" without QA smoke test and live demo

**Confidence Level:** 4/5 (accounting for new process requirements)

---

## Sprint 4 Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SPRINT 4 PLANNING SUMMARY                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Sprint Goal: Restore LLM functionality, add file browser         │
│                                                                     │
│   P0 BUG-006: /api/llm/explain route (Day 1 priority)              │
│   ├── Create route endpoint                                        │
│   ├── Integration test (real endpoint)                             │
│   ├── QA smoke test (verify E2E)                                   │
│   └── Live demo (prove it works)                                   │
│                                                                     │
│   STORY-013: File Browser Navigation (8 pts)                       │
│   ├── Backend: /api/files endpoint + security                      │
│   ├── Frontend: Modal, tree view, keyboard nav                     │
│   └── QA: Security tests, accessibility audit                      │
│                                                                     │
│   Process Improvements (from Retrospective):                       │
│   ✅ Integration verification before "done"                        │
│   ✅ QA smoke test required                                        │
│   ✅ Live demo for user-facing features                            │
│   ✅ DoD v2.0 enforced                                             │
│                                                                     │
│   Commitment: 8 points + 1 P0 bug                                  │
│   Tasks: 34 total                                                  │
│   Confidence: 4/5                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Meeting notes by: SM (Scrum Master)*
*Sprint 4 Start: 2026-02-27*
*Sprint 4 End: 2026-03-13*
