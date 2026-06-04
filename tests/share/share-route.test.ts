import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/share/route";
import { getSharedDocument } from "@/lib/share/share-store";

describe("share route", () => {
  it("stores Markdown server-side and returns a short share id", async () => {
    const response = await POST(
      new Request("https://markdownviewer.run/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          markdown: "# Stored share\n\nThis content is not encoded into the URL."
        })
      })
    );

    expect(response.status).toBe(200);

    const payload = (await response.json()) as { id: string; title: string };

    expect(payload.id).toMatch(/^stored-share-[a-z0-9_-]+$/);
    expect(payload.id).not.toContain("md-");
    expect(payload.id.length).toBeLessThan(90);
    expect(payload.title).toBe("Stored share");

    const document = await getSharedDocument(payload.id);

    expect(document).toMatchObject({
      id: payload.id,
      source: "stored",
      title: "Stored share"
    });
    expect(document?.markdown).toContain("not encoded into the URL");
  });

  it("rejects empty share content", async () => {
    const response = await POST(
      new Request("https://markdownviewer.run/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ markdown: "   " })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Add Markdown content before creating a share link."
    });
  });
});
