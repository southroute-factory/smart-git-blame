# TASK-080: Add Cross-File Info to Blame API Response

| Field | Value |
|-------|-------|
| **Task ID** | TASK-080 |
| **Story** | STORY-010 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Extend the blame API response to include cross-file move information.

## Acceptance Criteria

- [ ] Add `crossFileOrigin` field to blame line response
- [ ] Include source file path, line range, and commit
- [ ] Include confidence score
- [ ] Maintain backward compatibility
- [ ] Document API changes

## Technical Notes

Response structure:
```typescript
interface BlameLine {
  // ... existing fields
  crossFileOrigin?: {
    sourceFile: string;
    sourceLineRange: { start: number; end: number };
    commitSha: string;
    commitMessage: string;
    confidence: 'high' | 'medium' | 'low';
    moveType: 'moved' | 'copied';  // Added in TASK-081
  };
}
```

## Dependencies

- TASK-079

## Blocked By

- TASK-079 confidence scoring must be complete
