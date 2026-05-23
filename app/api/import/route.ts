import { NextResponse } from "next/server";
import { loadMarkdownSource } from "@/lib/workspace/load-markdown-source";

export const runtime = "nodejs";

type ImportRequestBody = {
  source?: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: ImportRequestBody;

  try {
    body = (await request.json()) as ImportRequestBody;
  } catch {
    return jsonError("Import requests must include a JSON body.");
  }

  if (typeof body.source !== "string" || body.source.trim().length === 0) {
    return jsonError("Provide a Markdown URL, GitHub URL, Gist URL, or Markdown text.");
  }

  try {
    return NextResponse.json(await loadMarkdownSource(body.source));
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to import Markdown.", 502);
  }
}
