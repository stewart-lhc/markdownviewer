import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("D:/GitHub/markdownviewer/components/landing/live-sample.tsx", "utf8");

describe("landing live sample bundle guard", () => {
  it("does not import the full Markdown renderer into the homepage sample", () => {
    expect(source).not.toMatch(/MarkdownRenderer/);
    expect(source).not.toMatch(/starterDocument/);
    expect(source).toContain("markdown-body markdown-body--compact");
  });
});
