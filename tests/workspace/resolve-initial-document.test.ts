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
    expect(result.markdown).toMatch(/\/sample-markdown-preview\.svg/);
    expect(result.markdown).not.toMatch(/hello@example\.com/);
    expect(result.markdown).not.toMatch(/placehold\.co/);
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

    expect(result.sourceInput).toBe("share:starter-doc:open");
    expect(result.markdown).toMatch(/Markdown Feature Atlas/);
    expect(result.statusMessage).toBe("Opened shared Markdown in the workspace.");
  });

  it("marks shared documents opened as editable copies", async () => {
    const result = await resolveInitialWorkspaceDocument({
      share: "starter-doc",
      shareAction: "copy"
    });

    expect(result.sourceInput).toBe("share:starter-doc:copy");
    expect(result.markdown).toMatch(/Markdown Feature Atlas/);
    expect(result.statusMessage).toBe("Opened an editable copy of this shared Markdown.");
  });

  it("marks shared documents opened as templates", async () => {
    const result = await resolveInitialWorkspaceDocument({
      share: "starter-doc",
      shareAction: "template"
    });

    expect(result.sourceInput).toBe("share:starter-doc:template");
    expect(result.markdown).toMatch(/Markdown Feature Atlas/);
    expect(result.statusMessage).toBe("Opened this shared Markdown as a template.");
  });

  it("falls back to open for unknown share actions", async () => {
    const result = await resolveInitialWorkspaceDocument({
      share: "starter-doc",
      shareAction: "overwrite"
    });

    expect(result.sourceInput).toBe("share:starter-doc:open");
    expect(result.markdown).toMatch(/Markdown Feature Atlas/);
  });

  it("does not mark a missing shared document as a source", async () => {
    const result = await resolveInitialWorkspaceDocument({
      share: "definitely-missing-share"
    });

    expect(result.sourceInput).toBe("");
    expect(result.markdown).toBe("");
    expect(result.statusMessage).toBe("Shared document not found.");
  });
});
