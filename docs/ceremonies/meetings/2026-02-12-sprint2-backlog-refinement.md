# Sprint 2 Backlog Refinement Meeting

## Meeting Details

| Field | Value |
|-------|-------|
| **Date** | 2026-02-12 |
| **Time** | 14:00 - 15:00 |
| **Purpose** | Review inbox items, prepare backlog for Sprint 2 |
| **Facilitator** | SM (Scrum Master) |

---

## Attendees

| Role | Name | Present |
|------|------|---------|
| Product Owner | User | ☑ |
| Scrum Master | SM | ☑ |
| Product Manager | PM | ☑ |
| Backend Engineer | BE | ☑ |
| Frontend Engineer | FE | ☑ |
| UX Designer | UX | ☑ |
| QA Engineer (Manual) | QA | ☑ |
| QA Engineer (Automation) | QAA | ☑ |
| Business Stakeholder | BIZ | ☑ |

---

## Context

Sprint 1 completed with 100% delivery:
- 5/5 stories (17 points)
- 29/29 tasks
- 56 E2E tests (280% of target)
- Zero blockers

Current backlog for Sprint 2-3:
- STORY-006: Validate inputs (3 pts) - Sprint 2
- STORY-007: Loading states (3 pts) - Sprint 2
- STORY-008: Track file renames (5 pts) - Sprint 2
- STORY-009: Track line movement (3 pts) - Sprint 2
- STORY-010: Track method moves (8 pts) - Sprint 3
- STORY-011: Configure API key (2 pts) - Sprint 3
- STORY-012: LLM summary (5 pts) - Sprint 3

**Team Velocity:** 17 points/sprint (established)

---

## Inbox Items Reviewed

### Item 1: Syntax Highlighting Improvements

**Source:** `docs/inbox/syntax-highlighting-improvements.md`

**Description:** Enhance syntax highlighting with theme selection, additional languages, large file performance, line number styling, and code selectability/copyability.

**Current State:** Shiki with github-dark theme, 30 languages pre-loaded (Sprint 1 TASK-007)

---

#### Team Discussion

| Role | Input |
|------|-------|
| **PM** | Medium business value. Current implementation functional. Theme selection and copyability are "nice-to-have" polish. Recommend splitting if accepted: themes (2 pts), copyability (1 pt), performance (3-5 pts). |
| **BE** | **3 points** for backend work. Primarily config changes. Risks: memory pressure with multiple themes, large file performance. Recommend lazy-loading themes. |
| **FE** | **8 points** total. Theme context/persistence (2 pts), languages (1 pt), virtual scrolling for large files (3 pts), line numbers (1 pt), copy button (1 pt). Need `@tanstack/react-virtual` for performance. Bundle impact: ~50-90KB with themes. |
| **UX** | Medium UX value. Priority P2. Theme sync with system dark/light mode important. Copy button with visual feedback preferred over selection alone. Virtual scrolling mandatory for 1000+ lines. |
| **QA** | High testability. ~13 hours manual testing. Need 35+ language sample files, large file fixtures (10K+ lines). Risk: copy behavior inconsistent across browsers. |
| **QAA** | Medium automation complexity. 22-34 new tests, 4.5-6.5 days effort. Need visual regression baseline before theme work. |
| **BIZ** | **Low business value.** Cosmetic polish on working feature. No user will choose/leave product based on themes. Defer to post-MVP. |

---

#### Questions Resolved

| Question | Answer |
|----------|--------|
| Missing languages? | Current 30 languages cover majority of use cases. Add on request. |
| Theme selection? | Yes, but defer - not MVP critical. |
| Performance concerns? | Need virtual scrolling for files >1000 lines. |
| Line number improvements? | Minor polish, low priority. |
| Code selectability? | Currently works; add explicit copy button for better UX. |

---

#### Decision: **ACCEPT to Backlog (Low Priority)**

**Rationale:** Feature works today. Enhancements are polish, not blockers. Defer until post-MVP or user feedback requests it.

**New Story Created:** None for now. Will create story if prioritized later.

**Estimated Points:** 8-13 points total (if implemented)

**Target Sprint:** Post-MVP (Sprint 4+)

---

### Item 2: File Browser Navigation

**Source:** `docs/inbox/file-browser-navigation.md`

**Description:** Replace/augment manual path entry with file browser UI including repository browser, file tree, recent files, and search/filter.

**Current State:** Two text inputs for repo path and file path (RepoInput.tsx)

