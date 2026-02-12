# STORY-010: Track Method/Function Moves Between Files

## Story

**As a** developer,
**I want** to see when code was moved from one file to another,
**So that** I can trace the origin of extracted or refactored code.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-010 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P2 |
| **Sprint** | Sprint 2 |
| **Estimated Points** | 8 |

---

## Acceptance Criteria

### AC1: Detect code moved from another file
**Given** function "calculateTotal" was moved from "cart.ts" to "pricing.ts"
**And** this happened in commit DEF456
**When** I view a line inside calculateTotal in "pricing.ts"
**Then** the lineage shows the origin file "cart.ts"
**And** commit DEF456 is labeled as a "moved from different file" event

### AC2: Show confidence level
**Given** cross-file detection uses similarity matching
**When** I view lineage with detected cross-file move
**Then** I see a confidence indicator (high/medium/low)

### AC3: Handle copy vs move
**Given** code was copied (original still exists) vs moved (original deleted)
**When** I view the lineage
**Then** the event is labeled appropriately ("copied from" vs "moved from")

### AC4: Link to original file
**Given** a cross-file move is detected
**When** I view the lineage
**Then** I can click to view the original file at that commit

---

## Technical Notes

- Use `git blame -C -C -C` for aggressive cross-file detection
- Triple `-C` searches all files in all commits (expensive)
- Consider limiting search scope for performance
- Parse `previous` header for original file info

## Team Input

### BE (Backend Engineer)
- **Estimate:** 8 points (most complex lineage feature)
- **Approach:** `git blame -C -C -C --line-porcelain`
- **Risk:** Very expensive on large repos
- **Mitigation:** 
  - Cache results aggressively
  - Use single `-C` for initial pass, triple on demand
  - Set timeout with partial results

### FE (Frontend Engineer)
- **Estimate:** 2 points additional
- **Notes:** Need to handle confidence indicators and "View original" link

### UX (UI/UX Designer)
- **Recommendation:** Clear "originated from X" visual with confidence badge
- **Fallback:** If low confidence, show as "possibly from" with explanation

### QAA (Quality Engineer - Automation)
- **Test Fixtures Needed:** 
  - Function extracted to new file
  - Code copied between files
  - Class split across files
- **Challenge:** Cross-file detection is probabilistic, need fuzzy assertions

---

## Dependencies

- STORY-008 (file rename tracking)
- STORY-009 (line movement tracking)

---

## Out of Scope

- Tracking across repository forks
- Detecting moves from external/vendor code
- AST-based semantic matching (git similarity only)

---

## Technical Spike Recommended

Before committing to full implementation, validate:
1. Accuracy of `-C -C -C` on real codebases
2. Performance impact on repos with 10k+ files
3. False positive rate for common patterns
