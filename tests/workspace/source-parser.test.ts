import {
  detectSourceType,
  isAllowedRemoteUrl,
  normalizeSourceInput
} from "@/lib/workspace/source-parser";

describe("source parser", () => {
  it("detects supported Markdown sources", () => {
    expect(detectSourceType("https://github.com/acme/repo/blob/main/README.md")).toBe(
      "github"
    );
    expect(detectSourceType("https://github.com/acme/repo/raw/main/docs/guide.mdx")).toBe(
      "github"
    );
    expect(detectSourceType("https://gist.github.com/alex/123456")).toBe("gist");
    expect(detectSourceType("https://example.com/docs/guide.md")).toBe("remote");
    expect(detectSourceType("https://example.com/docs/download?id=readme")).toBe("remote");
    expect(detectSourceType("# Title\n\nHello")).toBe("markdown");
  });

  it("normalizes GitHub blob and raw URLs", () => {
    expect(
      normalizeSourceInput("https://github.com/acme/repo/blob/main/docs/README.md?plain=1")
    ).toMatchObject({
      type: "github",
      resolvedUrl: "https://raw.githubusercontent.com/acme/repo/main/docs/README.md"
    });

    expect(
      normalizeSourceInput("https://github.com/acme/repo/raw/main/docs/guide.mdx")
    ).toMatchObject({
      type: "github",
      resolvedUrl: "https://github.com/acme/repo/raw/main/docs/guide.mdx"
    });
  });

  it("blocks local network imports from the server-side fetch path", () => {
    expect(isAllowedRemoteUrl("https://example.com/readme.md")).toBe(true);
    expect(isAllowedRemoteUrl("http://localhost/readme.md")).toBe(false);
    expect(isAllowedRemoteUrl("http://127.0.0.1/readme.md")).toBe(false);
    expect(isAllowedRemoteUrl("http://[::1]/readme.md")).toBe(false);
    expect(isAllowedRemoteUrl("http://[::ffff:127.0.0.1]/readme.md")).toBe(false);
    expect(isAllowedRemoteUrl("http://192.168.1.20/readme.md")).toBe(false);
  });
});
