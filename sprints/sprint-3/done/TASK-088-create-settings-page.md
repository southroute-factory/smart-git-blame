# TASK-088: Create Settings Page/Modal Component

| Field | Value |
|-------|-------|
| **Task ID** | TASK-088 |
| **Story** | STORY-011 |
| **Owner** | FE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Create a settings page or modal for configuring application settings, starting with API keys.

## Acceptance Criteria

- [ ] Create settings page/modal accessible from main navigation
- [ ] Add settings icon/button to header
- [ ] Create "API Keys" or "AI Settings" section
- [ ] Design clean, accessible layout
- [ ] Include privacy messaging about local storage

## Technical Notes

Options:
1. **Full page:** `/settings` route
2. **Modal:** Overlay accessible from any page

Recommend modal for MVP - simpler navigation.

```tsx
<SettingsModal>
  <Section title="AI Settings">
    <p className="text-muted">
      Your API key is stored locally and never sent to our servers.
    </p>
    {/* API key input goes here */}
  </Section>
</SettingsModal>
```

Include gear icon (⚙️) in header to open.

## Dependencies

- None (can start immediately)

## Blocked By

- Nothing
