# TASK-113: Security - Block Symlinks

| Field | Value |
|-------|-------|
| **Task ID** | TASK-113 |
| **Story** | STORY-013 |
| **Owner** | BE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Block symlink traversal to prevent escaping the allowed directory via symbolic links.

## Acceptance Criteria

- [ ] Detect symbolic links in directory listing
- [ ] Option to hide symlinks completely
- [ ] Option to show symlinks but mark as untraversable
- [ ] Use realpath to detect symlink destinations
- [ ] Block following symlinks outside allowed root
- [ ] Unit tests for symlink handling

## Technical Notes

```typescript
import { lstat, realpath } from 'fs/promises';

async function checkSymlink(filePath: string, allowedRoot: string): Promise<{
  isSymlink: boolean;
  isAllowed: boolean;
  realPath?: string;
}> {
  const stats = await lstat(filePath);
  
  if (!stats.isSymbolicLink()) {
    return { isSymlink: false, isAllowed: true };
  }
  
  try {
    const resolvedPath = await realpath(filePath);
    const isAllowed = resolvedPath.startsWith(allowedRoot);
    
    return {
      isSymlink: true,
      isAllowed,
      realPath: isAllowed ? resolvedPath : undefined,
    };
  } catch {
    // Broken symlink
    return { isSymlink: true, isAllowed: false };
  }
}
```

## Dependencies

- TASK-112

## Blocked By

- Path validation must be complete
