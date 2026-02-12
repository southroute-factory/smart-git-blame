# TASK-112: Security - Validate Paths

| Field | Value |
|-------|-------|
| **Task ID** | TASK-112 |
| **Story** | STORY-013 |
| **Owner** | BE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Implement path validation security to prevent directory traversal attacks.

## Acceptance Criteria

- [ ] Validate path doesn't contain `..` traversal
- [ ] Normalize paths before validation
- [ ] Block access outside allowed root directory
- [ ] Return 403 Forbidden for invalid paths
- [ ] Log security violations
- [ ] Unit tests for all bypass attempts

## Technical Notes

```typescript
import { resolve, normalize, isAbsolute } from 'path';

function validatePath(requestedPath: string, allowedRoot: string): boolean {
  // Normalize the path to resolve any . or .. segments
  const normalizedPath = normalize(requestedPath);
  
  // Resolve to absolute path
  const absolutePath = isAbsolute(normalizedPath) 
    ? normalizedPath 
    : resolve(allowedRoot, normalizedPath);
  
  // Ensure the resolved path is within allowed root
  const resolvedRoot = resolve(allowedRoot);
  
  if (!absolutePath.startsWith(resolvedRoot)) {
    console.warn(`Security: Blocked path traversal attempt: ${requestedPath}`);
    return false;
  }
  
  return true;
}
```

## Security Considerations

- Prevent `../../../etc/passwd` style attacks
- Block encoded traversal attempts (%2e%2e)
- Validate both Unix and Windows path separators

## Dependencies

- TASK-109

## Blocked By

- None - security is critical path
