import { describe, expect, it } from "vitest";
import {
  getFolderPathDirectory,
  getFolderPathName,
  joinFolderPath,
  normalizeFolderPath,
  resolveMarkdownLink
} from "@/lib/workspace/folder-paths";

describe("folder paths", () => {
  it("normalizes folder paths and rejects traversal above the root", () => {
    expect(normalizeFolderPath("folder:/docs/../README.md")).toBe("/README.md");
    expect(normalizeFolderPath("\\docs\\guide.md")).toBe("/docs/guide.md");
    expect(normalizeFolderPath("../../secrets.md")).toBeNull();
  });

  it("joins paths from a normalized base directory", () => {
    expect(joinFolderPath("/docs/api", "../README.md")).toBe("/docs/README.md");
    expect(joinFolderPath("/", "README.md")).toBe("/README.md");
    expect(joinFolderPath("/docs", "../../../README.md")).toBeNull();
  });

  it("extracts directory and file names", () => {
    expect(getFolderPathDirectory("/docs/api/guide.md")).toBe("/docs/api");
    expect(getFolderPathDirectory("/README.md")).toBe("/");
    expect(getFolderPathName("/docs/api/guide.md")).toBe("guide.md");
  });

  it("resolves relative Markdown links with optional hashes", () => {
    expect(resolveMarkdownLink("/docs/api/current.md", "../guide.md#intro")).toEqual({
      hash: "intro",
      path: "/docs/guide.md"
    });
    expect(resolveMarkdownLink("/docs/api/current.md", "./details.mdx")).toEqual({
      hash: undefined,
      path: "/docs/api/details.mdx"
    });
  });

  it("ignores external, hash-only, and non-Markdown links", () => {
    expect(resolveMarkdownLink("/docs/current.md", "https://example.com/readme.md")).toBeNull();
    expect(resolveMarkdownLink("/docs/current.md", "#intro")).toBeNull();
    expect(resolveMarkdownLink("/docs/current.md", "./image.png")).toBeNull();
  });
});
