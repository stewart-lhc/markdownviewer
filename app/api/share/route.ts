import { NextResponse } from "next/server";
import { createSharedDocument } from "@/lib/share/share-store";

export const runtime = "nodejs";

type ShareRequestBody = {
  markdown?: unknown;
  title?: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: ShareRequestBody;

  try {
    body = (await request.json()) as ShareRequestBody;
  } catch {
    return jsonError("Share requests must include a JSON body.");
  }

  if (typeof body.markdown !== "string") {
    return jsonError("Provide Markdown content to share.");
  }

  try {
    const document = await createSharedDocument(
      body.markdown,
      typeof body.title === "string" ? body.title : undefined
    );

    return NextResponse.json({
      id: document.id,
      title: document.title
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create share link.";
    const status = message.includes("too large") ? 413 : message.includes("not configured") ? 503 : 400;

    return jsonError(message, status);
  }
}
