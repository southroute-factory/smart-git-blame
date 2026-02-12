# TASK-056: Create test fixtures with renames

| Field | Value |
|-------|-------|
| **Task ID** | TASK-056 |
| **Story** | STORY-008 |
| **Owner** | QAA |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create git test fixtures with various file rename scenarios for testing.

## Acceptance Criteria

- [ ] Create fixture with single file rename
- [ ] Create fixture with multiple renames
- [ ] Create fixture with rename + content change
- [ ] Create fixture with directory rename
- [ ] Create fixture with file that was never renamed
- [ ] Document each fixture's expected behavior

## Technical Notes

- Extend existing test-fixtures repo
- Use git mv for clean renames
- Include commits with meaningful messages
- Create a README documenting fixtures

## Fixture Plan

```bash
# test-fixtures/rename-scenarios/

# 1. Simple rename
git init simple-rename
cd simple-rename
echo "content" > original.ts
git add . && git commit -m "Initial commit"
git mv original.ts renamed.ts
git commit -m "Rename original.ts to renamed.ts"

# 2. Multiple renames
git init multiple-renames
cd multiple-renames
echo "content" > first.ts
git add . && git commit -m "Create first.ts"
git mv first.ts second.ts
git commit -m "Rename to second.ts"
git mv second.ts third.ts
git commit -m "Rename to third.ts"

# 3. Rename with changes
git init rename-with-changes
cd rename-with-changes
echo "original content" > file.ts
git add . && git commit -m "Initial"
git mv file.ts newfile.ts
echo "modified content" >> newfile.ts
git commit -am "Rename and modify"

# 4. Directory rename
git init dir-rename
cd dir-rename
mkdir src && echo "content" > src/file.ts
git add . && git commit -m "Initial"
git mv src lib
git commit -m "Rename src to lib"

# 5. Never renamed
git init no-rename
cd no-rename
echo "content" > stable.ts
git add . && git commit -m "Initial"
echo "more" >> stable.ts
git commit -am "Update without rename"
```

## Deliverables

- Test fixture repos created
- README.md documenting scenarios
- Verification script to validate fixtures

## Dependencies

- None (foundational testing task)

## Blocked By

- Nothing
