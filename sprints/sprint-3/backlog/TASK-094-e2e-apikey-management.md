# TASK-094: E2E Tests for API Key Management

| Field | Value |
|-------|-------|
| **Task ID** | TASK-094 |
| **Story** | STORY-011 |
| **Owner** | QAA |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create end-to-end tests for API key configuration feature.

## Acceptance Criteria

- [ ] Test key saved to localStorage
- [ ] Test key NOT in network requests to our server
- [ ] Test key cleared on remove
- [ ] Test masked display works correctly
- [ ] Test format validation warning shows

## Test Cases

```typescript
test('saves API key to localStorage', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /settings/i }).click();
  await page.getByPlaceholder(/sk-ant/i).fill('sk-ant-test123');
  await page.getByRole('button', { name: /save/i }).click();
  
  const storedKey = await page.evaluate(() => localStorage.getItem('anthropic_api_key'));
  expect(storedKey).toBe('sk-ant-test123');
});

test('key not sent to server', async ({ page }) => {
  // Monitor network requests
  const requests: string[] = [];
  page.on('request', r => requests.push(r.postData() || ''));
  
  // Save key and use app
  // Verify key not in any request body
});

test('shows masked key after save', async ({ page }) => {
  // Save key, reload, check masked display
});
```

## Dependencies

- TASK-093

## Blocked By

- All FE work must be complete
