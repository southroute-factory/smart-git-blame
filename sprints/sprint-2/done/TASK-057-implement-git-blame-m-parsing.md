# TASK-057: Implement git blame -M parsing

| Field | Value |
|-------|-------|
| **Task ID** | TASK-057 |
| **Story** | STORY-009 |
| **Owner** | BE |
| **Estimate** | 2h |
| **Status** | Backlog |

## Description

Implement parsing of `git blame -M` output to detect line movement within files.

## Acceptance Criteria

- [ ] Execute `git blame -M --porcelain` for file
- [ ] Parse output to detect moved lines
- [ ] Extract original line number for moved content
- [ ] Handle -M threshold parameter for sensitivity
- [ ] Return movement metadata per line

## Technical Notes

- `-M` detects lines moved within the file
- `-M[<num>]` sets similarity threshold (default 20 chars)
- Porcelain output shows `previous` for moved lines
- Consider also `-C` for detecting copies from other files

## Implementation

```typescript
interface BlameLineWithMovement extends BlameLine {
  movement?: {
    detected: boolean;
    originalLine?: number;
    originalFile?: string; // If -C is used
    similarity?: number;
  };
}

async function parseGitBlameWithMovement(
  repoPath: string, 
  filePath: string,
  options: { detectMoves?: boolean; detectCopies?: boolean } = {}
): Promise<BlameLineWithMovement[]> {
  const flags = ['-M'];
  if (options.detectCopies) {
    flags.push('-C');
  }
  
  const output = execSync(
    `git blame ${flags.join(' ')} --porcelain -- "${filePath}"`,
    { cwd: repoPath, encoding: 'utf-8' }
  );
  
  // Parse porcelain output
  // Look for "previous <sha> <filename>" lines
  // These indicate line was moved from another location
  
  const lines: BlameLineWithMovement[] = [];
  // ... parsing logic
  
  return lines;
}
```

## Git Blame -M Output Example

```
abc1234 1 1 1
author John Doe
previous def5678 old-file.ts
	moved line content
```

## Dependencies

- None (foundational backend task)

## Blocked By

- Nothing
