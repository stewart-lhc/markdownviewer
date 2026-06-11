import { beforeEach, describe, expect, it, vi } from "vitest";

const waitlistMocks = vi.hoisted(() => ({
  addWaitlistSubscriber: vi.fn(),
  confirmWaitlistSubscriber: vi.fn()
}));

vi.mock("@/lib/waitlist/waitlist-store", () => ({
  addWaitlistSubscriber: waitlistMocks.addWaitlistSubscriber,
  confirmWaitlistSubscriber: waitlistMocks.confirmWaitlistSubscriber
}));

import { POST } from "@/app/api/waitlist/route";
import { GET as ConfirmWaitlist } from "@/app/api/waitlist/confirm/route";

describe("waitlist route", () => {
  beforeEach(() => {
    waitlistMocks.addWaitlistSubscriber.mockReset();
    waitlistMocks.confirmWaitlistSubscriber.mockReset();
  });

  it("stores a waitlist subscriber", async () => {
    waitlistMocks.addWaitlistSubscriber.mockResolvedValue({
      email: "reader@example.com",
      emailSent: true,
      status: "pending",
      storage: "local-file"
    });

    const response = await POST(
      new Request("https://markdownviewer.run/api/waitlist", {
        headers: {
          "content-type": "application/json",
          "user-agent": "vitest"
        },
        method: "POST",
        body: JSON.stringify({
          email: "reader@example.com",
          interest: "share_pro",
          intent: "password",
          locale: "en",
          source: "share_success"
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      email: "reader@example.com",
      emailSent: true,
      ok: true,
      status: "pending",
      storage: "local-file"
    });
    expect(waitlistMocks.addWaitlistSubscriber).toHaveBeenCalledWith({
      baseUrl: "https://markdownviewer.run",
      email: "reader@example.com",
      interest: "share_pro",
      intent: "password",
      locale: "en",
      source: "share_success",
      userAgent: "vitest"
    });
  });

  it("rejects invalid waitlist interests", async () => {
    const response = await POST(
      new Request("https://markdownviewer.run/api/waitlist", {
        method: "POST",
        body: JSON.stringify({
          email: "reader@example.com",
          interest: "team"
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Choose a valid waitlist." });
    expect(waitlistMocks.addWaitlistSubscriber).not.toHaveBeenCalled();
  });

  it("reports a delivery failure when the confirmation email cannot be sent", async () => {
    waitlistMocks.addWaitlistSubscriber.mockResolvedValue({
      email: "reader@example.com",
      emailSent: false,
      status: "email_failed",
      storage: "local-file"
    });

    const response = await POST(
      new Request("https://markdownviewer.run/api/waitlist", {
        headers: {
          "content-type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          email: "reader@example.com",
          interest: "share_pro"
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload).toEqual({
      email: "reader@example.com",
      emailSent: false,
      error: "Confirmation email could not be sent. Please try again later.",
      status: "email_failed",
      storage: "local-file"
    });
  });

  it("confirms a waitlist token and redirects back to pricing", async () => {
    waitlistMocks.confirmWaitlistSubscriber.mockResolvedValue({
      email: "reader@example.com",
      status: "verified",
      storage: "local-file"
    });

    const response = await ConfirmWaitlist(
      new Request("https://markdownviewer.run/api/waitlist/confirm?token=abc123")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://markdownviewer.run/pricing?waitlist=confirmed");
    expect(waitlistMocks.confirmWaitlistSubscriber).toHaveBeenCalledWith("abc123");
  });

  it("redirects invalid waitlist tokens to pricing with an error state", async () => {
    waitlistMocks.confirmWaitlistSubscriber.mockRejectedValue(new Error("Invalid"));

    const response = await ConfirmWaitlist(
      new Request("https://markdownviewer.run/api/waitlist/confirm?token=bad")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://markdownviewer.run/pricing?waitlist=invalid");
  });
});
