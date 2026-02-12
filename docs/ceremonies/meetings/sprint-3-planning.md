# Sprint 3 Planning Meeting

## Meeting Details

| Field | Value |
|-------|-------|
| **Date** | 2026-02-12 |
| **Sprint** | Sprint 3 |
| **Duration** | 10 days (2 weeks) |
| **Sprint Goal** | Achieve production stability through bug fixes and enable LLM-powered code explanations |
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

## Sprint Goal

> **Achieve production stability by resolving all HIGH priority bugs, then enable AI-powered code explanations with Anthropic API integration and cross-file method tracking.**

### Goal Breakdown
1. **Stability First:** Fix all 4 HIGH priority bugs (BUG-002, BUG-003, BUG-004, BUG-005)
2. **LLM Foundation:** Enable users to configure API keys securely
3. **Advanced History:** Track method/function moves between files (most complex feature)
4. **AI Insights:** Generate LLM summaries of code history

---

## Sprint Backlog

### Bugs (P0/HIGH - First Priority)

| Bug ID | Title | Estimate | Owner | Priority |
|--------|-------|----------|-------|----------|
| BUG-002 | Bun test exclusion and unit test failures | 2h | QAA | HIGH |
| BUG-003 | Some text missing in UI | QA: 1h, FE: 2h | QA → FE | HIGH |
| BUG-004 | Poor handling of uncommitted changes | QA: 1h, BE: 3h | QA → BE | HIGH |
| BUG-005 | Submit button disabled unexpectedly | QA: 1h, FE: 2h | QA → FE | HIGH |

### Committed Stories

| Story ID | Title | Points | Owner(s) |
|----------|-------|--------|----------|
| STORY-010 | Track method/function moves between files | 8 | BE, FE |
| STORY-011 | Configure Anthropic API key | 2 | FE |
| STORY-012 | Generate LLM summary of line history | 5 | BE, FE |

**Total Committed:** 15 points + 4 bug fixes

---

## Capacity Planning

| Team Member | Availability | Notes |
|-------------|--------------|-------|
| BE | 100% | Full sprint |
| FE | 100% | Full sprint |
| UX | 25% | Design consultation only |
| QA | 100% | Bug confirmation Days 1-2, then testing |
| QAA | 100% | BUG-002 first, then automation |

**Previous Sprint Velocity:** 14 points (Sprint 2)
**Sprint 3 Commitment:** 15 points + 4 bugs (aggressive due to bug backlog)

---

## Parallel Work Strategy

### Days 1-2: Bug Confirmation & Initial Fixes
```
QA Track:          [BUG-003 confirm] → [BUG-004 confirm] → [BUG-005 confirm]
QAA Track:         [BUG-002 fix (2h)]
BE Track:          [STORY-010 start: git blame -C -C -C research]
FE Track:          [STORY-011 start: settings page scaffold]
```

### Days 3-4: Bug Fixes Complete
```
QA Track:          [Test bug fixes] → [Regression testing]
QAA Track:         [E2E test updates for bugs]
BE Track:          [BUG-004 fix (3h)] → [STORY-010 continue]
FE Track:          [BUG-003 fix (2h)] → [BUG-005 fix (2h)]
```

### Days 5-8: Story Implementation
```
BE/FE Track:       [STORY-010 main implementation] → [STORY-012]
QAA Track:         [STORY-010 test fixtures] → [STORY-012 tests]
UX Track:          [LLM summary UI review]
```

### Days 9-10: Integration & Polish
```
All Tracks:        [Integration testing] → [Edge cases] → [Buffer]
```

---

## Task Breakdown

### BUG-002: Fix Bun Test Exclusion (2h)

| Task ID | Task | Owner | Estimate | Priority |
|---------|------|-------|----------|----------|
| TASK-064 | Debug bunfig.toml exclusion pattern | QAA | 0.5h | P0 |
| TASK-065 | Fix 3 failing validation.test.ts assertions | QAA | 1h | P0 |
| TASK-066 | Verify all 61+ unit tests pass | QAA | 0.5h | P0 |

**Subtotal:** 2h

---

### BUG-003: Text Missing in UI (3h)

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-067 | Identify and document missing text | QA | 1h | - |
| TASK-068 | Fix text rendering issues | FE | 1.5h | TASK-067 |
| TASK-069 | Add tests for text visibility | QAA | 0.5h | TASK-068 |

**Subtotal:** 3h

---