---

#### Team Discussion

| Role | Input |
|------|-------|
| **PM** | **High user-facing impact.** Reduces friction and errors. Aligns with "zero configuration" goal. Recommend phased approach: Phase 1 basic picker (3 pts), Phase 2 tree (5 pts), Phase 3 recent+search (3 pts). Total ~11 points. Dependencies: STORY-001, STORY-006. |
| **BE** | **6 points** backend work. New API endpoint for directory listing using `fs.readdir`. **HIGH SECURITY RISK:** Path traversal attacks critical concern. Must validate paths stay within repo root. Block symlinks outside repo. Apply sanitization. Create `src/lib/filesystem.ts` with secure validation. |
| **FE** | **13 points** frontend work. File tree component, modal, breadcrumb, search, recent files. Need: Headless UI Dialog (~5KB), custom tree (no heavy library), `fuse.js` for fuzzy search (~5KB). Bundle impact: ~15KB. Challenge: keyboard accessibility for tree navigation. |
| **UX** | **High UX value.** Priority P1. Current exact-path requirement creates poor discoverability. Hybrid approach: keep text input for power users, add browse button. Full keyboard navigation essential (WCAG compliance). Lazy-load directories. 3-4 sprints design effort. |
| **QA** | Medium-high testability. ~14.5 hours manual testing. Need test repo with nested structure (10+ levels), 1000+ files, symlinks, hidden files. **Security testing critical** for path traversal. |
| **QAA** | **High automation complexity.** 31-49 new tests, 6.5-10.5 days effort. Prioritize data-testid attributes. Tree widget ARIA patterns need careful testing. |
| **BIZ** | **Medium business value.** Lowers friction for new users but current input works. Core MVP value is "line → context" workflow - users already know paths. Recommend deferring to post-MVP UX polish sprint. |

---

#### Questions Resolved

| Question | Answer |
|----------|--------|
| Keep text input as fallback? | Yes - hybrid approach for power users. |
| Native picker vs custom tree? | Custom tree component for full control and accessibility. |
| Validate git repo? | Yes - already handled by STORY-006 validation. |
| Large repos? | Lazy loading with pagination (100 entries default). |
| Security implications? | **Critical.** Requires dedicated security review before implementation. |

---

#### Decision: **ACCEPT to Backlog (Medium Priority)**

**Rationale:** High UX value but significant engineering effort and security concerns. Not blocking MVP value delivery. Defer to allow focus on Sprint 2-3 commitments.

**New Story Created:** Yes - create STORY-013 for backlog.

**Estimated Points:** 8 points (Phase 1: basic browser with security)

**Target Sprint:** Sprint 4 (Post-MVP)

**Prerequisite:** Security review of filesystem access pattern.

---

## New Story: STORY-013 - File Browser Navigation

```markdown
# STORY-013: File Browser Navigation

## Story

**As a** developer,
**I want** to browse and select files from a visual file tree,
**So that** I can easily navigate to files without knowing exact paths.

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-013 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P2 |
| **Sprint** | Sprint 4 (Post-MVP) |
| **Estimated Points** | 8 |

## Acceptance Criteria

### AC1: Repository browser
**Given** I click "Browse" next to repository path
**When** the file browser opens
**Then** I can navigate the local filesystem to select a folder
**And** the selected path appears in the repository input

### AC2: File tree navigation
**Given** I have selected a repository
**When** I click "Browse" next to file path
**Then** I see a tree view of files in the repository
**And** I can expand/collapse folders
**And** I can select a file to view

### AC3: Keyboard accessibility
**Given** the file browser is open
**When** I use keyboard navigation
**Then** Arrow keys navigate the tree
**And** Enter selects the focused item
**And** Escape closes the browser

### AC4: Security validation
**Given** I am browsing files
**When** the backend serves directory contents
**Then** paths are validated to prevent traversal attacks
**And** symlinks outside repo root are blocked

## Technical Notes

- Create `/api/files` endpoint with secure path validation
- Use `path.resolve` + prefix check to validate paths
- Lazy-load directory contents on expand
- Persist recent files in localStorage

## Dependencies

- STORY-006 (validation infrastructure)

## Security Requirement

Requires security review sign-off before implementation.
```

---

## Existing Backlog Review for Sprint 2

### Sprint 2 Planned Stories

