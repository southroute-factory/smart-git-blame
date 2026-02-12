# Sprint 3 Retrospective

## Meeting Details

| Field | Value |
|-------|-------|
| **Date** | 2026-02-26 |
| **Time** | 16:00 - 17:00 |
| **Sprint Number** | Sprint 3 |
| **Facilitator** | SM (Scrum Master) |
| **Format Used** | Start-Stop-Continue |

---

## ⚠️ Critical Issue: Post-Review Discovery

Before celebrating Sprint 3 metrics, we must address a **CRITICAL** issue discovered post-review:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    🚨 BUG-006: CRITICAL ESCAPE 🚨                    │
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
└─────────────────────────────────────────────────────────────────────┘
```

**This retrospective will focus heavily on how this escaped our process.**

---

## Sprint Metrics (With Caveat)

| Metric | Reported | Actual | Notes |
|--------|----------|--------|-------|
| Stories Completed | 3/3 (100%) | **2.5/3 (83%)** | STORY-012 not truly complete |
| Tasks Completed | 42/42 (100%) | **41/42 (98%)** | API route task missing |
| Story Points | 15/15 | **~12/15** | STORY-012 (5 pts) broken |
| Bugs Fixed | 4/4 | 4/4 | All bug fixes verified |

⚠️ **Our "third consecutive 100% sprint" is not accurate. We need to recalibrate.**

---

## Attendees

| Name | Role | Present |
|------|------|---------|
| SM | Scrum Master (Facilitator) | ☑ |
| PM | Product Manager | ☑ |
| BE | Backend Engineer | ☑ |
| FE | Frontend Engineer | ☑ |
| UX | UX Designer | ☑ |
| QA | QA Engineer (Manual) | ☑ |
| QAA | QA Engineer (Automation) | ☑ |
| BIZ | Business Stakeholder | ☑ |

---

## Sprint Pulse Check

### Team Mood (Post BUG-006 Discovery)
| Mood | Count | Notes |
|------|-------|-------|
| 😊 Happy | 2 | Bug fixes and STORY-010/011 worked well |
| 😐 Neutral | 4 | Concerned about process gap |
| 😔 Frustrated | 2 | Disappointed feature shipped broken |
| 😫 Exhausted | 0 | — |

### Sprint Satisfaction Score: **3.2/5** ⭐ (Down from 4.8 post-review)

| Area | Rating (1-5) |
|------|--------------|
| Sprint Goal Achievement | 3 (was 5) |
| Team Collaboration | 4 |
| Code Quality | 3 (process gap exposed) |
| Work-Life Balance | 5 |
| Communication | 3 (integration missed) |
| Process Effectiveness | 2 (major gap) |

---

## 🔴 ROOT CAUSE ANALYSIS: BUG-006

### What Happened?

**STORY-012: Generate LLM Summary of Line History**

The story involved two main technical components:

1. **`llm.ts`** - Anthropic client library (designed for client-side calls)
2. **`LLMSummary.tsx`** - React component (calls `/api/llm/explain`)

**The Architecture Mismatch:**

```
DESIGNED:                          IMPLEMENTED:
┌────────────────┐                 ┌────────────────┐
│ LLMSummary.tsx │                 │ LLMSummary.tsx │
│                │                 │                │
│ Uses llm.ts    │                 │ Calls /api/llm │
│ client-side    │                 │ (server route) │
└────────┬───────┘                 └────────┬───────┘
         │                                  │
         ▼                                  ▼
