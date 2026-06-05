import { NextResponse } from "next/server";
import { convertFileWithMarkItDown } from "@/lib/server/markitdown-runner";
import {
  decodeFileName,
  isConvertibleDocumentFile,
  maxConvertedDocumentBytes,
  maxConvertedMarkdownCharacters
} from "@/lib/workspace/convert-document";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function statusForConversionError(message: string) {
  if (message === "Conversion timed out. Try a smaller or simpler file.") {
    return 504;
  }

  if (message === "MarkItDown is not available in this deployment.") {
    return 500;
  }

  if (message === "The converted Markdown was empty.") {
    return 422;
  }

  return 500;
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Conversion requests must include multipart form data.");
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Provide one file to convert.");
  }

  if (!isConvertibleDocumentFile(file)) {
    return jsonError("This file type is not supported for Markdown conversion.");
  }

  if (file.size > maxConvertedDocumentBytes) {
    return jsonError("This file is too large to convert.", 413);
  }

  try {
    const markdown = await convertFileWithMarkItDown(file);

    if (!markdown.trim()) {
      return jsonError("The converted Markdown was empty.", 422);
    }

    if (markdown.length > maxConvertedMarkdownCharacters) {
      return jsonError("The converted Markdown is too large to load.", 413);
    }

    return NextResponse.json({
      label: "Converted document",
      markdown,
      sourceName: decodeFileName(file.name)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to convert the selected file.";

    return jsonError(message, statusForConversionError(message));
  }
}
