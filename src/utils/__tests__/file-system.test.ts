import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { fileExists, findFilesByExtension, copyDirectory, moveDirectory } from '../file-system.js';

describe('fileSystem utilities', () => {
  let testDir: string;
  let tempDir: string;

  beforeEach(async () => {
    // Create a unique temporary directory for each test
    testDir = await fs.mkdtemp(path.join(tmpdir(), 'fs-test-'));
    tempDir = path.join(testDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('fileExists', () => {
    it('returns true for existing files', async () => {
      const testFile = path.join(tempDir, 'test.txt');
      await fs.writeFile(testFile, 'test content');

      const exists = await fileExists(testFile);
      expect(exists).toBe(true);
    });

    it('returns true for existing directories', async () => {
      const exists = await fileExists(tempDir);
      expect(exists).toBe(true);
    });

    it('returns false for non-existing files', async () => {
      const nonExistent = path.join(tempDir, 'nonexistent.txt');
      const exists = await fileExists(nonExistent);
      expect(exists).toBe(false);
    });

    it('returns false for non-existing directories', async () => {
      const nonExistent = path.join(tempDir, 'nonexistent');
      const exists = await fileExists(nonExistent);
      expect(exists).toBe(false);
    });

    it('handles empty paths gracefully', async () => {
      const exists = await fileExists('');
      expect(exists).toBe(false);
    });
  });

  describe('findFilesByExtension', () => {
    beforeEach(async () => {
      // Create test directory structure
      await fs.mkdir(path.join(tempDir, 'subdir'), { recursive: true });
      await fs.mkdir(path.join(tempDir, 'subdir', 'nested'), { recursive: true });

      // Create test files
      await fs.writeFile(path.join(tempDir, 'test.java'), 'public class Test {}');
      await fs.writeFile(path.join(tempDir, 'config.properties'), 'key=value');
      await fs.writeFile(path.join(tempDir, 'readme.md'), '# README');
      await fs.writeFile(path.join(tempDir, 'script.sh'), '#!/bin/bash');

      await fs.writeFile(path.join(tempDir, 'subdir', 'SubClass.java'), 'public class SubClass {}');
      await fs.writeFile(path.join(tempDir, 'subdir', 'nested', 'DeepClass.java'), 'public class DeepClass {}');
      await fs.writeFile(path.join(tempDir, 'subdir', 'build.gradle'), 'plugins { }');
    });

    it('finds files by single extension', async () => {
      const javaFiles = await findFilesByExtension(tempDir, '.java');
      expect(javaFiles).toHaveLength(3);
      expect(javaFiles.every(file => file.endsWith('.java'))).toBe(true);
    });

    it('finds files by multiple extensions', async () => {
      const files = await findFilesByExtension(tempDir, ['.java', '.md']);
      expect(files).toHaveLength(4); // 3 java files + 1 md file
    });

    it('returns empty array for non-existent directory', async () => {
      const files = await findFilesByExtension(path.join(tempDir, 'nonexistent'), '.java');
      expect(files).toHaveLength(0);
    });

    it('returns empty array when no files match extension', async () => {
      const files = await findFilesByExtension(tempDir, '.nonexistent');
      expect(files).toHaveLength(0);
    });

    it('handles extension without dot correctly', async () => {
      const files = await findFilesByExtension(tempDir, 'java');
      expect(files).toHaveLength(3);
    });

    it('returns absolute paths', async () => {
      const files = await findFilesByExtension(tempDir, '.java');
      files.forEach(file => {
        expect(path.isAbsolute(file)).toBe(true);
      });
    });
  });

  describe('copyDirectory', () => {
    beforeEach(async () => {
      // Create source directory structure
      const srcDir = path.join(tempDir, 'src');
      await fs.mkdir(path.join(srcDir, 'subdir'), { recursive: true });

      // Create test files
      await fs.writeFile(path.join(srcDir, 'file1.txt'), 'content1');
      await fs.writeFile(path.join(srcDir, 'file2.txt'), 'content2');
      await fs.writeFile(path.join(srcDir, 'subdir', 'file3.txt'), 'content3');
    });

    it('copies directory with all files and subdirectories', async () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'dest');

      await copyDirectory(srcDir, destDir);

      // Verify destination exists and has same structure
      expect(await fileExists(destDir)).toBe(true);
      expect(await fileExists(path.join(destDir, 'file1.txt'))).toBe(true);
      expect(await fileExists(path.join(destDir, 'file2.txt'))).toBe(true);
      expect(await fileExists(path.join(destDir, 'subdir', 'file3.txt'))).toBe(true);

      // Verify content is identical
      const srcContent = await fs.readFile(path.join(srcDir, 'file1.txt'), 'utf8');
      const destContent = await fs.readFile(path.join(destDir, 'file1.txt'), 'utf8');
      expect(srcContent).toBe(destContent);
    });

    it('creates destination parent directories if they do not exist', async () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'nonexistent', 'parent', 'dest');

      await copyDirectory(srcDir, destDir);

      expect(await fileExists(destDir)).toBe(true);
    });

    it('handles empty directories correctly', async () => {
      const srcDir = path.join(tempDir, 'empty');
      await fs.mkdir(srcDir);
      const destDir = path.join(tempDir, 'empty-copy');

      await copyDirectory(srcDir, destDir);

      expect(await fileExists(destDir)).toBe(true);
    });

    it('throws error for non-existent source directory', async () => {
      const srcDir = path.join(tempDir, 'nonexistent');
      const destDir = path.join(tempDir, 'dest');

      await expect(copyDirectory(srcDir, destDir)).rejects.toThrow();
    });
  });

  describe('moveDirectory', () => {
    beforeEach(async () => {
      // Create source directory structure
      const srcDir = path.join(tempDir, 'src');
      await fs.mkdir(path.join(srcDir, 'subdir'), { recursive: true });

      // Create test files
      await fs.writeFile(path.join(srcDir, 'file1.txt'), 'content1');
      await fs.writeFile(path.join(srcDir, 'file2.txt'), 'content2');
      await fs.writeFile(path.join(srcDir, 'subdir', 'file3.txt'), 'content3');
    });

    it('moves directory to new location', async () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'dest');

      await moveDirectory(srcDir, destDir);

      // Verify source no longer exists
      expect(await fileExists(srcDir)).toBe(false);

      // Verify destination exists with all content
      expect(await fileExists(destDir)).toBe(true);
      expect(await fileExists(path.join(destDir, 'file1.txt'))).toBe(true);
      expect(await fileExists(path.join(destDir, 'file2.txt'))).toBe(true);
      expect(await fileExists(path.join(destDir, 'subdir', 'file3.txt'))).toBe(true);
    });

    it('creates destination parent directories if they do not exist', async () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'nonexistent', 'parent', 'dest');

      await moveDirectory(srcDir, destDir);

      expect(await fileExists(destDir)).toBe(true);
      expect(await fileExists(srcDir)).toBe(false);
    });

    it('handles empty directories correctly', async () => {
      const srcDir = path.join(tempDir, 'empty');
      await fs.mkdir(srcDir);
      const destDir = path.join(tempDir, 'empty-moved');

      await moveDirectory(srcDir, destDir);

      expect(await fileExists(destDir)).toBe(true);
      expect(await fileExists(srcDir)).toBe(false);
    });

    it('throws error for non-existent source directory', async () => {
      const srcDir = path.join(tempDir, 'nonexistent');
      const destDir = path.join(tempDir, 'dest');

      await expect(moveDirectory(srcDir, destDir)).rejects.toThrow();
    });

    it('moves to same directory structure (rename)', async () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'src-renamed');

      await moveDirectory(srcDir, destDir);

      expect(await fileExists(destDir)).toBe(true);
      expect(await fileExists(srcDir)).toBe(false);
    });
  });
});