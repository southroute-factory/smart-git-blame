# TASK-076: Add Visual Feedback for Disabled Reason

| Field | Value |
|-------|-------|
| **Task ID** | TASK-076 |
| **Bug** | BUG-005 |
| **Owner** | FE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Add visual indicator explaining why the button is disabled to improve user experience.

## Acceptance Criteria

- [ ] Show tooltip or hint when button is disabled
- [ ] Explain which field needs attention
- [ ] Clear messaging for each disable reason
- [ ] Accessible (not tooltip-only)

## Technical Notes

```tsx
<Button 
  disabled={!isValid}
  title={!isValid ? validationMessage : undefined}
>
  View Blame
</Button>

{!isValid && (
  <span className="text-sm text-muted">
    {validationMessage}
  </span>
)}
```

## Dependencies

- TASK-075

## Blocked By

- TASK-075 must be complete
