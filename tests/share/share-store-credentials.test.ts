import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("share store credentials", () => {
  it("uses Vercel Blob when only the OIDC store id is configured", async () => {
    let storedPayload = "";
    const put = vi.fn(async (_pathname: string, body: string) => {
      storedPayload = body;
      return { url: "https://example.public.blob.vercel-storage.com/shares/test.json" };
    });
    const get = vi.fn(async () => ({
      statusCode: 200,
      stream: new Response(storedPayload).body
    }));

    vi.doMock("@vercel/blob", () => ({ get, put }));

    process.env.VERCEL = "1";
    process.env.BLOB_STORE_ID = "store_test";
    delete process.env.BLOB_READ_WRITE_TOKEN;

    const { createSharedDocument, getSharedDocument } = await import("@/lib/share/share-store");
    const created = await createSharedDocument("# OIDC share\n\nStored with store id.");
    const loaded = await getSharedDocument(created.id);

    expect(put).toHaveBeenCalledWith(
      `shares/${created.id}.json`,
      expect.any(String),
      expect.objectContaining({ access: "public" })
    );
    expect(get).toHaveBeenCalledWith(`shares/${created.id}.json`, { access: "public" });
    expect(loaded).toMatchObject({
      id: created.id,
      source: "stored",
      title: "OIDC share"
    });
  });
});
