import { describe, expect, it, vi } from "vitest";
import {
  loadMarkdownSource,
  loadMarkdownSourceViaApi
} from "@/lib/workspace/load-markdown-source";

describe("loadMarkdownSource", () => {
  it("loads markdown text from normalized GitHub blob URLs", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "# Remote README"
    });

    const result = await loadMarkdownSource(
      "https://github.com/acme/repo/blob/main/README.md",
      fetcher
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/acme/repo/main/README.md"
    );
    expect(result.markdown).toBe("# Remote README");
    expect(result.label).toBe("GitHub source");
  });

  it("loads gist content from the GitHub gist api", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        files: {
          "demo.md": {
            filename: "demo.md",
            content: "# Gist content"
          }
        }
      })
    });

    const result = await loadMarkdownSource("https://gist.github.com/alex/123456", fetcher);

    expect(fetcher).toHaveBeenCalledWith("https://api.github.com/gists/123456");
    expect(result.markdown).toBe("# Gist content");
    expect(result.label).toBe("Gist import");
  });

  it("loads remote sources through the same-origin import api in the browser path", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        markdown: "# Imported through API",
        label: "Remote source",
        resolvedUrl: "https://example.com/readme.md"
      })
    });

    const result = await loadMarkdownSourceViaApi("https://example.com/readme.md", fetcher);

    expect(fetcher).toHaveBeenCalledWith(
      "/api/import",
      expect.objectContaining({
        body: JSON.stringify({ source: "https://example.com/readme.md" }),
        method: "POST"
      })
    );
    expect(result.markdown).toBe("# Imported through API");
  });

  it("rejects private network urls before fetching", async () => {
    const fetcher = vi.fn();

    await expect(loadMarkdownSource("http://127.0.0.1/readme.md", fetcher)).rejects.toThrow(
      /public HTTP\(S\) Markdown URLs/
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
});
