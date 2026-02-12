'use client';

import { memo } from 'react';

/**
 * File icon mapping by extension
 */
const FILE_ICON_MAP: Record<string, { color: string; label: string }> = {
  // JavaScript/TypeScript
  '.js': { color: 'text-yellow-500', label: 'JavaScript' },
  '.jsx': { color: 'text-yellow-500', label: 'JSX' },
  '.ts': { color: 'text-blue-500', label: 'TypeScript' },
  '.tsx': { color: 'text-blue-500', label: 'TSX' },
  '.mjs': { color: 'text-yellow-500', label: 'ES Module' },
  '.cjs': { color: 'text-yellow-500', label: 'CommonJS' },

  // Web
  '.html': { color: 'text-orange-500', label: 'HTML' },
  '.htm': { color: 'text-orange-500', label: 'HTML' },
  '.css': { color: 'text-blue-400', label: 'CSS' },
  '.scss': { color: 'text-pink-500', label: 'SCSS' },
  '.sass': { color: 'text-pink-500', label: 'Sass' },
  '.less': { color: 'text-indigo-500', label: 'Less' },

  // Config
  '.json': { color: 'text-yellow-600', label: 'JSON' },
  '.yaml': { color: 'text-red-400', label: 'YAML' },
  '.yml': { color: 'text-red-400', label: 'YAML' },
  '.toml': { color: 'text-gray-500', label: 'TOML' },
  '.xml': { color: 'text-orange-400', label: 'XML' },
  '.env': { color: 'text-green-600', label: 'Environment' },

  // Documentation
  '.md': { color: 'text-blue-300', label: 'Markdown' },
  '.mdx': { color: 'text-blue-300', label: 'MDX' },
  '.txt': { color: 'text-gray-500', label: 'Text' },
  '.rst': { color: 'text-gray-500', label: 'reStructuredText' },

  // Data
  '.csv': { color: 'text-green-500', label: 'CSV' },
  '.sql': { color: 'text-blue-600', label: 'SQL' },

  // Images
  '.png': { color: 'text-purple-500', label: 'PNG Image' },
  '.jpg': { color: 'text-purple-500', label: 'JPEG Image' },
  '.jpeg': { color: 'text-purple-500', label: 'JPEG Image' },
  '.gif': { color: 'text-purple-500', label: 'GIF Image' },
  '.svg': { color: 'text-orange-500', label: 'SVG Image' },
  '.webp': { color: 'text-purple-500', label: 'WebP Image' },
  '.ico': { color: 'text-purple-500', label: 'Icon' },

  // Other code
  '.py': { color: 'text-blue-400', label: 'Python' },
  '.rb': { color: 'text-red-500', label: 'Ruby' },
  '.go': { color: 'text-cyan-500', label: 'Go' },
  '.rs': { color: 'text-orange-600', label: 'Rust' },
  '.java': { color: 'text-red-600', label: 'Java' },
  '.c': { color: 'text-blue-600', label: 'C' },
  '.cpp': { color: 'text-blue-600', label: 'C++' },
  '.h': { color: 'text-purple-600', label: 'Header' },
  '.sh': { color: 'text-green-500', label: 'Shell' },
  '.bash': { color: 'text-green-500', label: 'Bash' },
  '.zsh': { color: 'text-green-500', label: 'Zsh' },

  // Package
  '.lock': { color: 'text-gray-600', label: 'Lock File' },
};

/**
 * Get file icon info based on filename
 */
function getFileIconInfo(filename: string): { color: string; label: string } {
  const lowerName = filename.toLowerCase();
  
  // Check for exact matches first (for special files)
  if (lowerName === 'package.json') {
    return { color: 'text-green-500', label: 'NPM Package' };
  }
  if (lowerName === 'tsconfig.json') {
    return { color: 'text-blue-500', label: 'TypeScript Config' };
  }
  if (lowerName === '.gitignore' || lowerName === '.gitattributes') {
    return { color: 'text-orange-600', label: 'Git Config' };
  }
  if (lowerName === 'dockerfile' || lowerName.endsWith('.dockerfile')) {
    return { color: 'text-blue-500', label: 'Dockerfile' };
  }
  if (lowerName === 'readme.md' || lowerName === 'readme') {
    return { color: 'text-blue-300', label: 'README' };
  }

  // Check by extension
  const ext = '.' + lowerName.split('.').pop();
  return FILE_ICON_MAP[ext] || { color: 'text-gray-500', label: 'File' };
}

interface IconProps {
  className?: string;
  'aria-hidden'?: boolean;
}

/**
 * Default file icon SVG
 */
export const FileIcon = memo(function FileIcon({ className = '', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 flex-shrink-0 ${className}`}
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  );
});

/**
 * Folder icon SVG (closed)
 */
export const FolderIcon = memo(function FolderIcon({ className = '', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 flex-shrink-0 ${className}`}
      {...props}
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
});

/**
 * Folder icon SVG (open)
 */
export const FolderOpenIcon = memo(function FolderOpenIcon({ className = '', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 flex-shrink-0 ${className}`}
      {...props}
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1" />
      <path d="M5 10v10h14V10H5z" />
    </svg>
  );
});

/**
 * Git repository icon
 */
export const GitRepoIcon = memo(function GitRepoIcon({ className = '', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 flex-shrink-0 text-orange-500 ${className}`}
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <line x1="3" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="21" y2="12" />
      <line x1="12" y1="3" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="21" />
    </svg>
  );
});

/**
 * Chevron right icon for expandable items
 */
export const ChevronRightIcon = memo(function ChevronRightIcon({ className = '', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3 w-3 flex-shrink-0 ${className}`}
      {...props}
    >
      <polyline points="9,18 15,12 9,6" />
    </svg>
  );
});

/**
 * Close icon for modal
 */
export const CloseIcon = memo(function CloseIcon({ className = '', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${className}`}
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
});

/**
 * Component that renders the appropriate icon for a file based on its name
 */
interface FileTypeIconProps {
  filename: string;
  className?: string;
}

export const FileTypeIcon = memo(function FileTypeIcon({ filename, className = '' }: FileTypeIconProps) {
  const { color } = getFileIconInfo(filename);
  
  return (
    <FileIcon 
      className={`${color} ${className}`}
      aria-hidden={true}
    />
  );
});
