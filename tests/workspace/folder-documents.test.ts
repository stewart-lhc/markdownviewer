import { describe, expect, it, vi } from "vitest";
import {
  createUntitledMarkdownDocument,
  getNextUntitledMarkdownPath,
  hashMarkdown,
  readFolderDocument,
  writeFolderDocument
} from "@/lib/workspace/folder-documents";
import type { FolderFileEntry } from "@/lib/workspace/folder-scan";

function createWritableHandle(name: string, initialContent = "# Initial") {
  let content = initialContent;
  let lastModified = 100;
  const writable = {
    close: vi.fn(async () => {
      lastModified += 1;
    }),
    write: vi.fn(async (nextContent: string) => {
      content = nextContent;
    })
  };
  const handle = {
    createWritable: vi.fn().mockResolvedValue(writable),
    getFile: vi.fn(async () => new File([content], name, { lastModified })),
    kind: "file",
    name
  } as unknown as FileSystemFileHandle;

  return { handle, writable };
}

describe("folder documents", () => {
  it("reads and writes Markdown through a file handle", async () => {
    const { handle, writable } = createWritableHandle("README.md");

    await expect(readFolderDocument(handle)).resolves.toMatchObject({
      markdown: "# Initial"
    });

    await expect(writeFolderDocument(handle, "# Updated")).resolves.toMatchObject({
      markdown: "# Updated"
    });
    expect(writable.write).toHaveBeenCalledWith("# Updated");
    expect(writable.close).toHaveBeenCalled();
  });

  it("hashes Markdown deterministically", () => {
    expect(hashMarkdown("# Title")).toBe(hashMarkdown("# Title"));
    expect(hashMarkdown("# Title\r\n")).toBe(hashMarkdown("# Title\n\n"));
    expect(hashMarkdown("# Title")).not.toBe(hashMarkdown("# Other"));
  });

  it("chooses an untitled filename without clobbering siblings", () => {
    const files = [
      { name: "Untitled.md", path: "/docs/Untitled.md" },
      { name: "Untitled 2.md", path: "/docs/Untitled 2.md" },
      { name: "Untitled.md", path: "/Untitled.md" }
    ] as FolderFileEntry[];

    expect(getNextUntitledMarkdownPath(files, "/docs")).toBe("/docs/Untitled 3.md");
    expect(getNextUntitledMarkdownPath(files, "/")).toBe("/Untitled 2.md");
  });

  it("creates an untitled Markdown file in the requested directory", async () => {
    const { handle } = createWritableHandle("Untitled.md", "");
    const childDirectory = {
      getFileHandle: vi.fn().mockResolvedValue(handle)
    };
    const root = {
      getDirectoryHandle: vi.fn().mockResolvedValue(childDirectory),
      getFileHandle: vi.fn()
    } as unknown as FileSystemDirectoryHandle;

    const result = await createUntitledMarkdownDocument(root, [], "/docs");

    expect(root.getDirectoryHandle).toHaveBeenCalledWith("docs", { create: true });
    expect(childDirectory.getFileHandle).toHaveBeenCalledWith("Untitled.md", { create: true });
    expect(result).toMatchObject({
      markdown: "# Untitled",
      name: "Untitled.md",
      path: "/docs/Untitled.md"
    });
  });
});
