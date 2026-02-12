# TASK-119: Breadcrumb Navigation

| Field | Value |
|-------|-------|
| **Task ID** | TASK-119 |
| **Story** | STORY-013 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create breadcrumb navigation component for showing current path and allowing quick navigation to parent directories.

## Acceptance Criteria

- [ ] Display current path as clickable breadcrumbs
- [ ] Root directory shown as home icon or "/"
- [ ] Each segment clickable to navigate
- [ ] Truncate middle segments for long paths
- [ ] Visual separator between segments
- [ ] Hover state on clickable segments
- [ ] Current directory not clickable (just text)

## Technical Notes

```tsx
// src/components/FileBrowser/Breadcrumbs.tsx
interface BreadcrumbsProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumbs({ path, onNavigate }: BreadcrumbsProps) {
  const segments = path.split('/').filter(Boolean);
  
  const breadcrumbs = segments.map((segment, index) => {
    const segmentPath = '/' + segments.slice(0, index + 1).join('/');
    return { name: segment, path: segmentPath };
  });
  
  // Truncate if too many segments
  const maxVisible = 4;
  const shouldTruncate = breadcrumbs.length > maxVisible;
  const visibleBreadcrumbs = shouldTruncate
    ? [
        breadcrumbs[0],
        { name: '...', path: '' },
        ...breadcrumbs.slice(-2)
      ]
    : breadcrumbs;

  return (
    <nav className="flex items-center gap-1 text-sm">
      <button 
        onClick={() => onNavigate('/')}
        className="hover:text-blue-600"
      >
        🏠
      </button>
      {visibleBreadcrumbs.map((crumb, index) => (
        <Fragment key={crumb.path || index}>
          <span className="text-gray-400">/</span>
          {crumb.path ? (
            <button
              onClick={() => onNavigate(crumb.path)}
              className="hover:text-blue-600 hover:underline"
            >
              {crumb.name}
            </button>
          ) : (
            <span className="text-gray-400">{crumb.name}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
```

## Dependencies

- TASK-116

## Blocked By

- Modal container must exist
