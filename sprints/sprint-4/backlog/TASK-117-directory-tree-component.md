# TASK-117: Directory Tree Component

| Field | Value |
|-------|-------|
| **Task ID** | TASK-117 |
| **Story** | STORY-013 |
| **Owner** | FE |
| **Estimate** | 3h |
| **Status** | Backlog |

## Description

Create a recursive directory tree component that displays hierarchical file structure.

## Acceptance Criteria

- [ ] Display folders with expand/collapse toggles
- [ ] Lazy load children on expand (don't fetch all upfront)
- [ ] Visual indentation for nested levels
- [ ] Folder and file icons
- [ ] Selection highlighting
- [ ] Smooth expand/collapse animations
- [ ] Handle deep nesting gracefully
- [ ] Virtual scrolling for large directories (if needed)

## Technical Notes

```tsx
// src/components/FileBrowser/DirectoryTree.tsx
interface DirectoryTreeProps {
  path: string;
  level?: number;
  selectedPath: string | null;
  onSelect: (path: string, type: 'file' | 'directory') => void;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  isLoaded?: boolean;
}

export function DirectoryTree({
  path,
  level = 0,
  selectedPath,
  onSelect,
}: DirectoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDirectory(path).then(setNodes).finally(() => setLoading(false));
  }, [path]);

  const toggleExpand = async (node: TreeNode) => {
    if (node.type !== 'directory') return;
    
    const newExpanded = new Set(expanded);
    if (expanded.has(node.path)) {
      newExpanded.delete(node.path);
    } else {
      newExpanded.add(node.path);
      // Lazy load if not loaded
      if (!node.isLoaded) {
        const children = await fetchDirectory(node.path);
        node.children = children;
        node.isLoaded = true;
      }
    }
    setExpanded(newExpanded);
  };

  return (
    <ul style={{ paddingLeft: level * 16 }}>
      {nodes.map((node) => (
        <li key={node.path}>
          <TreeItem 
            node={node}
            isExpanded={expanded.has(node.path)}
            isSelected={selectedPath === node.path}
            onToggle={() => toggleExpand(node)}
            onSelect={() => onSelect(node.path, node.type)}
          />
          {expanded.has(node.path) && node.children && (
            <DirectoryTree 
              path={node.path}
              level={level + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
```

## Dependencies

- TASK-116
- TASK-109 (API must be ready)

## Blocked By

- Modal container must exist
- Files API must be functional
