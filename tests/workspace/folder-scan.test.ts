import { describe, expect, it, vi } from "vitest";
import { scanMarkdownFolder } from "@/lib/workspace/folder-scan";

type FakeEntry = (FileSystemDirectoryHandle | FileSystemFileHandle) & {
  children?: FakeEntry[];
};

function createFileHandle(name: string, content = "# File"): FileSystemFileHandle {
  return {
    getFile: vi.fn().mockResolvedValue(new File([content], name, { lastModified: 123 })),
    kind: "file",
    name
  } as unknown as FileSystemFileHandle;
}

function createDirectoryHandle(name: string, children: FakeEntry[]): FileSystemDirectoryHandle {
  return {
    async *values() {
      for (const child of children) {
        yield child;
      }
    },
    children,
    kind: "directory",
    name
  } as unknown as FileSystemDirectoryHandle;
}

describe("folder scan", () => {
  it("scans supported Markdown files recursively and ignores heavy directories", async () => {
    const root = createDirectoryHandle("project", [
      createFileHandle("README.md"),
      createFileHandle("image.png"),
      createDirectoryHandle("docs", [createFileHandle("guide.mdx")]),
      createDirectoryHandle("node_modules", [createFileHandle("ignored.md")]),
      createDirectoryHandle(".git", [createFileHandle("config.md")])
    ]);

    const result = await scanMarkdownFolder(root);

    expect(result.files.map((file) => file.path)).toEqual(["/docs/guide.mdx", "/README.md"]);
    expect(result.partial).toBe(false);
    expect(result.skippedCount).toBe(3);
  });

  it("caps scans by file count", async () => {
    const root = createDirectoryHandle("project", [
      createFileHandle("a.md"),
      createFileHandle("b.md"),
      createFileHandle("c.md")
    ]);

    const result = await scanMarkdownFolder(root, { maxFiles: 2 });

    expect(result.files.map((file) => file.path)).toEqual(["/a.md", "/b.md"]);
    expect(result.partial).toBe(true);
    expect(result.skippedCount).toBe(1);
  });

  it("caps scans by depth", async () => {
    const root = createDirectoryHandle("project", [
      createDirectoryHandle("docs", [createDirectoryHandle("deep", [createFileHandle("guide.md")])])
    ]);

    const result = await scanMarkdownFolder(root, { maxDepth: 1 });

    expect(result.files).toEqual([]);
    expect(result.partial).toBe(true);
    expect(result.skippedCount).toBe(1);
  });
});
