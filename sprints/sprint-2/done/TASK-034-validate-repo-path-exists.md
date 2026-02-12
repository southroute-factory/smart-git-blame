# TASK-034: Validate repo path exists

| Field | Value |
|-------|-------|
| **Task ID** | TASK-034 |
| **Story** | STORY-006 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Add server-side validation to verify the repository path exists and is a valid git repository.

## Acceptance Criteria

- [ ] Check if repo path exists on filesystem
- [ ] Verify path is a directory (not a file)
- [ ] Verify path contains a `.git` directory (is a git repo)
- [ ] Return appropriate error if validation fails
- [ ] Handle permission errors gracefully

## Technical Notes

- Use Node.js `fs` module for filesystem checks
- Check for `.git` directory or use `git rev-parse --git-dir`
- Security: Prevent path traversal attacks

## Implementation

```typescript
import { existsSync, statSync } from 'fs';
import { join } from 'path';

export function validateRepoPath(repoPath: string): { valid: boolean; error?: string } {
  if (!existsSync(repoPath)) {
    return { valid: false, error: 'Repository path does not exist' };
  }
  
  if (!statSync(repoPath).isDirectory()) {
    return { valid: false, error: 'Path is not a directory' };
  }
  
  if (!existsSync(join(repoPath, '.git'))) {
    return { valid: false, error: 'Path is not a git repository' };
  }
  
  return { valid: true };
}
```

## Dependencies

- TASK-033 (Zod schema for parameter types)

## Blocked By

- TASK-033
