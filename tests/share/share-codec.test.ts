import { describe, expect, it } from "vitest";
import { decodeMarkdownShare, encodeMarkdownShare } from "@/lib/share/share-codec";

describe("share codec", () => {
  it("round-trips markdown into a share-safe id", () => {
    const markdown = "# Share me\n\nThis is a full document.";
    const encoded = encodeMarkdownShare(markdown);

    expect(encoded.startsWith("md-")).toBe(true);
    expect(decodeMarkdownShare(encoded)).toBe(markdown);
  });
});
