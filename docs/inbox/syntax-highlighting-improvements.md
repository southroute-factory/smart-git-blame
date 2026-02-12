# Syntax Highlighting Improvements

**Submitted by:** Product Owner
**Date:** 2026-02-12
**Type:** feature
**Status:** ✅ Reviewed (2026-02-12)
**Decision:** Accept to backlog (low priority, deferred to Sprint 4+)

## Description
Review and potentially enhance the syntax highlighting implementation in the blame view.

## Context
- Currently using Shiki with github-dark theme
- 30 languages pre-loaded
- Implemented in Sprint 1 (TASK-007)

## Questions for Refinement
- [ ] Are there specific languages missing that should be added?
- [ ] Should we offer theme selection (light/dark/custom)?
- [ ] Any performance concerns with large files?
- [ ] Line number styling improvements needed?
- [ ] Should highlighted code be selectable/copyable?

## Related
- STORY-002: View file with git blame annotations
- `/src/lib/highlighter.ts`
