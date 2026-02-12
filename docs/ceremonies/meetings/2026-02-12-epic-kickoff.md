# Epic Kickoff Meeting

## Meeting Details

| Field | Value |
|-------|-------|
| **Date** | 2026-02-12 |
| **Time** | -- |
| **Epic Name** | Semantic Source Code Viewer |
| **Epic ID** | EPIC-001 |
| **Epic Owner** | User (Meeting Lead) |
| **Facilitator** | SM (Scrum Master) |

---

## Purpose

The Epic Kickoff aligns the entire team on a new epic before work begins. It establishes shared understanding of scope, goals, technical approach, and success criteria. This meeting sets the foundation for successful delivery.

---

## Attendees

### Core Team
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

## Epic Overview

### Problem Statement
Developers spend significant time tracing bugs through code history. The typical workflow involves git-blame, finding the commit, then locating the associated PR/change context. This process is fragmented across multiple tools and interfaces.

### Vision
A semantic source code viewer with git-blame style interface optimized for developer drill-down workflows, particularly bug tracing. Click a line, see when/how it was introduced, understand the full change context.

### Guiding Principle
**Start as small as possible and iterate.**

---

## MVP Definition

### Scope

| Aspect | MVP Scope |
|--------|-----------|
| **Platform** | Web app (Next.js) |
| **Input** | Local git repo + file path |
| **Data source** | Git only (no GitHub/GitLab API) |
| **Core feature** | Blame view with clickable lines |
| **Drill-down** | Line → Commit → Merge commit (with full message + change list) |
| **Change unit** | Merge commit to main = logical PR equivalent |

### Out of Scope (MVP)
- Code parsing / semantic analysis
- Multi-file navigation
- GitHub/GitLab API integration
- Remote repository cloning

### Key Constraint
Rely only on git - no external provider APIs. Merge commit messages contain the full context (equivalent to PR description). This makes the tool provider-agnostic.

---

## Discussion Notes

### Change Unit Model
- **Question (QA):** How do we handle direct commits to main (non-merge)?
- **Resolution (BE):** Treat as standalone change units - first-class citizens with single commit instead of merge group
- UI shows same drill-down flow, with visual distinction ("Merge: 5 commits" vs "Direct commit")

---

## Key Decisions Made

| Decision | Rationale | Owner |
|----------|-----------|-------|
| Git-only, no GitHub/GitLab API | Provider-agnostic, simpler architecture, merge commits contain full context | User |
| Direct commits = standalone change units | Consistent data model, identical drill-down UX | BE |
| Web app with Next.js | Existing stack in project | FE |
| Repo path + file path text inputs (no drag-drop) | Git context required; drag-drop loses history; fastest to build | PM |
| Next.js full-stack (API routes + App Router) | No database needed; git ops via shell; Tailwind already configured | BE, FE |

---

## Open Questions

| Question | Owner | Due Date |
|----------|-------|----------|
| ~~Input method - how does user point tool at repo/file?~~ | PM | RESOLVED |

---

## Technical Approach

### Stack
- **Framework:** Next.js (App Router)
- **Backend:** API routes with Node.js `child_process` for git commands
- **Frontend:** React Server Components, Tailwind CSS
- **Database:** None (reads directly from git)

### Git Commands
- `git blame` - line-by-line attribution
- `git log` - commit and merge history
- `git show` - commit details

### MVP Components
| Component | Purpose |
|-----------|---------|
| `RepoInput` | Form with repo path + file path fields |
| `BlameView` | Line-by-line display with click handlers |
| `ChangePanel` | Slide-out/modal showing merge/commit details |

---

## Parking Lot
*Items to address later:*
- Future: code structure parsing (semantic analysis)
- Future: multi-file navigation
- Future: IDE extension possibility

---

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| | | | ☐ |

---

*Meeting notes by: SM*
