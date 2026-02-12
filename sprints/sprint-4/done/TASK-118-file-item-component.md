# TASK-118: File Item Component

| Field | Value |
|-------|-------|
| **Task ID** | TASK-118 |
| **Story** | STORY-013 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Create a reusable file item component for displaying individual files and folders in the tree.

## Acceptance Criteria

- [ ] Display appropriate icon based on file type
- [ ] Show file/folder name
- [ ] Visual feedback on hover
- [ ] Visual feedback on selection
- [ ] Double-click to expand folders / select files
- [ ] Single-click to select
- [ ] Show file extension-specific icons
- [ ] Truncate long names with ellipsis and tooltip

## Technical Notes

```tsx
// src/components/FileBrowser/FileItem.tsx
interface FileItemProps {
  node: TreeNode;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

const FILE_ICONS: Record<string, string> = {
  '.ts': '📄',
  '.tsx': '⚛️',
  '.js': '📜',
  '.json': '📋',
  '.md': '📝',
  '.css': '🎨',
  default: '📄',
};

export function FileItem({
  node,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
}: FileItemProps) {
  const icon = node.type === 'directory'
    ? (isExpanded ? '📂' : '📁')
    : getFileIcon(node.name);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded cursor-pointer',
        'hover:bg-gray-100',
        isSelected && 'bg-blue-100 hover:bg-blue-200'
      )}
      onClick={onSelect}
      onDoubleClick={node.type === 'directory' ? onToggle : onSelect}
    >
      {node.type === 'directory' && (
        <button onClick={(e) => { e.stopPropagation(); onToggle(); }}>
          {isExpanded ? '▼' : '▶'}
        </button>
      )}
      <span>{icon}</span>
      <span className="truncate" title={node.name}>
        {node.name}
      </span>
    </div>
  );
}
```

## Dependencies

- TASK-117

## Blocked By

- Directory tree structure must be defined
