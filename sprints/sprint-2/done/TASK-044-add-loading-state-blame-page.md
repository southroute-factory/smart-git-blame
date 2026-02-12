# TASK-044: Add loading state to blame page

| Field | Value |
|-------|-------|
| **Task ID** | TASK-044 |
| **Story** | STORY-007 |
| **Owner** | FE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Integrate skeleton components into the blame page to show during data loading.

## Acceptance Criteria

- [ ] Show BlameViewSkeleton while blame data loads
- [ ] Show ChangePanelSkeleton when opening commit details
- [ ] Handle loading state in page component
- [ ] Smooth transition from skeleton to content
- [ ] Prevent layout shift when content loads

## Technical Notes

- Use React Suspense if applicable
- Consider using loading.tsx in Next.js app router
- Maintain scroll position during transitions

## Implementation

```typescript
function BlamePage({ params }: { params: { repo: string; file: string } }) {
  const { data, isLoading, error } = useBlameData(params.repo, params.file);
  
  if (isLoading) {
    return (
      <div className="flex">
        <BlameViewSkeleton lineCount={30} />
      </div>
    );
  }
  
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  
  return (
    <div className="flex">
      <BlameView data={data} />
      {selectedCommit && (
        <Suspense fallback={<ChangePanelSkeleton />}>
          <ChangePanel commitSha={selectedCommit} />
        </Suspense>
      )}
    </div>
  );
}
```

## Dependencies

- TASK-042 (BlameViewSkeleton)
- TASK-043 (ChangePanelSkeleton)

## Blocked By

- TASK-042
- TASK-043
