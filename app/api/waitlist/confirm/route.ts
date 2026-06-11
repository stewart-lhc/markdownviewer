import { NextResponse } from "next/server";
import { confirmWaitlistSubscriber } from "@/lib/waitlist/waitlist-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectUrl = new URL("/pricing", url.origin);

  if (!token) {
    redirectUrl.searchParams.set("waitlist", "invalid");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    await confirmWaitlistSubscriber(token);
    redirectUrl.searchParams.set("waitlist", "confirmed");
  } catch {
    redirectUrl.searchParams.set("waitlist", "invalid");
  }

  return NextResponse.redirect(redirectUrl);
}
