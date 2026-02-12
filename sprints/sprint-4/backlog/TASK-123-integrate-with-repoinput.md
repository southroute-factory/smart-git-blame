# TASK-123: Integrate with RepoInput

| Field | Value |
|-------|-------|
| **Task ID** | TASK-123 |
| **Story** | STORY-013 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Integrate the file browser modal with the existing RepoInput component.

## Acceptance Criteria

- [ ] Add "Browse" button next to path input fields
- [ ] Open file browser on button click
- [ ] Pre-populate with current input value
- [ ] Update input on file/folder selection
- [ ] Validate selected path is a git repo (for repo path)
- [ ] Validate selected file exists (for file path)
- [ ] Maintain existing manual input functionality

## Technical Notes

```tsx
// Update src/components/RepoInput.tsx
import { FileBrowserModal } from './FileBrowser/FileBrowserModal';

export function RepoInput() {
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  
  return (
    <form>
      {/* Repository path input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={repoPath}
          onChange={(e) => setRepoPath(e.target.value)}
          placeholder="/path/to/repo"
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => setShowRepoModal(true)}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          Browse
        </button>
      </div>
      
      {/* File path input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="src/example.ts"
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => setShowFileModal(true)}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          Browse
        </button>
      </div>

      <FileBrowserModal
        isOpen={showRepoModal}
        onClose={() => setShowRepoModal(false)}
        onSelect={(path) => {
          setRepoPath(path);
          setShowRepoModal(false);
        }}
        initialPath={repoPath || '/'}
        allowDirectories={true}
        allowFiles={false}
      />
      
      <FileBrowserModal
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        onSelect={(path) => {
          setFilePath(path);
          setShowFileModal(false);
        }}
        initialPath={repoPath || '/'}
        allowDirectories={false}
        allowFiles={true}
      />
    </form>
  );
}
```

## Dependencies

- TASK-116
- TASK-117

## Blocked By

- File browser modal must be functional
