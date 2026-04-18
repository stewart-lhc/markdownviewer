import {
  detectSourceType,
  normalizeSourceInput
} from "@/lib/workspace/source-parser";

describe("source parser", () => {
  it("detects supported Markdown sources", () => {
    expect(detectSourceType("https://github.com/acme/repo/blob/main/README.md")).toBe(
      "github"
    );
    expect(detectSourceType("https://gist.github.com/alex/123456")).toBe("gist");
    expect(detectSourceType("https://example.com/docs/guide.md")).toBe("remote");
    expect(detectSourceType("# Title\n\nHello")).toBe("markdown");
  });

  it("normalizes GitHub blob URLs to raw URLs", () => {
    expect(
      normalizeSourceInput("https://github.com/acme/repo/blob/main/README.md")
    ).toMatchObject({
      type: "github",
      resolvedUrl: "https://raw.githubusercontent.com/acme/repo/main/README.md"
    });
  });
});
