import { maxImportedMarkdownCharacters } from "@/lib/workspace/load-markdown-source";
import { getFolderPathDirectory, joinFolderPath } from "@/lib/workspace/folder-paths";
import type { FolderFileEntry } from "@/lib/workspace/folder-scan";

export type FolderDocument = {
  lastModified: number;
  markdown: string;
};

function readFileText(file: File) {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the selected Markdown file."));
    reader.readAsText(file);
  });
}

export async function readFolderDocument(handle: FileSystemFileHandle): Promise<FolderDocument> {
  const file = await handle.getFile();
  const markdown = await readFileText(file);

  if (markdown.length > maxImportedMarkdownCharacters) {
    throw new Error("The requested Markdown file is too large to open.");
  }

  return {
    lastModified: file.lastModified,
    markdown
  };
}

export async function writeFolderDocument(handle: FileSystemFileHandle, markdown: string) {
  if (markdown.length > maxImportedMarkdownCharacters) {
    throw new Error("The current Markdown file is too large to save.");
  }

  const writable = await handle.createWritable();
  await writable.write(markdown);
  await writable.close();
  return readFolderDocument(handle);
}

export function hashMarkdown(markdown: string) {
  const normalizedMarkdown = markdown.replace(/\r\n?/g, "\n").replace(/\n+$/, "");
  let hash = 5381;

  for (let index = 0; index < normalizedMarkdown.length; index += 1) {
    hash = (hash * 33) ^ normalizedMarkdown.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function getExistingNames(files: FolderFileEntry[], directoryPath: string) {
  const names = new Set<string>();

  files.forEach((file) => {
    if (getFolderPathDirectory(file.path) === directoryPath) {
      names.add(file.name.toLowerCase());
    }
  });

  return names;
}

export function getNextUntitledMarkdownPath(files: FolderFileEntry[], directoryPath = "/") {
  const existingNames = getExistingNames(files, directoryPath);
  let candidateName = "Untitled.md";
  let index = 2;

  while (existingNames.has(candidateName.toLowerCase())) {
    candidateName = `Untitled ${index}.md`;
    index += 1;
  }

  return joinFolderPath(directoryPath, candidateName) ?? "/Untitled.md";
}

export async function createUntitledMarkdownDocument(
  root: FileSystemDirectoryHandle,
  files: FolderFileEntry[],
  directoryPath = "/"
): Promise<FolderFileEntry & { markdown: string }> {
  const path = getNextUntitledMarkdownPath(files, directoryPath);
  const parts = path.split("/").filter(Boolean);
  const filename = parts.pop() ?? "Untitled.md";
  let directory = root;

  for (const part of parts) {
    directory = await directory.getDirectoryHandle(part, { create: true });
  }

  const handle = await directory.getFileHandle(filename, { create: true });
  const markdown = "# Untitled";
  const document = await writeFolderDocument(handle, markdown);

  return {
    handle,
    lastModified: document.lastModified,
    markdown,
    name: filename,
    path
  };
}
