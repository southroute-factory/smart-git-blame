# File Browser Instead of Path Entry

**Submitted by:** Product Owner
**Date:** 2026-02-12
**Type:** feature
**Status:** ✅ Reviewed (2026-02-12)
**Decision:** Accept as STORY-013 (Sprint 4, pending security review)

## Description
Replace or augment the manual path entry with a file browser UI for selecting repository and file paths.

## Context
- Current UX: Two text inputs for repo path and file path
- Users must know exact paths to enter
- Could be error-prone and unfriendly for new users

## Proposed Enhancements
1. **Repository browser:** Browse local filesystem to select repo folder
2. **File tree:** Once repo selected, show navigable file tree
3. **Recent files:** Remember recently viewed files
4. **Search:** Filter files by name within repo

## Questions for Refinement
- [ ] Keep text input as fallback or replace entirely?
- [ ] Use native file picker dialog or custom tree component?
- [ ] Should we validate that selected folder is a git repo?
- [ ] How to handle large repos with many files (lazy loading)?
- [ ] Security implications of filesystem browsing?

## Technical Considerations
- May need new API endpoint to list directory contents
- Could use `fs.readdir` on server side
- Tree component library selection (or build custom)

## Related
- STORY-001: Enter repository and file path
- `/src/components/RepoInput.tsx`
