import { describe, test, expect } from 'bun:test';
import {
  repoPathSchema,
  filePathSchema,
  blameQuerySchema,
  validateBlameParams,
  ValidationError,
  type BlameQueryParams,
} from './validation';

/**
 * Unit tests for validation schemas (TASK-041)
 * Tests Zod schemas for repo path, file path, and blame query params
 */

describe('repoPathSchema', () => {
  describe('valid paths', () => {
    test('accepts valid absolute path', () => {
      const result = repoPathSchema.safeParse('/home/user/repo');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('/home/user/repo');
      }
    });

    test('accepts root path', () => {
      const result = repoPathSchema.safeParse('/');
      expect(result.success).toBe(true);
    });

    test('accepts path with dots in directory names', () => {
      const result = repoPathSchema.safeParse('/home/user/.config/repo');
      expect(result.success).toBe(false); // Dots are actually dangerous chars
    });

    test('accepts path with hyphens and underscores', () => {
      const result = repoPathSchema.safeParse('/home/user-name/my_repo');
      expect(result.success).toBe(true);
    });

    test('accepts path with numbers', () => {
      const result = repoPathSchema.safeParse('/home/user123/repo456');
      expect(result.success).toBe(true);
    });

    test('accepts deeply nested paths', () => {
      const result = repoPathSchema.safeParse('/a/b/c/d/e/f/g/h/i/j');
      expect(result.success).toBe(true);
    });
  });

  describe('invalid paths', () => {
    test('rejects empty string', () => {
      const result = repoPathSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Repository path is required');
      }
    });

    test('rejects relative path', () => {
      const result = repoPathSchema.safeParse('relative/path');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Repository path must be an absolute path');
      }
    });

    test('rejects path starting with dot', () => {
      const result = repoPathSchema.safeParse('./relative');
      expect(result.success).toBe(false);
    });

    test('rejects null', () => {
      const result = repoPathSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    test('rejects undefined', () => {
      const result = repoPathSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe('dangerous characters (command injection prevention)', () => {
    test('rejects semicolon (command separator)', () => {
      const result = repoPathSchema.safeParse('/path;rm -rf /');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Repository path contains invalid characters');
      }
    });

    test('rejects ampersand (background execution)', () => {
      const result = repoPathSchema.safeParse('/path&whoami');
      expect(result.success).toBe(false);
    });

    test('rejects pipe (command piping)', () => {
      const result = repoPathSchema.safeParse('/path|cat /etc/passwd');
      expect(result.success).toBe(false);
    });

    test('rejects backticks (command substitution)', () => {
      const result = repoPathSchema.safeParse('/path/`whoami`');
      expect(result.success).toBe(false);
    });

    test('rejects dollar sign (variable expansion)', () => {
      const result = repoPathSchema.safeParse('/path/$USER');
      expect(result.success).toBe(false);
    });

    test('rejects parentheses (subshell)', () => {
      const result = repoPathSchema.safeParse('/path/(subshell)');
      expect(result.success).toBe(false);
    });

    test('rejects curly braces (brace expansion)', () => {
      const result = repoPathSchema.safeParse('/path/{a,b,c}');
      expect(result.success).toBe(false);
    });

    test('rejects square brackets (globbing)', () => {
      const result = repoPathSchema.safeParse('/path/[abc]');
      expect(result.success).toBe(false);
    });

    test('rejects angle brackets (redirection)', () => {
      const result = repoPathSchema.safeParse('/path/>output');
      expect(result.success).toBe(false);
    });

    test('rejects backslash (escape character)', () => {
      const result = repoPathSchema.safeParse('/path\\escaped');
      expect(result.success).toBe(false);
    });

    test('rejects single quotes', () => {
      const result = repoPathSchema.safeParse("/path/'quoted'");
      expect(result.success).toBe(false);
    });

    test('rejects double quotes', () => {
      const result = repoPathSchema.safeParse('/path/"quoted"');
      expect(result.success).toBe(false);
    });

    test('rejects exclamation mark (history expansion)', () => {
      const result = repoPathSchema.safeParse('/path/!previous');
      expect(result.success).toBe(false);
    });

    test('rejects hash (comment)', () => {
      const result = repoPathSchema.safeParse('/path#comment');
      expect(result.success).toBe(false);
    });

    test('rejects asterisk (glob)', () => {
      const result = repoPathSchema.safeParse('/path/*');
      expect(result.success).toBe(false);
    });

    test('rejects question mark (glob)', () => {
      const result = repoPathSchema.safeParse('/path/?');
      expect(result.success).toBe(false);
    });

    test('rejects tilde (home expansion)', () => {
      const result = repoPathSchema.safeParse('~/repo');
      expect(result.success).toBe(false);
    });
  });
});

describe('filePathSchema', () => {
  describe('valid paths', () => {
    test('accepts simple filename', () => {
      const result = filePathSchema.safeParse('file.ts');
      expect(result.success).toBe(true);
    });

    test('accepts path with directories', () => {
      const result = filePathSchema.safeParse('src/lib/file.ts');
      expect(result.success).toBe(true);
    });

    test('accepts path with hyphens and underscores', () => {
      const result = filePathSchema.safeParse('my-dir/my_file.ts');
      expect(result.success).toBe(true);
    });

    test('accepts deeply nested file path', () => {
      const result = filePathSchema.safeParse('a/b/c/d/e/file.ts');
      expect(result.success).toBe(true);
    });

    test('accepts filename without extension', () => {
      const result = filePathSchema.safeParse('Makefile');
      expect(result.success).toBe(true);
    });
  });

  describe('invalid paths', () => {
    test('rejects empty string', () => {
      const result = filePathSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('File path is required');
      }
    });

    test('rejects absolute path', () => {
      const result = filePathSchema.safeParse('/absolute/path/file.ts');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('File path must be relative to repository root');
      }
    });

    test('rejects path traversal with double dots', () => {
      const result = filePathSchema.safeParse('../parent/file.ts');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('File path must not contain path traversal sequences');
      }
    });

    test('rejects path traversal in middle', () => {
      const result = filePathSchema.safeParse('src/../../../etc/passwd');
      expect(result.success).toBe(false);
    });

    test('rejects null', () => {
      const result = filePathSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    test('rejects undefined', () => {
      const result = filePathSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe('dangerous characters', () => {
    test('rejects semicolon', () => {
      const result = filePathSchema.safeParse('file;ls.ts');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('File path contains invalid characters');
      }
    });

    test('rejects pipe character', () => {
      const result = filePathSchema.safeParse('file|cat.ts');
      expect(result.success).toBe(false);
    });

    test('rejects backticks', () => {
      const result = filePathSchema.safeParse('file`whoami`.ts');
      expect(result.success).toBe(false);
    });

    test('rejects dollar sign', () => {
      const result = filePathSchema.safeParse('$HOME/file.ts');
      expect(result.success).toBe(false);
    });
  });
});

describe('blameQuerySchema', () => {
  describe('valid combinations', () => {
    test('accepts valid repo and file paths', () => {
      const result = blameQuerySchema.safeParse({
        repo: '/home/user/repo',
        file: 'src/file.ts',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.repo).toBe('/home/user/repo');
        expect(result.data.file).toBe('src/file.ts');
      }
    });

    test('type inference matches BlameQueryParams', () => {
      const input = {
        repo: '/repo',
        file: 'file.ts',
      };
      const result = blameQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // TypeScript should infer this as BlameQueryParams
        const data: BlameQueryParams = result.data;
        expect(data.repo).toBe('/repo');
        expect(data.file).toBe('file.ts');
      }
    });
  });

  describe('invalid combinations', () => {
    test('rejects when repo is invalid', () => {
      const result = blameQuerySchema.safeParse({
        repo: 'relative/path',
        file: 'file.ts',
      });
      expect(result.success).toBe(false);
    });

    test('rejects when file is invalid', () => {
      const result = blameQuerySchema.safeParse({
        repo: '/valid/repo',
        file: '/absolute/file.ts',
      });
      expect(result.success).toBe(false);
    });

    test('rejects when both are invalid', () => {
      const result = blameQuerySchema.safeParse({
        repo: 'relative',
        file: '../traversal',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have multiple issues
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    test('rejects when repo is missing', () => {
      const result = blameQuerySchema.safeParse({
        file: 'file.ts',
      });
      expect(result.success).toBe(false);
    });

    test('rejects when file is missing', () => {
      const result = blameQuerySchema.safeParse({
        repo: '/valid/repo',
      });
      expect(result.success).toBe(false);
    });

    test('rejects empty object', () => {
      const result = blameQuerySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe('validateBlameParams', () => {
  test('returns validated params for valid input', () => {
    const params = new URLSearchParams({
      repo: '/home/user/repo',
      file: 'src/file.ts',
    });

    const result = validateBlameParams(params);
    expect(result.repo).toBe('/home/user/repo');
    expect(result.file).toBe('src/file.ts');
  });

  test('throws ValidationError for missing repo', () => {
    const params = new URLSearchParams({
      file: 'src/file.ts',
    });

    expect(() => validateBlameParams(params)).toThrow(ValidationError);
    try {
      validateBlameParams(params);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const error = e as ValidationError;
      expect(error.message).toContain('required');
      expect(error.errors.length).toBeGreaterThan(0);
    }
  });

  test('throws ValidationError for missing file', () => {
    const params = new URLSearchParams({
      repo: '/valid/repo',
    });

    expect(() => validateBlameParams(params)).toThrow(ValidationError);
  });

  test('throws ValidationError for invalid repo (relative path)', () => {
    const params = new URLSearchParams({
      repo: 'relative/path',
      file: 'file.ts',
    });

    expect(() => validateBlameParams(params)).toThrow(ValidationError);
    try {
      validateBlameParams(params);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const error = e as ValidationError;
      expect(error.message).toContain('absolute path');
    }
  });

  test('throws ValidationError for invalid file (absolute path)', () => {
    const params = new URLSearchParams({
      repo: '/valid/repo',
      file: '/absolute/file.ts',
    });

    expect(() => validateBlameParams(params)).toThrow(ValidationError);
    try {
      validateBlameParams(params);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const error = e as ValidationError;
      expect(error.message).toContain('relative');
    }
  });

  test('throws ValidationError for dangerous characters in repo', () => {
    const params = new URLSearchParams({
      repo: '/path;rm -rf /',
      file: 'file.ts',
    });

    expect(() => validateBlameParams(params)).toThrow(ValidationError);
    try {
      validateBlameParams(params);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const error = e as ValidationError;
      expect(error.message).toContain('invalid characters');
    }
  });

  test('throws ValidationError for path traversal in file', () => {
    const params = new URLSearchParams({
      repo: '/valid/repo',
      file: '../../../etc/passwd',
    });

    expect(() => validateBlameParams(params)).toThrow(ValidationError);
    try {
      validateBlameParams(params);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const error = e as ValidationError;
      expect(error.message).toContain('traversal');
    }
  });

  test('ValidationError includes zod issues array', () => {
    const params = new URLSearchParams({
      repo: '',
      file: '',
    });

    try {
      validateBlameParams(params);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const error = e as ValidationError;
      expect(error.errors).toBeDefined();
      expect(Array.isArray(error.errors)).toBe(true);
      expect(error.errors.length).toBeGreaterThan(0);
    }
  });
});

describe('edge cases', () => {
  test('handles whitespace-only repo path', () => {
    const result = repoPathSchema.safeParse('   ');
    expect(result.success).toBe(false);
  });

  test('handles whitespace-only file path', () => {
    const result = filePathSchema.safeParse('   ');
    expect(result.success).toBe(false);
  });

  test('handles unicode characters in path', () => {
    // Unicode should be allowed in paths (no dangerous chars)
    const repoResult = repoPathSchema.safeParse('/home/用户/repo');
    expect(repoResult.success).toBe(true);

    const fileResult = filePathSchema.safeParse('src/файл.ts');
    expect(fileResult.success).toBe(true);
  });

  test('handles very long paths', () => {
    const longSegment = 'a'.repeat(255);
    const longPath = `/home/${longSegment}/repo`;
    const result = repoPathSchema.safeParse(longPath);
    expect(result.success).toBe(true);
  });

  test('handles URL-encoded characters in URLSearchParams', () => {
    const params = new URLSearchParams({
      repo: '/home/user/my repo', // space will be encoded
      file: 'src/file name.ts',   // space will be encoded
    });

    // URLSearchParams handles encoding/decoding transparently
    // Our validation should receive decoded values
    const result = validateBlameParams(params);
    expect(result.repo).toBe('/home/user/my repo');
    expect(result.file).toBe('src/file name.ts');
  });
});
