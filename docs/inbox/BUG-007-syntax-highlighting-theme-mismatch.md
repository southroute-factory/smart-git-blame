# BUG-007: Code Text Invisible - Syntax Highlighting Theme Mismatch

**Submitted by:** Product Owner
**Date:** 2026-02-12
**Type:** bug
**Priority:** HIGH
**Affects:** BlameView - code column
**Severity:** Critical - Code is unreadable in light mode

## Description

Code text in the blame view is partially or fully invisible. Some keywords are visible but other text is hidden. This is caused by a theme mismatch between the syntax highlighter and the page background.

## Root Cause

**src/lib/highlighter.ts line 50:**
```typescript
const DEFAULT_THEME = "github-dark";
```

The `github-dark` Shiki theme outputs text colors designed for dark backgrounds (light text like `#e1e4e8`). However, the BlameView component uses:
- Light mode: `bg-white` and `bg-zinc-50` (light backgrounds)
- Dark mode: `bg-zinc-950` (dark background)

**Result:** In light mode, light-colored syntax highlighting text is invisible against the light background.

## Steps to Reproduce
1. Open the app in light mode (or system default light)
2. Navigate to blame view for any file
3. Observe code column - text is invisible or very faint

## Expected Behavior
Code text should be visible and readable in both light and dark modes.

## Proposed Fix

Update `src/lib/highlighter.ts` to support both themes:

```typescript
// Load both themes
const THEMES = ["github-dark", "github-light"] as const;

// In highlightCode function, pass both themes or detect mode
const html = highlighter.codeToHtml(code, {
  lang: effectiveLanguage,
  themes: {
    light: 'github-light',
    dark: 'github-dark',
  },
});
```

Or use CSS variables approach with Shiki's dual theme support.

## Acceptance Criteria
- [ ] Code is readable in light mode
- [ ] Code is readable in dark mode
- [ ] Syntax highlighting colors are appropriate for each mode
- [ ] E2E test verifies text visibility

## Dependencies
- Shiki documentation: https://shiki.style/guide/dual-themes
