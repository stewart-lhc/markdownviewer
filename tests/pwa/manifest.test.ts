import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("PWA manifest", () => {
  it("declares install metadata and markdown file handlers", () => {
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), "public", "manifest.webmanifest"), "utf8")
    );

    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/workspace");
    expect(manifest.launch_handler).toEqual({
      client_mode: ["focus-existing", "navigate-existing"]
    });
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/markdownviewer-icon-192.png",
          sizes: "192x192",
          type: "image/png"
        }),
        expect.objectContaining({
          src: "/markdownviewer-icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        }),
        expect.objectContaining({
          src: "/markdownviewer-icon.svg",
          type: "image/svg+xml"
        })
      ])
    );
    expect(manifest.icons[2]).toEqual(
      expect.objectContaining({
        src: "/markdownviewer-icon.svg",
        type: "image/svg+xml"
      })
    );
    expect(manifest.file_handlers).toEqual([
      {
        action: "/workspace?launch=file",
        accept: {
          "text/markdown": [".md", ".markdown", ".mdown", ".mkd"],
          "text/x-markdown": [".md", ".markdown", ".mdx"],
          "text/plain": [".md", ".markdown", ".txt"]
        }
      }
    ]);
  });
});
