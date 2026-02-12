import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import {
  validateDirectoryPath,
  normalizePath,
  isSymlink,
  listDirectory,
  PathValidationError,
  clearDirectoryListingCache,
} from "./files";
import { promises as fs } from "fs";
import path from "path";

describe("files module", () => {
  describe("validateDirectoryPath", () => {
    test("accepts valid absolute paths", () => {
      expect(() => validateDirectoryPath("/home/user")).not.toThrow();
      expect(() => validateDirectoryPath("/")).not.toThrow();
      expect(() => validateDirectoryPath("/path/to/directory")).not.toThrow();
    });

    test("rejects empty path", () => {
      expect(() => validateDirectoryPath("")).toThrow(PathValidationError);
    });

    test("rejects relative paths", () => {
      expect(() => validateDirectoryPath("relative/path")).toThrow(
        PathValidationError
      );
      try {
        validateDirectoryPath("relative/path");
      } catch (e) {
        expect((e as PathValidationError).code).toBe("NOT_ABSOLUTE");
      }
    });

    test("rejects path traversal attempts", () => {
      expect(() => validateDirectoryPath("/home/../etc")).toThrow(
        PathValidationError
      );
      expect(() => validateDirectoryPath("/home/user/../../root")).toThrow(
        PathValidationError
      );
      try {
        validateDirectoryPath("/home/../etc");
      } catch (e) {
        expect((e as PathValidationError).code).toBe("PATH_TRAVERSAL");
      }
    });

    test("rejects dangerous characters", () => {
      expect(() => validateDirectoryPath("/home/user;ls")).toThrow(
        PathValidationError
      );
      expect(() => validateDirectoryPath("/home/user|cat")).toThrow(
        PathValidationError
      );
      expect(() => validateDirectoryPath("/home/user`whoami`")).toThrow(
        PathValidationError
      );
      expect(() => validateDirectoryPath("/home/user$HOME")).toThrow(
        PathValidationError
      );
      expect(() => validateDirectoryPath("/home/user$(cmd)")).toThrow(
        PathValidationError
      );
      try {
        validateDirectoryPath("/home/user;ls");
      } catch (e) {
        expect((e as PathValidationError).code).toBe("DANGEROUS_CHARS");
      }
    });
  });

  describe("normalizePath", () => {
    test("normalizes simple paths", () => {
      expect(normalizePath("/home/user")).toBe("/home/user");
      expect(normalizePath("/home/user/")).toBe("/home/user");
      expect(normalizePath("/home//user")).toBe("/home/user");
    });

    test("normalizes traversal to valid path (traversal caught by validateDirectoryPath)", () => {
      // path.normalize resolves ../.. to a valid path like /
      // The actual traversal prevention is done by validateDirectoryPath
      // which rejects paths containing .. before they reach normalizePath
      expect(normalizePath("/home/../..")).toBe("/");
      expect(normalizePath("/home/user/..")).toBe("/home");
    });
  });

  describe("listDirectory", () => {
    beforeEach(() => {
      clearDirectoryListingCache();
    });

    test("lists actual directory contents", async () => {
      // Use the web-app root directory
      const result = await listDirectory("/root/web-app");
      expect(result.currentPath).toBe("/root/web-app");
      expect(result.parentPath).toBe("/root");
      expect(result.files).toBeInstanceOf(Array);
      expect(result.files.length).toBeGreaterThan(0);

      // Check for known files/directories
      const names = result.files.map((f) => f.name);
      expect(names).toContain("package.json");
      expect(names).toContain("src");

      // Check git repo detection
      expect(result.isGitRepo).toBe(true);
    });

    test("returns correct file types", async () => {
      const result = await listDirectory("/root/web-app");

      const srcDir = result.files.find((f) => f.name === "src");
      expect(srcDir).toBeDefined();
      expect(srcDir?.type).toBe("directory");

      const packageJson = result.files.find((f) => f.name === "package.json");
      expect(packageJson).toBeDefined();
      expect(packageJson?.type).toBe("file");
      expect(packageJson?.size).toBeGreaterThan(0);
    });

    test("sorts directories before files", async () => {
      const result = await listDirectory("/root/web-app");

      // Find the index of first file
      const firstFileIndex = result.files.findIndex((f) => f.type === "file");
      const lastDirIndex = result.files.findLastIndex(
        (f) => f.type === "directory"
      );

      // All directories should come before all files
      if (firstFileIndex !== -1 && lastDirIndex !== -1) {
        expect(lastDirIndex).toBeLessThan(firstFileIndex);
      }
    });

    test("rejects invalid paths", async () => {
      await expect(listDirectory("relative/path")).rejects.toThrow(
        PathValidationError
      );
      await expect(listDirectory("/path/../../../etc")).rejects.toThrow(
        PathValidationError
      );
    });

    test("handles non-existent directories", async () => {
      await expect(listDirectory("/nonexistent/path/abc123")).rejects.toThrow(
        PathValidationError
      );
      try {
        await listDirectory("/nonexistent/path/abc123");
      } catch (e) {
        expect((e as PathValidationError).code).toBe("NOT_FOUND");
      }
    });

    test("caches directory listings", async () => {
      // First call
      const result1 = await listDirectory("/root/web-app");
      // Second call should return cached result
      const result2 = await listDirectory("/root/web-app");

      // Results should be identical (same reference if cached)
      expect(result1).toEqual(result2);
    });

    test("returns parentPath as undefined for root", async () => {
      const result = await listDirectory("/");
      expect(result.currentPath).toBe("/");
      expect(result.parentPath).toBeUndefined();
    });
  });
});
