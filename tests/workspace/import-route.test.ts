import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/import/route";

describe("import api route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches remote Markdown server-side and returns a normalized payload", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "text/markdown" }),
      text: async () => "# Server imported"
    });

    vi.stubGlobal("fetch", fetcher);

    const response = await POST(
      new Request("https://markdownviewer.run/api/import", {
        method: "POST",
        body: JSON.stringify({ source: "https://example.com/readme.md" })
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      label: "Remote source",
      markdown: "# Server imported",
      resolvedUrl: "https://example.com/readme.md"
    });
    expect(fetcher).toHaveBeenCalledWith("https://example.com/readme.md");
  });

  it("returns a clear error for blocked local imports", async () => {
    const fetcher = vi.fn();

    vi.stubGlobal("fetch", fetcher);

    const response = await POST(
      new Request("https://markdownviewer.run/api/import", {
        method: "POST",
        body: JSON.stringify({ source: "http://localhost/readme.md" })
      })
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      error: "Only public HTTP(S) Markdown URLs can be imported."
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
