# TASK-093: Add Clear Key Functionality

| Field | Value |
|-------|-------|
| **Task ID** | TASK-093 |
| **Story** | STORY-011 |
| **Owner** | FE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Add ability to remove a saved API key from settings.

## Acceptance Criteria

- [ ] Add "Remove Key" button when key is saved
- [ ] Confirm before removing (optional for MVP)
- [ ] Delete key from localStorage
- [ ] Update UI to show empty state
- [ ] Show confirmation "API key removed"

## Technical Notes

```tsx
{hasApiKey && (
  <button 
    onClick={handleRemoveKey}
    className="text-red-600 hover:text-red-700"
  >
    Remove Key
  </button>
)}

const handleRemoveKey = () => {
  clearApiKey();
  toast.success('API key removed');
};
```

## Dependencies

- TASK-092

## Blocked By

- Context provider must be complete
