# TASK-035: Validate file exists in repo

| Field | Value |
|-------|-------|
| **Task ID** | TASK-035 |
| **Story** | STORY-006 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Add server-side validation to verify the specified file exists within the repository.

## Acceptance Criteria

- [ ] Check if file path exists within the repository
- [ ] Verify path is a file (not a directory)
- [ ] Ensure file is tracked by git (not in .gitignore)
- [ ] Return appropriate error if validation fails
- [ ] Handle symbolic links appropriately

## Technical Notes

- Resolve file path relative to repository root
- Use `git ls-files` to verify file is tracked
- Prevent accessing files outside repository (path traversal)

## Implementation

```typescript
import { existsSync, statSync } from 'fs';
import { join, resolve, relative } from 'path';
import { execSync } from 'child_process';

export function validateFileInRepo(repoPath: string, filePath: string): { valid: boolean; error?: string } {
  const fullPath = join(repoPath, filePath);
  const resolvedPath = resolve(fullPath);
  
  // Prevent path traversal
  if (!resolvedPath.startsWith(resolve(repoPath))) {
    return { valid: false, error: 'File path is outside repository' };
  }
  
  if (!existsSync(fullPath)) {
    return { valid: false, error: 'File does not exist' };
  }
  
  if (!statSync(fullPath).isFile()) {
    return { valid: false, error: 'Path is not a file' };
  }
  
  return { valid: true };
}
```

## Dependencies

- TASK-034 (Repo validation must pass first)

## Blocked By

- TASK-034
