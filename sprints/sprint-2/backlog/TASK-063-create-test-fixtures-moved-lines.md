# TASK-063: Create test fixtures with moved lines

| Field | Value |
|-------|-------|
| **Task ID** | TASK-063 |
| **Story** | STORY-009 |
| **Owner** | QAA |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Create git test fixtures with various line movement scenarios for testing.

## Acceptance Criteria

- [ ] Create fixture with single line moved down
- [ ] Create fixture with single line moved up
- [ ] Create fixture with block of lines moved
- [ ] Create fixture with code reordering (multiple moves)
- [ ] Create fixture with no line movements
- [ ] Document each fixture's expected behavior

## Technical Notes

- Line movement is detected by git blame -M
- Must have identical or near-identical content
- Movement must be within reasonable distance

## Fixture Plan

```bash
# test-fixtures/movement-scenarios/

# 1. Single line moved down
git init single-move-down
cd single-move-down
cat > file.ts << 'EOF'
// Line 1
function first() {}
function second() {}
function third() {}
// Line 5
EOF
git add . && git commit -m "Initial"

# Move function from line 2 to line 4
cat > file.ts << 'EOF'
// Line 1
function second() {}
function third() {}
function first() {}
// Line 5
EOF
git commit -am "Move first function down"

# 2. Block of lines moved
git init block-move
cd block-move
cat > file.ts << 'EOF'
// imports
import a from 'a';
import b from 'b';
// code
function main() {}
// helpers
function helper1() {}
function helper2() {}
EOF
git add . && git commit -m "Initial"

# Move helpers above main
cat > file.ts << 'EOF'
// imports
import a from 'a';
import b from 'b';
// helpers (moved)
function helper1() {}
function helper2() {}
// code
function main() {}
EOF
git commit -am "Move helpers above main"

# 3. Code reordering
git init reorder
cd reorder
cat > file.ts << 'EOF'
function a() { return 1; }
function b() { return 2; }
function c() { return 3; }
function d() { return 4; }
EOF
git add . && git commit -m "Initial"

cat > file.ts << 'EOF'
function c() { return 3; }
function a() { return 1; }
function d() { return 4; }
function b() { return 2; }
EOF
git commit -am "Reorder functions"

# 4. No movements (control)
git init no-movement
cd no-movement
echo "content" > file.ts
git add . && git commit -m "Initial"
echo "more content" >> file.ts
git commit -am "Add content without moving"
```

## Deliverables

- Test fixture repos created
- README.md documenting scenarios
- Expected movement data documented per fixture

## Dependencies

- None (foundational testing task)

## Blocked By

- Nothing