### BUG-004: Uncommitted Changes Handling (4h)

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-070 | Test uncommitted change scenarios | QA | 1h | - |
| TASK-071 | Add git status detection to API | BE | 1.5h | TASK-070 |
| TASK-072 | Return uncommitted state in response | BE | 1h | TASK-071 |
| TASK-073 | Display uncommitted indicator in UI | FE | 0.5h | TASK-072 |

**Subtotal:** 4h

---

### BUG-005: Button Disabled Unexpectedly (3h)

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-074 | Document exact button disable conditions | QA | 1h | - |
| TASK-075 | Fix RepoInput validation logic | FE | 1.5h | TASK-074 |
| TASK-076 | Add visual feedback for disabled reason | FE | 0.5h | TASK-075 |

**Subtotal:** 3h

---

### STORY-010: Track Method Moves Between Files (8 pts)

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-077 | Implement git blame -C -C -C parsing | BE | 3h | - |
| TASK-078 | Create cross-file move detection service | BE | 2h | TASK-077 |
| TASK-079 | Add confidence scoring for matches | BE | 1.5h | TASK-078 |
| TASK-080 | Add cross-file info to blame API response | BE | 1h | TASK-079 |
| TASK-081 | Distinguish copy vs move (original exists check) | BE | 1.5h | TASK-080 |
| TASK-082 | Cache cross-file detection results | BE | 1h | TASK-081 |
| TASK-083 | Create "moved from file" lineage indicator | FE | 2h | TASK-080 |
| TASK-084 | Display confidence badge (high/medium/low) | FE | 1h | TASK-083 |
| TASK-085 | Add "View original file" link | FE | 1.5h | TASK-083 |
| TASK-086 | Create test fixtures for cross-file moves | QAA | 1h | - |
| TASK-087 | E2E tests for method move detection | QAA | 2h | TASK-085 |

**Subtotal:** 17.5h

---

### STORY-011: Configure Anthropic API Key (2 pts)

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-088 | Create settings page/modal component | FE | 1.5h | - |
| TASK-089 | Implement API key input with mask/reveal | FE | 1h | TASK-088 |
| TASK-090 | Add localStorage persistence for key | FE | 0.5h | TASK-089 |
| TASK-091 | Implement key format validation (soft) | FE | 0.5h | TASK-090 |
| TASK-092 | Create API key context provider | FE | 1h | TASK-090 |
| TASK-093 | Add clear key functionality | FE | 0.5h | TASK-092 |
| TASK-094 | E2E tests for API key management | QAA | 1h | TASK-093 |

**Subtotal:** 6h

---

### STORY-012: Generate LLM Summary of Line History (5 pts)

| Task ID | Task | Owner | Estimate | Dependencies |
|---------|------|-------|----------|--------------|
| TASK-095 | Design prompt template for code explanation | BE | 1h | - |
| TASK-096 | Gather lineage context for prompt | BE | 1.5h | TASK-095 |
| TASK-097 | Implement Anthropic API client (browser-side) | FE | 2h | STORY-011 |
| TASK-098 | Handle streaming response display | FE | 1.5h | TASK-097 |
| TASK-099 | Create "Explain History" button in ChangePanel | FE | 1h | TASK-096 |
| TASK-100 | Display summary with loading states | FE | 1h | TASK-098 |
| TASK-101 | Implement response caching by line/commit | FE | 1h | TASK-100 |
| TASK-102 | Handle missing API key state | FE | 0.5h | TASK-092 |
| TASK-103 | Handle API errors gracefully | FE | 0.5h | TASK-100 |
| TASK-104 | E2E tests for LLM summary (mocked API) | QAA | 1.5h | TASK-103 |

**Subtotal:** 11.5h

---

## Task Summary

| Owner | Task Count | Total Estimate |
|-------|------------|----------------|
| BE | 11 | 14.5h |
| FE | 19 | 19h |
| QA | 3 | 3h |
| QAA | 9 | 7h |

**Total:** 42 tasks, 43.5h estimated

---

## Dependencies Map

