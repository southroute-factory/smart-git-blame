# STORY-013: File Browser Navigation

## Story

**As a** developer,
**I want** to browse and select files from a visual file tree,
**So that** I can easily navigate to files without knowing exact paths.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-013 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P2 |
| **Sprint** | Sprint 4 (Post-MVP) |
| **Estimated Points** | 8 |

---

## Background

Currently, users must enter exact repository and file paths in text inputs. This requires prior knowledge of paths and is error-prone. A file browser provides visual navigation that:
- Reduces input errors
- Improves discoverability
- Aligns with the "zero configuration" epic goal

---

## Acceptance Criteria

### AC1: Repository browser
**Given** I click "Browse" next to repository path,
**When** the file browser opens,
**Then** I can navigate the local filesystem to select a folder,
**And** the selected path appears in the repository input.

### AC2: Git repository validation
**Given** I select a folder in the repository browser,
**When** the folder is not a git repository,
**Then** I see a warning "Not a git repository",
**And** I can still select it (soft validation).

### AC3: File tree navigation
**Given** I have selected a valid repository,
**When** I click "Browse" next to file path,
**Then** I see a tree view of files in the repository,
**And** I can expand/collapse folders by clicking,
**And** I can select a file to populate the file path input.

### AC4: Lazy loading
**Given** I am browsing a large repository,
**When** I expand a folder,
**Then** directory contents load on demand (not upfront),
**And** I see a loading indicator while fetching.

### AC5: Keyboard accessibility
**Given** the file browser is open,
**When** I use keyboard navigation,
**Then** Arrow keys navigate the tree,
**And** Enter expands folders or selects files,
**And** Escape closes the browser,
**And** Tab moves between controls.

### AC6: Security validation
**Given** I am browsing files,
**When** the backend serves directory contents,
**Then** paths are validated to prevent traversal attacks,
**And** symlinks pointing outside repo root are blocked,
**And** only files within the repository are accessible.

### AC7: Recent files (stretch goal)
**Given** I have previously opened files,
**When** I open the file browser,
**Then** I see a "Recent Files" section at the top,
**And** I can quickly select a recently viewed file.

---

## Technical Notes

### Backend (API)

- Create `/api/files/route.ts` endpoint
- Validate all paths with `path.resolve()` + prefix check
- Use `fs.readdir` with `withFileTypes: true`
- Response: `{ entries: [{name, type, size?, mtime?}], hasMore }`
- Block symlinks that resolve outside repo root
- Apply same sanitization as existing `git.ts`

### Frontend (Components)

```
src/components/FileBrowser/
├── FileBrowserModal.tsx   # Modal container
├── FileTree.tsx           # Recursive tree component
├── FileTreeNode.tsx       # Individual node (folder/file)
├── PathBreadcrumb.tsx     # Current path navigation
└── RecentFiles.tsx        # Quick access list
```

### Libraries

| Purpose | Recommendation |
|---------|----------------|
| Modal | Headless UI Dialog or Radix Dialog |
| Tree | Custom (no heavy library needed) |
| Icons | lucide-react (tree-shakeable) |

### Security Requirements

**⚠️ CRITICAL: Security review required before implementation**

| Risk | Mitigation |
|------|------------|
| Path traversal | Validate resolved paths start with repo root |
| Symlink escape | Check symlink targets stay within boundary |
| Permission bypass | Use server-side validation only |
| Information disclosure | Don't expose system paths in errors |

---

## Team Input (from Refinement)

### PM (Product Manager)
- High user-facing impact, reduces friction
- Phased approach recommended
- Dependencies: STORY-001, STORY-006

### BE (Backend Engineer)
- **Estimate:** 6 points backend
- Security is critical concern
- Create `src/lib/filesystem.ts` with secure validation

### FE (Frontend Engineer)
- **Estimate:** 7 points frontend (13 total, reduced scope to 8)
- Full keyboard accessibility required
- Bundle impact: ~15KB

### UX (UI/UX Designer)
- High UX value, Priority P1 for post-MVP
- Hybrid approach: keep text input for power users
- WCAG compliance essential

### QA (Quality Engineer)
- ~14.5 hours manual testing
- Need test repo with nested structure
- Security testing critical

### QAA (QA Automation)
- 31-49 new tests estimated
- Prioritize data-testid attributes
- ARIA tree patterns need testing

### BIZ (Business Stakeholder)
- Medium business value
- Current input works, this is polish
- Defer to post-MVP

---

## Dependencies

- STORY-006: Validate inputs (validation infrastructure)
- Security review sign-off (blocker)

---

## Out of Scope

- Remote repository browsing
- File content preview
- Multi-file selection
- Bookmarks/favorites

---

## Definition of Done

- [ ] Browse button opens file browser modal
- [ ] Repository folder selection works
- [ ] File tree navigation functional
- [ ] Keyboard navigation complete
- [ ] Security validation passes review
- [ ] E2E tests for all acceptance criteria
- [ ] Accessibility audit passed
- [ ] No path traversal vulnerabilities

---

*Created: 2026-02-12*  
*Source: Backlog Refinement Meeting*
