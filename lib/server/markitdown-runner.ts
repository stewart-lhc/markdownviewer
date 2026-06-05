import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { getConvertibleDocumentExtension, maxConvertedMarkdownCharacters } from "@/lib/workspace/convert-document";

const execFileAsync = promisify(execFile);
const conversionTimeoutMs = 45_000;
const maxBufferBytes = Math.ceil(maxConvertedMarkdownCharacters * 4);
type OfficeParserFileType = "docx" | "pptx" | "xlsx" | "pdf" | "html" | "csv";
const officeParserFileTypes = new Map<string, OfficeParserFileType>([
  [".docx", "docx"],
  [".pptx", "pptx"],
  [".xlsx", "xlsx"],
  [".pdf", "pdf"],
  [".csv", "csv"],
  [".html", "html"],
  [".htm", "html"]
]);

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

async function readFileBytes(file: File) {
  if (typeof file.arrayBuffer === "function") {
    return Buffer.from(await file.arrayBuffer());
  }

  if (typeof file.text === "function") {
    return Buffer.from(await file.text(), "utf8");
  }

  throw new Error("Failed to read the selected file.");
}

function isMissingCliError(error: unknown) {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};

  return record.code === "ENOENT";
}

function formatStructuredTextMarkdown(fileName: string, bytes: Buffer, extension: string) {
  const source = bytes.toString("utf8").trim();

  if (!source) {
    return "";
  }

  if (extension === ".json") {
    try {
      return `# ${fileName}\n\n\`\`\`json\n${JSON.stringify(JSON.parse(source), null, 2)}\n\`\`\`\n`;
    } catch {
      return `# ${fileName}\n\n\`\`\`json\n${source}\n\`\`\`\n`;
    }
  }

  if (extension === ".xml") {
    return `# ${fileName}\n\n\`\`\`xml\n${source}\n\`\`\`\n`;
  }

  return source;
}

function stripLeadingYamlFrontmatter(markdown: string) {
  if (!markdown.startsWith("---\n")) {
    return markdown;
  }

  const endIndex = markdown.indexOf("\n---", 4);

  if (endIndex === -1) {
    return markdown;
  }

  const afterClosingFence = markdown.slice(endIndex + 4);

  return afterClosingFence.replace(/^\s+/, "");
}

async function convertWithOfficeParser(file: File, bytes: Buffer) {
  const extension = getConvertibleDocumentExtension(file.name);

  if (!extension) {
    throw new Error("This file type is not supported for Markdown conversion.");
  }

  if (extension === ".json" || extension === ".xml") {
    return formatStructuredTextMarkdown(file.name, bytes, extension);
  }

  const officeParserModule = await import("officeparser");
  const OfficeParser = officeParserModule.OfficeParser ?? officeParserModule.default;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), conversionTimeoutMs);

  try {
    if (!OfficeParser?.parseOffice) {
      throw new Error("OfficeParser converter is not available.");
    }

    const fileType = officeParserFileTypes.get(extension);
    const ast = await OfficeParser.parseOffice(bytes, {
      abortSignal: controller.signal,
      ...(fileType ? { fileType } : {})
    });
    const result = await ast.to("md", {
      includeImages: false,
      renderMetadata: false
    });
    const markdown = typeof result.value === "string" ? result.value : "";

    return stripLeadingYamlFrontmatter(markdown);
  } catch (error) {
    const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};

    if (record.name === "AbortError") {
      throw new Error("Conversion timed out. Try a smaller or simpler file.");
    }

    throw new Error("Failed to convert the selected file.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function convertFileWithMarkItDown(file: File) {
  const tempDirectory = await mkdtemp(join(tmpdir(), "markdownviewer-convert-"));
  const tempFilePath = join(tempDirectory, `${randomUUID()}-${sanitizeTempFileName(file.name)}`);
  const bytes = await readFileBytes(file);

  try {
    await writeFile(tempFilePath, bytes);

    const { stdout } = await execFileAsync("markitdown", [tempFilePath], {
      maxBuffer: maxBufferBytes,
      timeout: conversionTimeoutMs,
      windowsHide: true
    });

    return stdout;
  } catch (error) {
    if (isMissingCliError(error)) {
      return convertWithOfficeParser(file, bytes);
    }

    throw normalizeRunnerError(error);
  } finally {
    await rm(tempDirectory, {
      force: true,
      recursive: true
    });
  }
}
