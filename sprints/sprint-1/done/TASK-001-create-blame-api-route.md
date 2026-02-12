# TASK-001: Create API route for blame endpoint

| Field | Value |
|-------|-------|
| **Task ID** | TASK-001 |
| **Story** | STORY-001 |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create the initial API route that will receive repository path and file path parameters and return blame data.

## Acceptance Criteria

- [ ] API route at `/api/blame` accepts `repo` and `file` query params
- [ ] Returns 200 with placeholder response for valid params
- [ ] Returns 400 for missing params

## Technical Notes

- Next.js App Router API route
- Validate params exist before processing
- Actual blame logic in TASK-005/006

## Dependencies

- None (entry point)

## Blocked By

- Nothing
