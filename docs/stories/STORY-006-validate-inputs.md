# STORY-006: Validate Repository and File Inputs

## Story

**As a** developer,
**I want** to see clear error messages when I enter invalid paths,
**So that** I can correct my input and successfully view the blame.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-006 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P2 |
| **Sprint** | Sprint 2 |
| **Estimated Points** | 3 |

---

## Team Input

### BE (Backend Engineer)
- **Estimate:** 3 points
- **Notes:** Multiple validation checks with clear error responses
- **Approach:**
  - Check directory exists: `fs.existsSync()`
  - Check is git repo: `git -C {path} rev-parse --git-dir`
  - Check file tracked: `git -C {repo} ls-files {file}`
  - Return HTTP 400 with specific error codes

### FE (Frontend Engineer)
- **Estimate:** 2 points
- **Notes:** Error display and dismissal UX
- **Approach:**
  - Inline error messages below inputs
  - Red border on invalid field
  - Clear error on input change

### UX (UI/UX Designer)
- **Notes:** Errors should guide, not frustrate
- **Recommendations:**
  - Friendly language (not technical jargon)
  - Suggest next steps when possible
  - Error icon + red text, but not alarming

### PM (Product Manager)
- **Notes:** Error messages must be user-friendly, not technical
- **Examples:**
  - Bad: "ENOENT: no such file or directory"
  - Good: "Directory not found. Please check the path and try again."

### QA (Quality Engineer - Manual)
- **Test Focus:** Comprehensive error case testing
- **Key Scenarios:**
  - All 5 error conditions in acceptance criteria
  - Paths with spaces, special characters
  - Permission denied scenarios

### QAA (Quality Engineer - Automation)
- **Estimate:** 2 points for test coverage
- **Test Plan:** Negative test cases for all validation rules
- **Priority:** Medium

---

## Acceptance Criteria

### AC1: Invalid repository path
**Given** I enter a path that is not a git repository,
**When** I submit the form,
**Then** I see an error message: "Not a valid git repository".

### AC2: Repository path does not exist
**Given** I enter a path that does not exist on the filesystem,
**When** I submit the form,
**Then** I see an error message: "Directory not found".

### AC3: File does not exist
**Given** I enter a valid repository but a file path that does not exist,
**When** I submit the form,
**Then** I see an error message: "File not found in repository".

### AC4: File is not tracked by git
**Given** I enter a valid repository and a file that exists but is not tracked,
**When** I submit the form,
**Then** I see an error message: "File is not tracked by git".

### AC5: Empty inputs
**Given** I leave one or both input fields empty,
**When** I click submit,
**Then** I see an error message indicating which field is required.

### AC6: Error dismissal
**Given** an error message is displayed,
**When** I modify the input field,
**Then** the error message is cleared.

---

## Technical Notes

- Validate on server side (API route)
- Check git repo: `git -C {path} rev-parse --git-dir`
- Check file tracked: `git -C {repo} ls-files {file}`
- Return appropriate HTTP status codes (400 for validation errors)

---

## Dependencies

- STORY-001 (input form)

---

## Out of Scope

- Client-side validation before submit
- Path autocomplete
