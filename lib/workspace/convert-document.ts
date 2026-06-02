export type ConvertedMarkdownDocument = {
  label: string;
  markdown: string;
  sourceName: string;
};

type Fetcher = typeof fetch;

export const convertedDocumentExtensions = [
  ".docx",
  ".pptx",
  ".xlsx",
  ".xls",
  ".csv",
  ".html",
  ".htm",
  ".json",
  ".xml",
  ".pdf"
] as const;

export const convertedDocumentAccept = convertedDocumentExtensions.join(",");
export const maxConvertedDocumentBytes = 20 * 1024 * 1024;
export const maxConvertedMarkdownCharacters = 2_000_000;

const convertApiPath = "/api/convert";

export function getConvertibleDocumentExtension(fileName: string) {
  const lowerName = fileName.toLowerCase();

  return convertedDocumentExtensions.find((extension) => lowerName.endsWith(extension));
}

export function isConvertibleDocumentFile(file: Pick<File, "name">) {
  return Boolean(getConvertibleDocumentExtension(file.name));
}

function assertConvertibleDocument(file: File) {
  if (!isConvertibleDocumentFile(file)) {
    throw new Error("This file type is not supported for Markdown conversion.");
  }

  if (file.size > maxConvertedDocumentBytes) {
    throw new Error("This file is too large to convert.");
  }
}

async function readConversionError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };

    if (payload.error) {
      return payload.error;
    }
  } catch {
    // Fall through to the generic error below.
  }

  return "Failed to convert the selected file.";
}

function normalizeConversionPayload(payload: unknown): ConvertedMarkdownDocument {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const markdown = typeof record.markdown === "string" ? record.markdown : "";
  const label = typeof record.label === "string" && record.label ? record.label : "Converted document";
  const sourceName = typeof record.sourceName === "string" && record.sourceName ? record.sourceName : "converted-file";

  if (!markdown.trim()) {
    throw new Error("The converted Markdown was empty.");
  }

  if (markdown.length > maxConvertedMarkdownCharacters) {
    throw new Error("The converted Markdown is too large to load.");
  }

  return {
    label,
    markdown,
    sourceName
  };
}

export async function convertDocumentToMarkdown(
  file: File,
  fetcher: Fetcher = fetch
): Promise<ConvertedMarkdownDocument> {
  assertConvertibleDocument(file);

  const body = new FormData();
  body.append("file", file);

  const response = await fetcher(convertApiPath, {
    method: "POST",
    body
  });

  if (!response.ok) {
    throw new Error(await readConversionError(response));
  }

  return normalizeConversionPayload(await response.json());
}
