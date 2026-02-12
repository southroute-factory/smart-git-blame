# STORY-007: Display Loading States

## Story

**As a** developer,
**I want** to see loading indicators while data is being fetched,
**So that** I know the application is working and can anticipate when results will appear.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-007 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P2 |
| **Sprint** | Sprint 2 |
| **Estimated Points** | 3 |

---

## Team Input

### BE (Backend Engineer)
- **Estimate:** 0 points
- **Notes:** No backend work required - purely frontend

### FE (Frontend Engineer)
- **Estimate:** 3 points
- **Notes:** Multiple loading states across app
- **Approach:**
  - Skeleton loaders for blame view (mimics line structure)
  - Spinner or skeleton for panel content
  - Disabled button state during submission
  - React Suspense or loading state hooks

### UX (UI/UX Designer)
- **Notes:** Loading states affect perceived performance
- **Recommendations:**
  - Skeleton loaders preferred over spinners (feels faster)
  - Blame skeleton: gray bars mimicking code lines
  - Panel skeleton: placeholder boxes for each field
  - Subtle animation (pulse) to show activity
- **Action Item:** Design skeleton loader components for Sprint 2

### QA (Quality Engineer - Manual)
- **Test Focus:** Visual verification of loading states
- **Key Scenarios:**
  - Slow network simulation
  - Loading state visibility duration
  - No flash of loading for fast responses

### QAA (Quality Engineer - Automation)
- **Estimate:** 1 point for test coverage
- **Test Plan:** Assert loading state appears before content
- **Priority:** Low
- **Notes:** May need artificial delays in tests

---

## Acceptance Criteria

### AC1: Loading state on form submit
**Given** I submit the repository and file path form,
**When** the blame data is being fetched,
**Then** I see a loading indicator (spinner or skeleton).

### AC2: Loading state for commit details
**Given** I click on a line to view commit details,
**When** the commit data is being fetched,
**Then** the panel shows a loading indicator.

### AC3: Loading state for merge details
**Given** I click "View Merge" to see merge context,
**When** the merge data is being fetched,
**Then** the panel shows a loading indicator.

### AC4: Disable interactions during load
**Given** a loading operation is in progress,
**When** I try to submit again or click another line,
**Then** duplicate requests are prevented (button disabled or clicks ignored).

### AC5: Loading indicator is visible
**Given** any loading state is active,
**When** I view the loading indicator,
**Then** it is clearly visible and indicates progress (not static).

---

## Technical Notes

- Use React Suspense or loading state hooks
- Consider skeleton loaders for blame view (better UX than spinner)
- Debounce rapid clicks on lines

---

## Dependencies

- STORY-001 (form submission)
- STORY-003 (commit details loading)
- STORY-004 (merge details loading)

---

## Out of Scope

- Progress percentage for large files
- Cancel in-flight requests
- Offline detection
