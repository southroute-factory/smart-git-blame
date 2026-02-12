# TASK-084: Display Confidence Badge

| Field | Value |
|-------|-------|
| **Task ID** | TASK-084 |
| **Story** | STORY-010 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Show confidence indicator for cross-file move detection results.

## Acceptance Criteria

- [ ] Display confidence badge (HIGH/MEDIUM/LOW)
- [ ] Color-code badges (green/yellow/orange)
- [ ] Tooltip explains confidence meaning
- [ ] Show "possibly from" for low confidence
- [ ] Badge is visually unobtrusive

## Technical Notes

```tsx
<ConfidenceBadge level={confidence}>
  {confidence === 'low' ? 'Possibly from' : confidence}
</ConfidenceBadge>

// Tooltip content:
// HIGH: Strong match (>90% similarity, 5+ lines)
// MEDIUM: Good match (70-90% similarity)  
// LOW: Potential match (may be coincidental)
```

Colors:
- HIGH: green-500
- MEDIUM: yellow-500
- LOW: orange-500

## Dependencies

- TASK-083

## Blocked By

- TASK-083 must show move indicator first
