import { describe, expect, it } from "vitest";
import { applyMarkdownAction } from "@/lib/workspace/editor-actions";

describe("applyMarkdownAction", () => {
  it("wraps the current selection with strong syntax", () => {
    const result = applyMarkdownAction("hello world", {
      action: "bold",
      selectionEnd: 5,
      selectionStart: 0
    });

    expect(result.markdown).toBe("**hello** world");
    expect(result.selectionStart).toBe(2);
    expect(result.selectionEnd).toBe(7);
  });

  it("prefixes the current line as a heading", () => {
    const result = applyMarkdownAction("plain line", {
      action: "heading",
      selectionEnd: 10,
      selectionStart: 0
    });

    expect(result.markdown).toBe("# plain line");
  });

  it("inserts a markdown table scaffold when no selection exists", () => {
    const result = applyMarkdownAction("", {
      action: "table",
      selectionEnd: 0,
      selectionStart: 0
    });

    expect(result.markdown).toContain("| Column | Value | Notes |");
    expect(result.markdown).toContain("| --- | --- | --- |");
  });
});
