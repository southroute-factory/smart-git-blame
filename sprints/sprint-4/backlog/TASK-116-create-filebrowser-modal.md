# TASK-116: Create FileBrowser Modal

| Field | Value |
|-------|-------|
| **Task ID** | TASK-116 |
| **Story** | STORY-013 |
| **Owner** | FE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Create the main FileBrowser modal component that serves as the container for file browsing functionality.

## Acceptance Criteria

- [ ] Create modal overlay with proper z-index
- [ ] Modal header with title and close button
- [ ] Modal body for directory tree content
- [ ] Modal footer with action buttons (Select, Cancel)
- [ ] Keyboard support (Escape to close)
- [ ] Click outside to close (optional, configurable)
- [ ] Focus trap within modal
- [ ] Smooth open/close animations

## Technical Notes

```tsx
// src/components/FileBrowser/FileBrowserModal.tsx
interface FileBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  initialPath?: string;
  allowDirectories?: boolean;
  allowFiles?: boolean;
}

export function FileBrowserModal({
  isOpen,
  onClose,
  onSelect,
  initialPath = '/',
  allowDirectories = true,
  allowFiles = true,
}: FileBrowserModalProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh]">
        <header className="flex items-center justify-between p-4 border-b">
          <h2>Browse Files</h2>
          <button onClick={onClose}>×</button>
        </header>
        <main className="p-4 overflow-auto">
          {/* Directory tree goes here */}
        </main>
        <footer className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose}>Cancel</button>
          <button 
            onClick={() => selectedPath && onSelect(selectedPath)}
            disabled={!selectedPath}
          >
            Select
          </button>
        </footer>
      </div>
    </div>
  );
}
```

## Dependencies

- None

## Blocked By

- None - can start immediately
