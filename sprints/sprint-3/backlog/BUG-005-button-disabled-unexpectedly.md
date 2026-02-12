# BUG-005: Submit Button Disabled Unexpectedly

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-005 |
| **Priority** | HIGH |
| **Status** | Needs QA Confirmation |
| **Reporter** | Product Owner |
| **Estimate** | QA: 1h confirm, FE: 2h fix |

## Description

The "View Blame" submit button appears to be disabled for unknown reasons when entering input. Users cannot submit the form even with valid-looking input.

## Steps to Reproduce
1. Navigate to home page
2. Enter repository path and file path
3. Observe button remains disabled

## Expected Behavior
Button should be enabled when both fields have valid input.

## Actual Behavior
Button disabled even with input entered. Reason unclear.

## QA Confirmation Tasks
- [ ] Identify exact conditions that disable button
- [ ] Test various input combinations:
  - Valid paths
  - Paths with spaces
  - Paths with special characters
  - Copy-pasted paths
- [ ] Check browser console for errors
- [ ] Test in different browsers
- [ ] Document exact repro steps

## Fix Tasks (After QA Confirmation)
- [ ] FE to review RepoInput validation logic
- [ ] Fix disabled state conditions
- [ ] Improve validation feedback to users
- [ ] Add visual indicator for why button is disabled

## Technical Notes
Current validation in RepoInput.tsx:
- Checks for empty values
- Checks for invalid path characters
- Button disabled when `hasErrors && Object.values(touched).some(Boolean)`

Possible issues:
- Validation too strict
- Touch state not updating correctly
- Race condition in validation

## Dependencies
- QA confirmation required before FE fix
