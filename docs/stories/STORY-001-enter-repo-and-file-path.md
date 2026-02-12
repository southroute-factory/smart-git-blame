# STORY-001: Enter Repository and File Path

## Story

**As a** developer,
**I want** to enter a local git repository path and file path,
**So that** I can view the blame history for that file.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-001 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P1 |
| **Sprint** | Sprint 1 |
| **Estimated Points** | 2 |

---

## Team Input

### BE (Backend Engineer)
- **Estimate:** 2 points
- **Notes:** Simple API route, path handling straightforward
- **Approach:** Single API endpoint to receive paths and redirect to blame view

### FE (Frontend Engineer)
- **Estimate:** 2 points
- **Notes:** Basic form with two inputs, navigation on submit
- **Approach:** Controlled form component, URL params for navigation

### UX (UI/UX Designer)
- **Notes:** Keep form minimal and focused
- **Recommendations:** Clear labels, helpful placeholders, prominent submit button

### QA (Quality Engineer - Manual)
- **Test Focus:** Form submission, navigation flow
- **Key Scenarios:** Valid paths, empty inputs, special characters in paths

### QAA (Quality Engineer - Automation)
- **Estimate:** 1 point for test coverage
- **Test Plan:** Basic e2e test for form submission and navigation
- **Priority:** High

---

## Acceptance Criteria

### AC1: Display input form
**Given** I am on the application home page,
**When** the page loads,
**Then** I see a form with two input fields: "Repository Path" and "File Path".

### AC2: Submit valid paths
**Given** I have entered a valid repository path and file path,
**When** I click the "View" button,
**Then** I am navigated to the blame view for that file.

### AC3: Repository path placeholder
**Given** I am viewing the input form,
**When** I focus on the "Repository Path" field,
**Then** I see placeholder text showing an example path format (e.g., `/Users/dev/my-project`).

### AC4: File path placeholder
**Given** I am viewing the input form,
**When** I focus on the "File Path" field,
**Then** I see placeholder text showing an example relative path (e.g., `src/index.ts`).

---

## Technical Notes

- Form submits to `/blame?repo={repoPath}&file={filePath}`
- Paths are URL-encoded
- No validation on client side for MVP (handled in STORY-006)

---

## Dependencies

- None (entry point story)

---

## Out of Scope

- Input validation and error messages (STORY-006)
- Recent repositories list
- Drag-and-drop file selection
