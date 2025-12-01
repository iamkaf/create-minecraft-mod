import { promises as fs } from 'fs';
import path from 'path';

/**
 * Check if a file or directory exists
 * Consolidates 9+ instances of fs.access().then().catch() pattern
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return fs.access(filePath).then(() => true).catch(() => false);
}

/**
 * Find files by extension(s) in a directory recursively
 * Consolidates 4+ duplicate file finding implementations
 */
export async function findFilesByExtension(
  dir: string,
  extensions: string | string[]
): Promise<string[]> {
  const extensionArray = Array.isArray(extensions) ? extensions : [extensions];
  const files: string[] = [];

  async function search(currentDir: string): Promise<void> {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await search(fullPath);
        } else if (extensionArray.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read, just skip it
      // This makes the function more robust and matches the expected behavior
    }
  }

  await search(dir);
  return files;
}

/**
 * Copy directory contents recursively
 * Consolidates 2 identical implementations from core.ts and pipeline.ts
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Move directory with fallback to copy+delete
 * Implements complex rename → copy + delete fallback logic
 */
export async function moveDirectory(src: string, dest: string): Promise<void> {
  // Ensure destination parent exists
  await fs.mkdir(path.dirname(dest), { recursive: true });

  try {
    // Try direct rename first (fastest)
    await fs.rename(src, dest);
  } catch (renameError) {
    // Fallback to copy + delete for cross-device moves
    try {
      await fs.cp(src, dest, { recursive: true });
      await fs.rm(src, { recursive: true });
    } catch (copyError) {
      throw new Error(`Failed to move directory: ${copyError instanceof Error ? copyError.message : String(copyError)}`);
    }
  }
}