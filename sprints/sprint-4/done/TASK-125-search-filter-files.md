# TASK-125: Search/Filter Files

| Field | Value |
|-------|-------|
| **Task ID** | TASK-125 |
| **Story** | STORY-013 |
| **Owner** | FE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Implement search and filter functionality to help users find files quickly.

## Acceptance Criteria

- [ ] Search input in modal header
- [ ] Filter current directory contents as user types
- [ ] Highlight matching text in results
- [ ] Show "no results" state
- [ ] Clear search button
- [ ] Keyboard shortcut (Ctrl/Cmd+F) to focus search
- [ ] Debounce search input
- [ ] Optional: recursive search across subdirectories

## Technical Notes

```tsx
// src/components/FileBrowser/FileSearch.tsx
interface FileSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  resultCount?: number;
}

export function FileSearch({ value, onChange, onClear, resultCount }: FileSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search files..."
        className="w-full px-3 py-2 pl-8 border rounded"
      />
      <span className="absolute left-2 top-1/2 -translate-y-1/2">🔍</span>
      {value && (
        <>
          <button
            onClick={onClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
          {resultCount !== undefined && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              {resultCount} found
            </span>
          )}
        </>
      )}
    </div>
  );
}

// Filter hook with debounce
export function useFileFilter(items: TreeNode[], searchTerm: string) {
  const [debouncedTerm] = useDebounce(searchTerm, 200);
  
  return useMemo(() => {
    if (!debouncedTerm) return items;
    
    const lowerTerm = debouncedTerm.toLowerCase();
    return items.filter((item) => 
      item.name.toLowerCase().includes(lowerTerm)
    );
  }, [items, debouncedTerm]);
}

// Highlight matching text
export function HighlightMatch({ text, search }: { text: string; search: string }) {
  if (!search) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${search})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}
```

## Dependencies

- TASK-116
- TASK-117

## Blocked By

- Modal and tree components must exist