| Story | Points | Status | Readiness |
|-------|--------|--------|-----------|
| STORY-006: Validate inputs | 3 | Ready | ✅ DoR met |
| STORY-007: Loading states | 3 | Ready | ✅ DoR met |
| STORY-008: Track file renames | 5 | Ready | ✅ DoR met |
| STORY-009: Track line movement | 3 | Ready | ✅ DoR met |
| **Sprint 2 Total** | **14** | | |

### Sprint 2 Readiness Assessment

| Criteria | Status |
|----------|--------|
| User stories clearly written | ✅ |
| Acceptance criteria defined | ✅ |
| Stories estimated by team | ✅ |
| Dependencies identified | ✅ |
| Technical approach understood | ✅ |
| UX requirements clear | ✅ |

**Conclusion:** All Sprint 2 stories meet Definition of Ready. ✅

---

### Sprint 2 Capacity Check

| Metric | Value |
|--------|-------|
| Established velocity | 17 points |
| Sprint 2 committed | 14 points |
| Buffer | 3 points (18%) |

**Recommendation:** Keep Sprint 2 at 14 points. Buffer allows for:
- Mid-sprint design review (retro action item)
- Performance baseline setup (retro action item)
- Addressing any unexpected complexity in lineage tracking

---

## Prioritized Backlog

### Sprint 2 (Current Sprint)

| Priority | Story | Points | Rationale |
|----------|-------|--------|-----------|
| 1 | STORY-006: Validate inputs | 3 | Foundation for reliable UX |
| 2 | STORY-007: Loading states | 3 | User feedback during operations |
| 3 | STORY-008: Track file renames | 5 | Core lineage feature |
| 4 | STORY-009: Track line movement | 3 | Core lineage feature |
| **Total** | | **14** | |

### Sprint 3 (Planned)

| Priority | Story | Points | Rationale |
|----------|-------|--------|-----------|
| 1 | STORY-011: Configure API key | 2 | Enables LLM features |
| 2 | STORY-012: LLM summary | 5 | Key differentiator |
| 3 | STORY-010: Track method moves | 8 | Complex lineage (spike recommended) |
| **Total** | | **15** | |

### Sprint 4+ (Post-MVP Backlog)

| Priority | Story | Points | Rationale |
|----------|-------|--------|-----------|
| 1 | STORY-013: File browser navigation | 8 | UX improvement (security review required) |
| 2 | Syntax highlighting improvements | 8-13 | Polish (create story when prioritized) |

---

## Recommendations for Sprint 2 Scope

### ✅ Confirmed Sprint 2 Scope

1. **STORY-006: Validate inputs (3 pts)** - Ready
2. **STORY-007: Loading states (3 pts)** - Ready
3. **STORY-008: Track file renames (5 pts)** - Ready
4. **STORY-009: Track line movement (3 pts)** - Ready

**Total: 14 points** (82% of velocity - healthy buffer)

### ❌ Not Included in Sprint 2

- Syntax highlighting improvements (deferred to post-MVP)
- File browser navigation (deferred to Sprint 4, security review needed)
- STORY-010, 011, 012 (remain Sprint 3 as planned)

### 📋 Action Items from Refinement

| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| Create STORY-013 file in stories folder | PM | Sprint 2 Day 1 | ☐ |
| Schedule security review for file browser API | BE + SM | Before Sprint 4 | ☐ |
| Move inbox items to "reviewed" status | SM | Today | ☐ |
| Update EPIC-001 with new story | PM | Sprint 2 Day 1 | ☐ |

---

## Summary

### Inbox Item Decisions

| Item | Decision | Points | Target |
|------|----------|--------|--------|
| Syntax Highlighting | Accept (low priority) | 8-13 | Sprint 4+ |
| File Browser Navigation | Accept (medium priority) | 8 | Sprint 4 |

### Sprint 2 Readiness

✅ **Sprint 2 is READY to begin**
- All 4 stories meet Definition of Ready
- 14 points committed (within velocity)
- Healthy 18% buffer for contingencies

### Key Observations

1. **Both inbox items are polish, not MVP-critical** - Team consensus to defer
2. **Security is a blocker for file browser** - Requires review before implementation
3. **Sprint 2-3 scope protects MVP timeline** - No changes recommended
4. **File browser has highest future UX value** - Prioritize in Sprint 4

---

*Meeting ended at: 15:00*  
*Duration: 60 minutes*  
*Next ceremony: Sprint 2 Planning*

---

*Meeting notes by: SM*
