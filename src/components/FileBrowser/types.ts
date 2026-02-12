/**
 * Shared types for FileBrowser components
 * Based on /api/files endpoint response types
 */

/**
 * Represents a single file or directory entry from the API
 */
export interface FileEntry {
  /** File or directory name */
  name: string;
  /** Type: 'file' or 'directory' */
  type: 'file' | 'directory';
  /** Absolute path to the file or directory */
  path: string;
  /** Size in bytes (only for files) */
  size?: number;
  /** True if directory is a git repository (only for directories) */
  isGitRepo?: boolean;
}

/**
 * Response structure from /api/files endpoint
 */
export interface FilesResponse {
  /** Array of file and directory entries */
  files: FileEntry[];
  /** Current directory path */
  currentPath: string;
  /** Parent directory path (undefined if at root) */
  parentPath?: string;
  /** True if current directory is inside a git repository */
  isGitRepo: boolean;
}

/**
 * Error response from /api/files endpoint
 */
export interface FilesErrorResponse {
  /** Human-readable error message */
  error: string;
  /** Machine-readable error code */
  code: string;
  /** Optional field name that caused the error */
  field?: string;
}

/**
 * Props for FileBrowser modal component
 */
export interface FileBrowserProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when a file is selected */
  onFileSelect?: (file: FileEntry) => void;
  /** Callback when a directory is selected */
  onDirectorySelect?: (directory: FileEntry) => void;
  /** Initial directory path to open */
  initialPath?: string;
  /** Title for the modal (default: "Browse Files") */
  title?: string;
  /** Whether to allow selecting directories (default: false) */
  allowDirectorySelection?: boolean;
  /** File extensions to filter (e.g., ['.ts', '.tsx']) */
  fileFilter?: string[];
}

/**
 * Props for DirectoryTree component
 */
export interface DirectoryTreeProps {
  /** Current directory path to display */
  path: string;
  /** Callback when navigating to a directory */
  onNavigate: (path: string) => void;
  /** Callback when a file is selected */
  onFileSelect?: (file: FileEntry) => void;
  /** Callback when a directory is selected (for selection mode) */
  onDirectorySelect?: (directory: FileEntry) => void;
  /** Whether directories can be selected */
  allowDirectorySelection?: boolean;
  /** File extensions to filter */
  fileFilter?: string[];
  /** Index of currently focused item for keyboard navigation */
  focusedIndex?: number;
  /** Callback when focus changes */
  onFocusChange?: (index: number) => void;
}

/**
 * Props for FileItem component
 */
export interface FileItemProps {
  /** File or directory entry to display */
  entry: FileEntry;
  /** Whether this item is currently focused */
  isFocused?: boolean;
  /** Whether this item is currently selected */
  isSelected?: boolean;
  /** Callback when item is clicked */
  onClick: (entry: FileEntry) => void;
  /** Callback when item should expand (for directories) */
  onExpand?: (entry: FileEntry) => void;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  /** Ref callback for focus management */
  itemRef?: (el: HTMLButtonElement | null) => void;
}

/**
 * Props for Breadcrumbs component
 */
export interface BreadcrumbsProps {
  /** Current path to display as breadcrumbs */
  currentPath: string;
  /** Callback when a breadcrumb segment is clicked */
  onNavigate: (path: string) => void;
}

/**
 * Props for loading skeleton components
 */
export interface LoadingSkeletonProps {
  /** Number of skeleton items to show */
  count?: number;
}
