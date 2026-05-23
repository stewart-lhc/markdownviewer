import { describe, expect, it } from "vitest";
import {
  createMarkdownShare,
  decodeMarkdownShare,
  encodeMarkdownShare,
  maxEncodedMarkdownShareLength
} from "@/lib/share/share-codec";

describe("share codec", () => {
  it("round-trips markdown into a share-safe id", () => {
    const markdown = "# Share me\n\nThis is a full document.";
    const encoded = encodeMarkdownShare(markdown);

    expect(encoded.startsWith("md-")).toBe(true);
    expect(decodeMarkdownShare(encoded)).toBe(markdown);
  });

  it("rejects documents that would create oversized share URLs", () => {
    const markdown = Array.from({ length: 5000 }, (_, index) => `${index} ${crypto.randomUUID()}`).join("\n");
    const encoded = encodeMarkdownShare(markdown);
    const result = createMarkdownShare(markdown);

    expect(encoded.length).toBeGreaterThan(maxEncodedMarkdownShareLength);
    expect(result).toMatchObject({
      ok: false,
      error: "This document is too large for link sharing. Export HTML or PDF instead."
    });
    expect(decodeMarkdownShare(encoded)).toBeNull();
  });
});
