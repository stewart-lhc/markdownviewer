import { describe, expect, it, vi } from "vitest";
import { resolveInitialWorkspaceDocument } from "@/lib/workspace/resolve-initial-document";

describe("resolveInitialWorkspaceDocument", () => {
  it("falls back to the starter sample when no source is provided", async () => {
    const result = await resolveInitialWorkspaceDocument({});

    expect(result.sourceInput).toBe("");
    expect(result.markdown).toMatch(/Starter Handbook/);
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
    expect(result.markdown).toMatch(/Starter Handbook/);
  });
});