┌────────────────┐                 ┌────────────────┐
│    llm.ts      │                 │     ???        │
│ (direct API)   │                 │  ROUTE MISSING │
└────────────────┘                 └────────────────┘
```

**The component was implemented to call a server route that was never created.**

### Five Whys Analysis

| Why | Finding |
|-----|---------|
| **Why 1:** Why did BUG-006 escape? | STORY-012 was marked complete without E2E verification of the full user flow |
| **Why 2:** Why wasn't E2E verification done? | TASK-104 (E2E tests) mocked the API at `api.anthropic.com`, not at `/api/llm/explain` |
| **Why 3:** Why did tests mock the wrong endpoint? | Test design assumed client-side Anthropic calls (matching `llm.ts` design), but component changed to server route |
| **Why 4:** Why didn't we catch the architecture change? | No design review when FE pivoted from client-side to server-side API call |
| **Why 5:** Why didn't demo catch it? | Demo was not performed with a live API key; only UI states were shown |

### Contributing Factors

| Factor | Description | Owner |
|--------|-------------|-------|
| **Missing integration test** | No test verified `/api/llm/explain` actually existed | QAA |
| **Architecture divergence** | `llm.ts` and `LLMSummary.tsx` had different assumptions | BE, FE |
| **Demo without real API call** | Sprint review showed UI, not end-to-end flow | FE, QA |
| **DoD gap** | "E2E tests passing" doesn't require real integration | SM, Team |
| **No smoke test checklist** | No final verification before marking story complete | QA |

---

## Retrospective: Start-Stop-Continue

### 🔴 STOP — What Let This Slip Through

| Item | Votes | Root Cause | Action Required |
|------|-------|------------|-----------------|
| **Marking stories "done" without E2E smoke test** | 8 | TASK-104 mocked wrong endpoint | Add real E2E verification to DoD |
| **Mocking APIs that don't exist** | 7 | Test assumed API structure | Tests must hit real endpoints (or verified mocks) |
| **Architecture changes without communication** | 6 | FE pivoted to server route, BE unaware | Require design review for architecture changes |
| **Demo without exercising full feature** | 5 | Only UI shown, not actual API call | Require live demo with real data |
| **Assuming "tests pass" means "feature works"** | 6 | False confidence from green tests | Add integration verification checkpoint |

---

### 🟡 START — What We Should Add

| Item | Votes | How It Prevents BUG-006 | Owner |
|------|-------|-------------------------|-------|
| **"Happy path E2E" verification before marking done** | 8 | Would have caught missing API route | QA, Story Owner |
| **Integration checklist for multi-component stories** | 7 | Forces verification of all touchpoints | PM, QA |
| **Architecture review for any API changes** | 6 | Would have aligned llm.ts and LLMSummary.tsx | BE, FE |
| **Demo must include live functionality** | 7 | Sprint review would have failed on 404 | SM, FE |
| **Pre-review smoke test by QA** | 8 | Independent verification before marking complete | QA |

---

### 🟢 CONTINUE — What's Still Working Well

| Item | Votes | Notes |
|------|-------|-------|
| **Bug fix process was solid** | 7 | All 4 HIGH bugs genuinely resolved |
| **STORY-010 (cross-file tracking) delivered perfectly** | 7 | Complex feature, well-integrated |
| **STORY-011 (API key config) works end-to-end** | 6 | Settings page, localStorage, validation all good |
| **Unit test coverage** | 6 | Components individually tested well |
| **Clear acceptance criteria** | 5 | Stories well-defined (issue was execution) |
| **Daily standups** | 6 | Communication generally good |

---

## Previous Retrospective Action Items Review

| Action Item | Owner | Status | Outcome |
|-------------|-------|--------|---------|
| Mid-sprint design review checkpoint | UX, SM | ☑ Done | Helped with UI consistency |
| Performance baseline metrics | QAA, BE | ☑ Done | Baselines established |
| Story refinement sessions | PM, SM | ☑ Done | Sprint 3 stories were clear |

**Note:** Previous action items were completed but didn't address integration testing gap.

---

## Key Discussion Points

### Discussion 1: Why Did TASK-104 Mock the Wrong Endpoint?

**Context:** TASK-104 defined E2E tests that mocked `api.anthropic.com` for LLM responses.

**Discussion:**
- **QAA:** "The test strategy was based on the architecture in STORY-012 which said 'API call made from browser directly to Anthropic'. I mocked what the spec said."
- **FE:** "I switched to a server route late in development for security reasons—didn't want API keys exposed in browser network tab. I should have communicated this change."
- **BE:** "I built `llm.ts` for client-side use. If I'd known we needed a server route, I would have built that instead."
- **PM:** "The story accepted 'browser-side calls' but we didn't update it when the approach changed."

**Root Cause:** Architecture change was not communicated, spec not updated, tests followed outdated spec.

**Resolution:** 
- Architecture changes must trigger spec update + test review
- Tests must verify actual integration points, not assumptions

---

### Discussion 2: Should We Require Demo Before Marking Complete?

**Context:** Sprint review showed LLMSummary UI but didn't actually click "Explain History" with a real API call.

**Discussion:**
- **QA:** "I would have caught this if I'd done a smoke test. We assumed passing tests meant it worked."
- **SM:** "Demo should be mandatory for stories with user-facing features. No exceptions."
- **BIZ:** "From stakeholder perspective, we were shown something that doesn't work. This hurts credibility."
- **FE:** "Agreed. I should have done a real demo, not just show the UI states."

**Resolution:**
- All user-facing stories require live demo before marking complete
- Demo must exercise the primary user flow, not just show UI

---

### Discussion 3: How Do We Strengthen Definition of Done?

**Current DoD Gaps:**
- "E2E tests passing" — but tests can mock non-existent APIs
- No requirement for integration verification
- No pre-completion smoke test

**Proposed DoD Additions:**
1. **Integration verification**: All APIs called by components must exist and respond
2. **Smoke test**: QA performs manual happy-path verification
3. **Demo readiness**: Feature can be demonstrated with real data

---

## Action Items for Sprint 4

| Priority | Action Item | Owner | Success Criteria | Target |
|----------|-------------|-------|------------------|--------|
| **P0** | Fix BUG-006: Create `/api/llm/explain` route | BE | Explain History button works E2E | Sprint 4, Day 1 |
| **1** | Add "Integration Verification" to DoD | SM, Team | Checklist requires API existence check | Sprint 4 Planning |
| **2** | Implement pre-completion smoke test | QA | QA signs off on happy path before "done" | Sprint 4 |
| **3** | Require live demo for user-facing stories | SM | No story marked complete without demo | Sprint 4 |
| **4** | Add architecture change communication rule | SM | Any API change triggers design review | Sprint 4 |

---

## Updated Definition of Done (Sprint 4)

Based on this retrospective, the team agrees to update the Definition of Done:

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

## Team Agreements Update

| Agreement | Change | Rationale |
|-----------|--------|-----------|
| **NEW: Architecture Review** | Any change to API contracts triggers BE/FE sync | Prevent divergence like llm.ts vs LLMSummary |
| **NEW: QA Smoke Test** | QA must verify happy path before "done" | Independent verification prevents escapes |
| **NEW: Demo Requirement** | User-facing features require live demo | Sprint review must show working features |
| **UPDATE: E2E Tests** | Tests must hit actual endpoints (or verified mocks) | Mocking non-existent APIs is invalid |

---

## Shoutouts & Appreciations 🌟

*Despite the process gap, the team did excellent work on many fronts:*

| Who | What | From |
|-----|------|------|
| **BE** | Cross-file tracking (STORY-010) was complex and executed perfectly | FE |
| **QAA** | BUG-002 fix unblocked the sprint quickly | Team |
| **FE** | Settings page (STORY-011) works flawlessly | QA |
| **QA** | BUG-003/004/005 investigation was thorough | PM |
| **PM** | Immediate escalation of BUG-006 shows strong ownership | BIZ |
| **Team** | Honest, blame-free discussion of process failure | SM |

---

## Retrospective Effectiveness

**How effective was this retrospective?** 4.5/5 ⭐

**Feedback:**
- Difficult but necessary conversation
- Root cause analysis was thorough
- Action items are concrete and actionable
- Team took collective ownership, no finger-pointing

---

## Facilitator Notes

- Team showed maturity in addressing failure openly
- No blame assigned; focus on process improvement
- BUG-006 fix is P0 for Sprint 4 (first task)
- Monitor adherence to new DoD items
- Consider more frequent integration checkpoints for complex stories
- This retrospective should be referenced in Sprint 4 planning

---

## Summary

Sprint 3 had significant accomplishments (4 bug fixes, STORY-010, STORY-011) but also a **critical process failure** with STORY-012. The "Explain History" feature shipped non-functional because:

1. Architecture changed without communication (client-side → server-side)
2. Tests mocked a non-existent API endpoint
3. No integration verification or smoke test before marking complete
4. Demo didn't exercise the actual feature

**Four concrete action items for Sprint 4:**

1. **P0: Fix BUG-006** — Create the missing API route
2. **Add Integration Verification to DoD** — APIs must exist
3. **Implement pre-completion smoke test** — QA verification required
4. **Require live demo** — No marking complete without working demo

This experience, while painful, strengthens our process. The team has committed to these improvements to prevent similar escapes in the future.

---

*Meeting ended at: 17:00*  
*Duration: 60 minutes*  
*Next Retrospective: End of Sprint 4*
