import { beforeEach, describe, expect, it, vi } from "vitest";

const neonMocks = vi.hoisted(() => ({
  calls: [] as string[],
  existingStatus: "verified" as string | null,
  sql: vi.fn(async (strings: TemplateStringsArray) => {
    const statement = strings.join("?");
    neonMocks.calls.push(statement);

    if (statement.includes("SELECT status")) {
      return neonMocks.existingStatus ? [{ status: neonMocks.existingStatus }] : [];
    }

    return [];
  })
}));

vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => neonMocks.sql)
}));

describe("waitlist store", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    neonMocks.calls = [];
    neonMocks.existingStatus = "verified";
    neonMocks.sql.mockClear();
    vi.stubEnv("DATABASE_URL", "postgresql://waitlist-test");
    vi.stubEnv("POSTGRES_URL", "");
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "");
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "");
    vi.stubEnv("CLOUDFLARE_D1_DATABASE_ID", "");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("does not resend or reset a verified duplicate subscriber", async () => {
    const { addWaitlistSubscriber } = await import("@/lib/waitlist/waitlist-store");

    const result = await addWaitlistSubscriber({
      baseUrl: "https://markdownviewer.run",
      email: " Reader@Example.com ",
      interest: "share_pro"
    });

    expect(result).toEqual({
      email: "reader@example.com",
      emailSent: false,
      status: "verified",
      storage: "postgres"
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(neonMocks.calls.some((statement) => statement.includes("ON CONFLICT"))).toBe(false);
  });
});
