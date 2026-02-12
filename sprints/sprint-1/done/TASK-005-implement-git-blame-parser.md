# TASK-005: Implement git blame parser

| Field | Value |
|-------|-------|
| **Task ID** | TASK-005 |
| **Story** | STORY-002 |
| **Owner** | BE |
| **Estimate** | 4h |
| **Status** | Backlog |

## Description

Create a parser that executes `git blame --porcelain` and transforms output into structured JSON.

## Acceptance Criteria

- [ ] Execute `git blame --porcelain {file}` in repo directory
- [ ] Parse porcelain format into array of line objects
- [ ] Each line object contains: lineNumber, content, sha, author, authorEmail, timestamp
- [ ] Handle files with various encodings

## Technical Notes

- Use Node.js `child_process.execSync` or `spawn`
- Porcelain format documentation: https://git-scm.com/docs/git-blame
- Consider streaming for large files (optimization, can defer)

## Output Format

```typescript
interface BlameLine {
  lineNumber: number;
  content: string;
  sha: string;
  author: string;
  authorEmail: string;
  timestamp: number;
}
```

## Dependencies

- TASK-001 (API route exists)

## Blocked By

- TASK-001
