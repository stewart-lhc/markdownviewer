import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { maxConvertedMarkdownCharacters } from "@/lib/workspace/convert-document";

const execFileAsync = promisify(execFile);
const conversionTimeoutMs = 45_000;
const maxBufferBytes = Math.ceil(maxConvertedMarkdownCharacters * 4);

function sanitizeTempFileName(fileName: string) {
  const trimmed = fileName.trim() || "document";

  return trimmed.replace(/[^\w.-]+/g, "_").slice(0, 160) || "document";
}

function normalizeRunnerError(error: unknown) {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};

  if (record.code === "ENOENT") {
    return new Error("MarkItDown is not available in this deployment.");
  }

  if (record.killed === true || record.signal === "SIGTERM") {
    return new Error("Conversion timed out. Try a smaller or simpler file.");
  }

  return new Error("Failed to convert the selected file.");
}

export async function convertFileWithMarkItDown(file: File) {
  const tempDirectory = await mkdtemp(join(tmpdir(), "markdownviewer-convert-"));
  const tempFilePath = join(tempDirectory, `${randomUUID()}-${sanitizeTempFileName(file.name)}`);

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFilePath, bytes);

    const { stdout } = await execFileAsync("markitdown", [tempFilePath], {
      maxBuffer: maxBufferBytes,
      timeout: conversionTimeoutMs,
      windowsHide: true
    });

    return stdout;
  } catch (error) {
    throw normalizeRunnerError(error);
  } finally {
    await rm(tempDirectory, {
      force: true,
      recursive: true
    });
  }
}
