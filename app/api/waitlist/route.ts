import { NextResponse } from "next/server";
import {
  addWaitlistSubscriber,
  type WaitlistInterest
} from "@/lib/waitlist/waitlist-store";

export const runtime = "nodejs";

type WaitlistRequestBody = {
  email?: unknown;
  intent?: unknown;
  interest?: unknown;
  locale?: unknown;
  source?: unknown;
};

const validInterests = new Set<WaitlistInterest>(["share_pro", "converter_api"]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: WaitlistRequestBody;

  try {
    body = (await request.json()) as WaitlistRequestBody;
  } catch {
    return jsonError("Waitlist requests must include a JSON body.");
  }

  if (typeof body.email !== "string") {
    return jsonError("Enter an email address.");
  }

  if (typeof body.interest !== "string" || !validInterests.has(body.interest as WaitlistInterest)) {
    return jsonError("Choose a valid waitlist.");
  }

  try {
    const result = await addWaitlistSubscriber({
      baseUrl: new URL(request.url).origin,
      email: body.email,
      interest: body.interest as WaitlistInterest,
      intent: typeof body.intent === "string" ? body.intent : undefined,
      locale: typeof body.locale === "string" ? body.locale : undefined,
      source: typeof body.source === "string" ? body.source : undefined,
      userAgent: request.headers.get("user-agent") || undefined
    });

    if (result.status === "email_failed") {
      return NextResponse.json({
        email: result.email,
        emailSent: false,
        error: "Confirmation email could not be sent. Please try again later.",
        status: result.status,
        storage: result.storage
      }, { status: 502 });
    }

    return NextResponse.json({
      email: result.email,
      emailSent: result.emailSent,
      ok: true,
      status: result.status,
      storage: result.storage
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to join the waitlist.";
    const status = message.includes("valid email") ? 400 : 500;

    return jsonError(message, status);
  }
}
