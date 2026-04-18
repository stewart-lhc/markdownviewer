import { describe, expect, it, vi } from "vitest";
import { loadMarkdownSource } from "@/lib/workspace/load-markdown-source";

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
});
