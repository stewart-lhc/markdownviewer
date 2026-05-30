import { normalizeFolderPath } from "@/lib/workspace/folder-paths";

export type FolderFileEntry = {
  handle: FileSystemFileHandle;
  lastModified?: number;
  name: string;
  path: string;
};

export type FolderScanOptions = {
  maxDepth?: number;
  maxFiles?: number;
};

export type FolderScanResult = {
  files: FolderFileEntry[];
  partial: boolean;
  skippedCount: number;
};

const defaultMaxDepth = 8;
const defaultMaxFiles = 500;
const supportedMarkdownPattern = /\.(md|markdown|mdx|txt)$/i;
const ignoredDirectoryNames = new Set([".git", "node_modules", ".next", "dist", "build", "vendor"]);

function shouldIgnoreDirectory(name: string) {
  return name.startsWith(".") || ignoredDirectoryNames.has(name);
}

async function readDirectoryEntries(directory: FileSystemDirectoryHandle) {
  const entries: Array<FileSystemDirectoryHandle | FileSystemFileHandle> = [];

  if (typeof directory.values === "function") {
    for await (const entry of directory.values()) {
      entries.push(entry);
    }
  } else if (typeof directory.entries === "function") {
    for await (const [, entry] of directory.entries()) {
      entries.push(entry);
    }
  }

  return entries.sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === "directory" ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
}

async function getFileLastModified(handle: FileSystemFileHandle) {
  try {
    return (await handle.getFile()).lastModified;
  } catch {
    return undefined;
  }
}

export async function scanMarkdownFolder(
  root: FileSystemDirectoryHandle,
  options: FolderScanOptions = {}
): Promise<FolderScanResult> {
  const maxDepth = options.maxDepth ?? defaultMaxDepth;
  const maxFiles = options.maxFiles ?? defaultMaxFiles;
  const files: FolderFileEntry[] = [];
  let partial = false;
  let skippedCount = 0;

  async function scanDirectory(directory: FileSystemDirectoryHandle, parentPath: string, depth: number): Promise<void> {
    if (depth > maxDepth || files.length >= maxFiles) {
      partial = true;
      skippedCount += 1;
      return;
    }

    const entries = await readDirectoryEntries(directory);

    for (const entry of entries) {
      if (files.length >= maxFiles) {
        partial = true;
        skippedCount += 1;
        return;
      }

      if (entry.kind === "directory") {
        if (shouldIgnoreDirectory(entry.name)) {
          skippedCount += 1;
          continue;
        }

        const nextPath = normalizeFolderPath(`${parentPath}/${entry.name}`) ?? "/";
        await scanDirectory(entry, nextPath, depth + 1);
        continue;
      }

      if (!supportedMarkdownPattern.test(entry.name)) {
        skippedCount += 1;
        continue;
      }

      const path = normalizeFolderPath(`${parentPath}/${entry.name}`);

      if (!path) {
        skippedCount += 1;
        continue;
      }

      files.push({
        handle: entry,
        lastModified: await getFileLastModified(entry),
        name: entry.name,
        path
      });
    }
  }

  await scanDirectory(root, "/", 0);

  return {
    files,
    partial,
    skippedCount
  };
}
