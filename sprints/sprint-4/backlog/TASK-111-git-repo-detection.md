# TASK-111: Git Repository Detection

| Field | Value |
|-------|-------|
| **Task ID** | TASK-111 |
| **Story** | STORY-013 |
| **Owner** | BE |
| **Estimate** | 0.5h |
| **Status** | Backlog |

## Description

Add git repository detection to the files API to identify valid git repositories.

## Acceptance Criteria

- [ ] Check for .git directory presence
- [ ] Return isGitRepo flag in response
- [ ] Identify git root when browsing subdirectories
- [ ] Return git root path in response
- [ ] Handle bare repositories

## Technical Notes

```typescript
import { access } from 'fs/promises';
import { join } from 'path';

async function detectGitRepo(path: string): Promise<{isGitRepo: boolean, gitRoot?: string}> {
  let currentPath = path;
  
  while (currentPath !== '/') {
    try {
      await access(join(currentPath, '.git'));
      return { isGitRepo: true, gitRoot: currentPath };
    } catch {
      currentPath = join(currentPath, '..');
    }
  }
  
  return { isGitRepo: false };
}
```

## Dependencies

- TASK-109
- TASK-110

## Blocked By

- Directory listing must work first
