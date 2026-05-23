import { describe, expect, it } from "vitest";
import { buildMarkdownHtmlDocument } from "@/lib/workspace/export-html";

describe("buildMarkdownHtmlDocument", () => {
  it("embeds the selected markdown html template styles", () => {
    const html = buildMarkdownHtmlDocument(
      '<div class="markdown-body"><h1>Demo</h1></div>',
      "Demo <Document>",
      "terminal"
    );

    expect(html).toContain("<title>Demo &lt;Document&gt;</title>");
    expect(html).toContain('data-template="terminal"');
    expect(html).toContain("--mv-accent: #35e7a5;");
    expect(html).toContain(".markdown-export-shell");
    expect(html).toContain('<div class="markdown-body"><h1>Demo</h1></div>');
  });
});