```
BUGS (P0 - Priority)
├── BUG-002: TASK-064 → TASK-065 → TASK-066 (QAA, independent)
├── BUG-003: TASK-067 (QA) → TASK-068 (FE) → TASK-069 (QAA)
├── BUG-004: TASK-070 (QA) → TASK-071 → TASK-072 (BE) → TASK-073 (FE)
└── BUG-005: TASK-074 (QA) → TASK-075 → TASK-076 (FE)

STORY-010 (Method Moves)
├── Backend: TASK-077 → TASK-078 → TASK-079 → TASK-080 → TASK-081 → TASK-082
├── Frontend: TASK-083 → TASK-084, TASK-085 (depend on TASK-080)
└── QAA: TASK-086 (parallel), TASK-087 (depends on TASK-085)

STORY-011 (API Key Config)
├── Frontend: TASK-088 → TASK-089 → TASK-090 → TASK-091
│            TASK-090 → TASK-092 → TASK-093
└── QAA: TASK-094 (depends on TASK-093)

STORY-012 (LLM Summary) - Depends on STORY-011
├── Backend: TASK-095 → TASK-096
├── Frontend: TASK-097 → TASK-098 → TASK-100 → TASK-101
│            TASK-099 (depends on TASK-096)
│            TASK-102 (depends on TASK-092)
│            TASK-103 (depends on TASK-100)
└── QAA: TASK-104 (depends on TASK-103)
```

### Critical Path

```
Day 1-2:   BUGS confirmation (QA) + BUG-002 fix (QAA) + STORY-010 start (BE) + STORY-011 start (FE)
Day 3-4:   Bug fixes (BE: BUG-004, FE: BUG-003/005) + STORY-010 backend + STORY-011 complete
Day 5-6:   STORY-010 complete (BE+FE) + STORY-012 start
Day 7-8:   STORY-012 implementation + E2E tests
Day 9-10:  Integration, edge cases, buffer
```

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| git blame -C -C -C slow on large repos | High | High | Use single -C first, triple on demand; aggressive caching | BE |
| LLM response quality unpredictable | Medium | Medium | Iterate on prompt; show confidence; allow re-generation | BE |
| Bug fixes take longer than estimated | Medium | Medium | Bugs are P0, will deprioritize story points if needed | SM |
| Anthropic API rate limits | Low | Low | Cache responses, show graceful degradation | FE |
| Cross-file detection false positives | Medium | Medium | Use conservative similarity threshold, show confidence | BE |

---

## Definition of Done (Sprint)

- [ ] All 4 HIGH bugs resolved and verified
- [ ] All stories meet acceptance criteria
- [ ] Code reviewed and merged
- [ ] E2E tests passing (Playwright)
- [ ] Unit tests passing (Bun) - including BUG-002 fix
- [ ] No new critical bugs introduced
- [ ] LLM integration works with valid API key
- [ ] Cross-file detection shows confidence indicators

---

## Decisions Made

| Decision | Rationale | Owner |
|----------|-----------|-------|
| Bugs before stories | Production stability is prerequisite for new features | SM |
| QA confirms bugs first | Need accurate repro steps before dev work | SM |
| Parallel bug confirmation | QA can confirm 3 bugs while QAA fixes BUG-002 | SM |
| Browser-side Anthropic calls | Simpler MVP, no proxy server needed | BE |
| Cache LLM responses | Avoid repeated API costs for same queries | FE |
| 15 points + 4 bugs | Aggressive but achievable with parallel strategy | Team |

---

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| Create all task files in sprint-3/backlog | SM | Today |
| Start BUG-002 fix | QAA | Day 1 |
| Start BUG-003/004/005 confirmation | QA | Day 1 |
| Start STORY-010 BE research | BE | Day 1 |
| Start STORY-011 settings page | FE | Day 1 |
| Design LLM summary UI mockup | UX | Day 3 |

---

## Sprint Commitment Confirmation

**The team commits to:**
- [x] Sprint Goal: Achieve production stability and enable AI-powered code explanations
- [x] Resolving 4 HIGH priority bugs
- [x] Delivering 15 story points (STORY-010: 8, STORY-011: 2, STORY-012: 5)
- [x] BUG-002 resolved by Day 1-2, other bugs by Day 4

**Confidence Level:** 4/5 (high confidence with parallel execution strategy)

---

## Next Steps

1. SM to create task files for all 42 tasks
2. QAA starts BUG-002 immediately (Day 1)
3. QA starts bug confirmation (BUG-003, 004, 005) in parallel
4. BE starts STORY-010 research while bugs are confirmed
5. FE starts STORY-011 settings page scaffold
6. Daily standups to track progress

---

*Meeting notes by: SM (Scrum Master)*
*Sprint 3 Start: 2026-02-12*
*Sprint 3 End: 2026-02-26*
