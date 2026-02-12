# TASK-124: Remember Recent Files

| Field | Value |
|-------|-------|
| **Task ID** | TASK-124 |
| **Story** | STORY-013 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Implement recent files/directories feature to help users quickly access previously used paths.

## Acceptance Criteria

- [ ] Store last 10 selected paths in localStorage
- [ ] Show recent paths section in file browser
- [ ] Click recent path to navigate directly
- [ ] Clear recent history option
- [ ] Separate recent repos from recent files
- [ ] Handle deleted/moved paths gracefully
- [ ] Persist across browser sessions

## Technical Notes

```tsx
// src/components/FileBrowser/useRecentPaths.ts
const RECENT_REPOS_KEY = 'file-browser-recent-repos';
const RECENT_FILES_KEY = 'file-browser-recent-files';
const MAX_RECENT = 10;

interface RecentPath {
  path: string;
  name: string;
  timestamp: number;
}

export function useRecentPaths(type: 'repo' | 'file') {
  const storageKey = type === 'repo' ? RECENT_REPOS_KEY : RECENT_FILES_KEY;
  
  const [recentPaths, setRecentPaths] = useState<RecentPath[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  });

  const addRecent = useCallback((path: string) => {
    const name = path.split('/').pop() || path;
    const newEntry: RecentPath = { path, name, timestamp: Date.now() };
    
    setRecentPaths((prev) => {
      const filtered = prev.filter((p) => p.path !== path);
      const updated = [newEntry, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  const clearRecent = useCallback(() => {
    localStorage.removeItem(storageKey);
    setRecentPaths([]);
  }, [storageKey]);

  return { recentPaths, addRecent, clearRecent };
}

// Recent paths UI component
export function RecentPaths({ 
  paths, 
  onSelect, 
  onClear 
}: {
  paths: RecentPath[];
  onSelect: (path: string) => void;
  onClear: () => void;
}) {
  if (paths.length === 0) return null;
  
  return (
    <div className="border-b pb-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Recent</h3>
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700">
          Clear
        </button>
      </div>
      <ul className="space-y-1">
        {paths.map((p) => (
          <li key={p.path}>
            <button
              onClick={() => onSelect(p.path)}
              className="text-sm text-blue-600 hover:underline truncate block w-full text-left"
              title={p.path}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Dependencies

- TASK-116

## Blocked By

- File browser modal must exist
