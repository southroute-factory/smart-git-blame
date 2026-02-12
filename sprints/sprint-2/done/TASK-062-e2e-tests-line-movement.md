# TASK-062: E2E tests for line movement

| Field | Value |
|-------|-------|
| **Task ID** | TASK-062 |
| **Story** | STORY-009 |
| **Owner** | QAA |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Create E2E tests to verify line movement detection and visualization.

## Acceptance Criteria

- [ ] Test moved line shows movement indicator
- [ ] Test tooltip displays correct information
- [ ] Test "jump to original" functionality
- [ ] Test lines without movement don't show indicator
- [ ] Test multiple moved line groups
- [ ] Test keyboard navigation for accessibility

## Technical Notes

- Use test fixtures with known line movements
- Test indicator visibility and interactions
- Verify tooltip content accuracy

## Test Cases

```typescript
test.describe('Line Movement Detection', () => {
  test('shows movement indicator for moved lines', async ({ page }) => {
    await page.goto('/blame/test-repo/moved-lines.ts?detectMovement=true');
    
    // Line 10 was moved from line 5
    const movedLine = page.locator('[data-line="10"] [data-testid="movement-indicator"]');
    await expect(movedLine).toBeVisible();
  });
  
  test('displays tooltip with movement details', async ({ page }) => {
    await page.goto('/blame/test-repo/moved-lines.ts?detectMovement=true');
    
    // Hover over movement indicator
    await page.hover('[data-line="10"] [data-testid="movement-indicator"]');
    
    // Tooltip should show original position
    await expect(page.locator('[data-testid="movement-tooltip"]'))
      .toContainText('Moved from line 5');
  });
  
  test('jumps to original position on click', async ({ page }) => {
    await page.goto('/blame/test-repo/moved-lines.ts?detectMovement=true');
    
    await page.hover('[data-line="50"] [data-testid="movement-indicator"]');
    await page.click('[data-testid="jump-to-original"]');
    
    // Original line should be highlighted
    await expect(page.locator('[data-line="20"]')).toHaveClass(/highlighted/);
  });
  
  test('does not show indicator for unmoved lines', async ({ page }) => {
    await page.goto('/blame/test-repo/moved-lines.ts?detectMovement=true');
    
    // Line 1 was never moved
    const staticLine = page.locator('[data-line="1"] [data-testid="movement-indicator"]');
    await expect(staticLine).not.toBeVisible();
  });
  
  test('handles multiple movement groups', async ({ page }) => {
    await page.goto('/blame/test-repo/many-moves.ts?detectMovement=true');
    
    // Multiple lines moved together should all show indicators
    const indicators = page.locator('[data-testid="movement-indicator"]');
    await expect(indicators).toHaveCount(8);
  });
});
```

## Dependencies

- TASK-060 (LineMovement indicator)
- TASK-061 (Tooltip implementation)
- TASK-063 (Test fixtures with moved lines)

## Blocked By

- TASK-060
- TASK-061
- TASK-063
