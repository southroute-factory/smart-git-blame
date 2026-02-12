# TASK-052: Add rename detection to blame response

| Field | Value |
|-------|-------|
| **Task ID** | TASK-052 |
| **Story** | STORY-008 |
| **Owner** | BE |
| **Estimate** | 1.5h |
| **Status** | Backlog |

## Description

Enhance the blame API response to include file rename history information.

## Acceptance Criteria

- [ ] Add `renames` field to blame API response
- [ ] Include previous file names with timestamps
- [ ] Add `renamedFrom` field if file was renamed
- [ ] Include similarity percentage for each rename
- [ ] Maintain backward compatibility

## Technical Notes

- Use git blame -C to detect copies as well
- Integrate with file history from TASK-049
- Consider including this data conditionally (query param?)

## Implementation

```typescript
// Enhanced blame response
interface BlameResponse {
  success: true;
  data: {
    lines: BlameLine[];
    file: {
      path: string;
      renamedFrom?: {
        path: string;
        sha: string;
        timestamp: number;
        similarity: number;
      };
      renameHistory: Array<{
        fromPath: string;
        toPath: string;
        sha: string;
        timestamp: number;
        similarity: number;
      }>;
    };
    repository: {
      path: string;
      head: string;
    };
  };
}

// In blame API route
async function getBlameWithRenames(repo: string, file: string) {
  const [blameData, historyData] = await Promise.all([
    parseGitBlame(repo, file),
    getFileHistory(repo, file),
  ]);
  
  return {
    lines: blameData,
    file: {
      path: file,
      renamedFrom: historyData.renames[0], // Most recent rename
      renameHistory: historyData.renames,
    },
  };
}
```

## Dependencies

- TASK-049 (File history parser)
- TASK-050 (History API endpoint)
- TASK-051 (Caching for performance)

## Blocked By

- TASK-049
