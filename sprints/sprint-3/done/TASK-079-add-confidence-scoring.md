# TASK-079: Add Confidence Scoring for Matches

| Field | Value |
|-------|-------|
| **Task ID** | TASK-079 |
| **Story** | STORY-010 |
| **Owner** | BE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Implement confidence scoring for cross-file move detection since git uses similarity matching.

## Acceptance Criteria

- [ ] Define confidence levels: HIGH, MEDIUM, LOW
- [ ] Calculate confidence based on similarity percentage
- [ ] Consider line count and context
- [ ] Include confidence in move detection results
- [ ] Document confidence thresholds

## Technical Notes

Confidence levels:
- **HIGH:** >90% similarity, 5+ consecutive lines
- **MEDIUM:** 70-90% similarity, or 3-4 lines
- **LOW:** 50-70% similarity, or 1-2 lines

```typescript
interface CrossFileMoveWithConfidence extends CrossFileMove {
  confidence: 'high' | 'medium' | 'low';
  similarityScore: number;  // 0-100
}
```

Git uses default 50% similarity threshold. Consider exposing this.

## Dependencies

- TASK-078

## Blocked By

- TASK-078 detection service must be complete
