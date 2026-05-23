import { describe, expect, it, vi } from "vitest";
import { resolveInitialWorkspaceDocument } from "@/lib/workspace/resolve-initial-document";

describe("resolveInitialWorkspaceDocument", () => {
  it("falls back to the starter sample when no source is provided", async () => {
    const result = await resolveInitialWorkspaceDocument({});

    expect(result.sourceInput).toBe("");
    expect(result.markdown).toMatch(/Markdown Feature Atlas/);
    expect(result.markdown).toMatch(/- \[x\] Paste markdown snippets/);
    expect(result.markdown).toMatch(/\| Syntax \| Example \| Status \|/);
    expect(result.markdown).toMatch(/```ts/);
    expect(result.markdown).toMatch(/```json/);
    expect(result.markdown).toMatch(/```python/);
    expect(result.markdown).toMatch(/```yaml/);
    expect(result.markdown).toMatch(/```mermaid/);
    expect(result.markdown).toMatch(/\$\$[\s\S]*\\int_0\^1 x\^2 dx[\s\S]*\$\$/);
    expect(result.markdown).toMatch(/!\[Workspace preview placeholder\]/);
    expect(result.markdown).toMatch(/<https:\/\/markdown\.live>/);
    expect(result.markdown).toMatch(/```html/);
    expect(result.markdown).toMatch(/\[\^1\]:/);
  });

  it("loads a remote source before rendering the workspace", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "# Loaded on the server"
    });

    const result = await resolveInitialWorkspaceDocument(
      {
        source: "https://github.com/acme/repo/blob/main/README.md"
      },
      fetcher
    );

    expect(result.sourceInput).toBe("https://github.com/acme/repo/blob/main/README.md");
    expect(result.markdown).toBe("# Loaded on the server");
  });

  it("surfaces preload failures without replacing the requested document with the starter sample", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false
    });

    const result = await resolveInitialWorkspaceDocument(
      {
        source: "https://example.com/missing.md"
      },
      fetcher
    );

    expect(result.sourceInput).toBe("https://example.com/missing.md");
    expect(result.markdown).toBe("");
    expect(result.statusMessage).toMatch(/failed to fetch/i);
  });

  it("loads a shared document when the workspace is opened from a public share page", async () => {
    const result = await resolveInitialWorkspaceDocument({
      share: "starter-doc"
    });

    expect(result.sourceInput).toBe("");
    expect(result.markdown).toMatch(/Markdown Feature Atlas/);
  });
});
