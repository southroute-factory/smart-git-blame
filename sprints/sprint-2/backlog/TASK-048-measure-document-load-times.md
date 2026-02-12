# TASK-048: Measure and document load times

| Field | Value |
|-------|-------|
| **Task ID** | TASK-048 |
| **Story** | STORY-007 |
| **Owner** | QAA |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Measure and document actual load times for various file sizes to establish performance baselines.

## Acceptance Criteria

- [ ] Measure load times for small files (<100 lines)
- [ ] Measure load times for medium files (100-1000 lines)
- [ ] Measure load times for large files (>1000 lines)
- [ ] Document baseline performance metrics
- [ ] Identify performance bottlenecks
- [ ] Create performance budget recommendations

## Technical Notes

- Use Playwright's performance API
- Measure Time to First Byte (TTFB)
- Measure Time to Interactive (TTI)
- Test on various network conditions

## Measurement Plan

```typescript
test.describe('Performance Measurements', () => {
  const fileSizes = [
    { name: 'small', path: 'small-file.ts', expectedLines: 50 },
    { name: 'medium', path: 'medium-file.ts', expectedLines: 500 },
    { name: 'large', path: 'large-file.ts', expectedLines: 2000 },
  ];
  
  for (const file of fileSizes) {
    test(`measures load time for ${file.name} file`, async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(`/blame/test-repo/${file.path}`);
      
      // Wait for content to be interactive
      await page.waitForSelector('[data-testid="blame-line"]');
      
      const loadTime = Date.now() - startTime;
      
      console.log(`${file.name} file load time: ${loadTime}ms`);
      
      // Performance budget assertions
      if (file.name === 'small') {
        expect(loadTime).toBeLessThan(1000);
      } else if (file.name === 'medium') {
        expect(loadTime).toBeLessThan(2000);
      } else {
        expect(loadTime).toBeLessThan(5000);
      }
    });
  }
});
```

## Deliverables

- Performance baseline document
- Recommendations for performance budget
- List of identified bottlenecks (if any)

## Dependencies

- TASK-044 (Loading implementation complete)
- TASK-047 (E2E test infrastructure)

## Blocked By

- TASK-044
