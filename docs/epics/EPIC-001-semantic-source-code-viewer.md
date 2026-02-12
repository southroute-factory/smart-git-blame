# EPIC-001: Semantic Source Code Viewer

## Epic Summary

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-001 |
| **Epic Name** | Semantic Source Code Viewer |
| **Epic Owner** | User |
| **Status** | In Definition |
| **Target Start** | Sprint 1 |
| **Target Completion** | Sprint 2 |

---

## Problem Statement

Developers spend significant time tracing bugs through code history. The typical workflow involves:
1. Running `git blame` to find when a line was changed
2. Finding the commit that introduced the change
3. Locating the associated PR/merge context to understand *why* it was changed

This process is fragmented across multiple tools (terminal, GitHub/GitLab UI, IDE) and requires context-switching that breaks developer flow.

---

## Vision

A semantic source code viewer with a git-blame style interface optimized for developer drill-down workflows. One click on a line reveals when and how it was introduced, with full change context - no tool switching required.

---

## Goals

1. **Reduce time to context** - Minimize clicks/steps from "suspicious line" to "full change context"
2. **Provider-agnostic** - Work with any git repository, no GitHub/GitLab dependency
3. **Zero configuration** - Point at a repo and file, start exploring immediately
4. **Familiar interface** - Build on the git-blame mental model developers already know

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Time from line to full context | < 3 clicks | User testing |
| Works with any git repo | 100% compatibility | QA testing various repo types |
| Page load time | < 2 seconds | Performance testing |
| User satisfaction | Positive feedback | User interviews |

---

## Scope

### In Scope (MVP)

| Capability | Description |
|------------|-------------|
| Repository input | Enter local git repo path and file path |
| Blame view | Display file with git blame annotations per line |
| Commit drill-down | Click line to see full commit details |
| Merge context | View parent merge commit with full message and commit list |
| Direct commit handling | Standalone change units for non-merge commits |
| Input validation | Clear error messages for invalid paths |
| Loading states | Visual feedback during data fetching |

### Out of Scope (MVP)

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Code parsing / semantic analysis | Complexity; focus on git metadata first | Yes - Phase 2 |
| Multi-file navigation | Scope creep; single file delivers value | Yes - Phase 2 |
| GitHub/GitLab API integration | Adds auth complexity; git-only is cleaner | Maybe |
| Remote repository cloning | User already has repo locally | Maybe |
| IDE extension | Different platform; web first | Yes - Phase 3 |

---

## User Stories

### Sprint 1 (P1 - Core MVP)

| Story ID | Title | Link |
|----------|-------|------|
| STORY-001 | Enter repository and file path | [STORY-001](../stories/STORY-001-enter-repo-and-file-path.md) |
| STORY-002 | View file with git blame annotations | [STORY-002](../stories/STORY-002-view-blame-annotations.md) |
| STORY-003 | View commit details for a line | [STORY-003](../stories/STORY-003-view-commit-details.md) |
| STORY-004 | View merge commit context | [STORY-004](../stories/STORY-004-view-merge-commit-context.md) |
| STORY-005 | Handle direct commits to main | [STORY-005](../stories/STORY-005-handle-direct-commits.md) |

### Sprint 2 (P2 - Polish)

| Story ID | Title | Link |
|----------|-------|------|
| STORY-006 | Validate repository and file inputs | [STORY-006](../stories/STORY-006-validate-inputs.md) |
| STORY-007 | Display loading states | [STORY-007](../stories/STORY-007-loading-states.md) |

---

## Technical Approach

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) |
| Backend | API routes with Node.js `child_process` |
| Frontend | React Server Components, Tailwind CSS |
| Database | None (reads directly from git) |

### Key Git Commands

| Command | Purpose |
|---------|---------|
| `git blame --porcelain` | Line-by-line attribution with structured output |
| `git log` | Commit and merge history |
| `git show --stat` | Commit details and changed files |
| `git log --merges --ancestry-path` | Find parent merge commit |

### Components

| Component | Responsibility |
|-----------|----------------|
| `RepoInput` | Form with repo path + file path fields |
| `BlameView` | Line-by-line display with click handlers |
| `ChangePanel` | Slide-out/modal showing commit/merge details |

---

## Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Git-only, no GitHub/GitLab API | Provider-agnostic, simpler architecture | 2026-02-12 |
| Direct commits = standalone change units | Consistent data model, identical UX | 2026-02-12 |
| Web app with Next.js | Existing stack, fast to build | 2026-02-12 |
| Repo path + file path text inputs | Git context required; simplest input method | 2026-02-12 |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large files slow to render | Medium | Medium | Virtualized list, pagination |
| Deep git history slow to traverse | Medium | Medium | Cache merge lookups, optimize queries |
| Complex merge histories | Low | High | Handle edge cases in Sprint 2 |

---

## Timeline

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| Sprint 1 Complete | End of Week 2 | Core blame view with drill-down working |
| Sprint 2 Complete | End of Week 4 | Validation, loading states, polish |
| MVP Release | End of Week 4 | Shippable product |

---

## Definition of Done (Epic Level)

- [ ] All linked stories completed and meet team DoD
- [ ] Core workflow functional: input → blame → commit → merge
- [ ] Works with real-world git repositories
- [ ] Error states handled gracefully
- [ ] Loading states provide feedback
- [ ] QA sign-off obtained
- [ ] Deployed and accessible

---

## References

- [Epic Kickoff Meeting Notes](../ceremonies/meetings/2026-02-12-epic-kickoff.md)
- [Story Writing Session](../ceremonies/meetings/2026-02-12-story-writing.md)

---

*Created by: PM*
*Date: 2026-02-12*
