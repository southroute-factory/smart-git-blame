# TASK-089: Implement API Key Input with Mask/Reveal

| Field | Value |
|-------|-------|
| **Task ID** | TASK-089 |
| **Story** | STORY-011 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create a secure API key input field with mask/reveal functionality.

## Acceptance Criteria

- [ ] Use `<input type="password">` by default
- [ ] Add show/hide toggle button
- [ ] When saved, show only last 4 characters (sk-ant-****1234)
- [ ] Input placeholder explains expected format
- [ ] Save button enabled only with input

## Technical Notes

```tsx
const [showKey, setShowKey] = useState(false);
const [key, setKey] = useState('');

<div className="relative">
  <input 
    type={showKey ? 'text' : 'password'}
    value={key}
    onChange={(e) => setKey(e.target.value)}
    placeholder="sk-ant-api03-..."
    className="pr-10"
  />
  <button 
    onClick={() => setShowKey(!showKey)}
    className="absolute right-2 top-1/2 -translate-y-1/2"
  >
    {showKey ? <EyeOff /> : <Eye />}
  </button>
</div>
```

## Dependencies

- TASK-088

## Blocked By

- Settings page must exist
