# TASK-120: Keyboard Navigation

| Field | Value |
|-------|-------|
| **Task ID** | TASK-120 |
| **Story** | STORY-013 |
| **Owner** | FE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Implement full keyboard navigation support for the file browser.

## Acceptance Criteria

- [ ] Arrow Up/Down to navigate between items
- [ ] Arrow Right to expand folder
- [ ] Arrow Left to collapse folder or go to parent
- [ ] Enter to select current item
- [ ] Home to go to first item
- [ ] End to go to last item
- [ ] Type-ahead: typing letters jumps to matching item
- [ ] Escape to close modal
- [ ] Focus visible indicator

## Technical Notes

```tsx
// src/components/FileBrowser/useKeyboardNavigation.ts
interface UseKeyboardNavigationOptions {
  items: TreeNode[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onExpand: (index: number) => void;
  onCollapse: (index: number) => void;
  onConfirm: (index: number) => void;
}

export function useKeyboardNavigation({
  items,
  selectedIndex,
  onSelect,
  onExpand,
  onCollapse,
  onConfirm,
}: UseKeyboardNavigationOptions) {
  const typeAheadBuffer = useRef('');
  const typeAheadTimeout = useRef<NodeJS.Timeout>();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        onSelect(Math.min(selectedIndex + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        onSelect(Math.max(selectedIndex - 1, 0));
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (items[selectedIndex]?.type === 'directory') {
          onExpand(selectedIndex);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onCollapse(selectedIndex);
        break;
      case 'Enter':
        e.preventDefault();
        onConfirm(selectedIndex);
        break;
      case 'Home':
        e.preventDefault();
        onSelect(0);
        break;
      case 'End':
        e.preventDefault();
        onSelect(items.length - 1);
        break;
      default:
        // Type-ahead search
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          handleTypeAhead(e.key);
        }
    }
  }, [items, selectedIndex, onSelect, onExpand, onCollapse, onConfirm]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

## Dependencies

- TASK-117
- TASK-118

## Blocked By

- Tree and item components must exist
