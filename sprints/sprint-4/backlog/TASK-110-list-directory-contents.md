# TASK-110: List Directory Contents

| Field | Value |
|-------|-------|
| **Task ID** | TASK-110 |
| **Story** | STORY-013 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Implement the core logic for listing directory contents with proper file metadata.

## Acceptance Criteria

- [ ] Use Node.js fs module to read directory
- [ ] Return file stats (size, modified date, type)
- [ ] Sort directories first, then files alphabetically
- [ ] Filter out hidden files (starting with .) by default
- [ ] Option to include hidden files via query param
- [ ] Handle empty directories

## Technical Notes

```typescript
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

async function listDirectory(dirPath: string, includeHidden = false) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  
  const results = await Promise.all(
    entries
      .filter(e => includeHidden || !e.name.startsWith('.'))
      .map(async (entry) => {
        const fullPath = join(dirPath, entry.name);
        const stats = await stat(fullPath);
        return {
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime.toISOString(),
          path: fullPath,
        };
      })
  );
  
  return results.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
```

## Dependencies

- TASK-109

## Blocked By

- Files API endpoint must exist
