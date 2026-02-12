# TASK-104: E2E Tests for LLM Summary (Mocked API)

| Field | Value |
|-------|-------|
| **Task ID** | TASK-104 |
| **Story** | STORY-012 |
| **Owner** | QAA |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Create end-to-end tests for LLM summary feature using mocked API responses.

## Acceptance Criteria

- [ ] Test "Explain History" button appears when API key set
- [ ] Test button disabled when no API key
- [ ] Test loading state displays during request
- [ ] Test mocked streaming response renders
- [ ] Test cached response returns immediately
- [ ] Test error states display correctly

## Test Strategy

LLM output is non-deterministic, so:
1. Mock Anthropic API in tests
2. Verify correct request structure sent
3. Verify UI handles mocked responses correctly

## Test Cases

```typescript
test.describe('LLM Summary', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Anthropic API
    await page.route('**/api.anthropic.com/**', route => {
      route.fulfill({
        status: 200,
        body: mockStreamingResponse,
      });
    });
  });

  test('shows explain button when API key configured', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('anthropic_api_key', 'sk-ant-test');
    });
    await page.goto('/blame?...');
    await page.getByText(/line \d+/).first().click();
    await expect(page.getByRole('button', { name: /explain/i })).toBeEnabled();
  });

  test('shows loading then result', async ({ page }) => {
    // Click explain, verify loading, verify result
  });

  test('handles API error gracefully', async ({ page }) => {
    await page.route('**/api.anthropic.com/**', route => {
      route.fulfill({ status: 401, body: 'Invalid API key' });
    });
    // Verify error message displayed
  });
});
```

## Dependencies

- TASK-103 (all FE work complete)

## Blocked By

- All STORY-012 FE work must be complete
