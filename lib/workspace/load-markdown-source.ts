import {
  detectSourceType,
  isAllowedRemoteUrl,
  normalizeSourceInput
} from "@/lib/workspace/source-parser";

export type LoadedMarkdownSource = {
  markdown: string;
  label: string;
  resolvedUrl?: string;
};

type Fetcher = typeof fetch;

export const maxImportedMarkdownCharacters = 2_000_000;

const importApiPath = "/api/import";

function isMarkdownLikeFile(filename: string) {
  return /\.(md|markdown|mdx|txt)$/i.test(filename);
}

function assertRemoteUrlAllowed(value: string) {
  if (!isAllowedRemoteUrl(value)) {
    throw new Error("Only public HTTP(S) Markdown URLs can be imported.");
  }
}

function assertMarkdownSize(markdown: string) {
  if (markdown.length > maxImportedMarkdownCharacters) {
    throw new Error("The requested Markdown file is too large to import.");
  }
}

async function readMarkdownResponse(response: Response) {
  const contentLength = response.headers?.get("content-length");

  if (contentLength && Number.parseInt(contentLength, 10) > maxImportedMarkdownCharacters) {
    throw new Error("The requested Markdown file is too large to import.");
  }

  const markdown = await response.text();

  assertMarkdownSize(markdown);

  return markdown;
}

async function readImportError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };

    if (payload.error) {
      return payload.error;
    }
  } catch {
    // Fall through to the generic error below.
  }

  return "Failed to import the requested Markdown source.";
}

export async function loadMarkdownSource(
  input: string,
  fetcher: Fetcher = fetch
): Promise<LoadedMarkdownSource> {
  const normalized = normalizeSourceInput(input);
  const type = detectSourceType(input);

  if (type === "markdown") {
    return {
      markdown: input,
      label: "Pasted Markdown"
    };
  }

  if (type === "gist") {
    const gistId = normalized.gistId;

    if (!gistId) {
      throw new Error("Could not parse the Gist URL.");
    }

    assertRemoteUrlAllowed(`https://api.github.com/gists/${gistId}`);

    const response = await fetcher(`https://api.github.com/gists/${gistId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch the requested Gist.");
    }

    const payload = (await response.json()) as {
      files?: Record<string, { filename?: string; content?: string | null }>;
    };
    const entries = Object.values(payload.files ?? {});
    const preferred =
      entries.find((entry) => entry.filename && isMarkdownLikeFile(entry.filename)) ?? entries[0];

    if (!preferred?.content) {
      throw new Error("The Gist did not contain readable Markdown content.");
    }

    assertMarkdownSize(preferred.content);

    return {
      markdown: preferred.content,
      label: "Gist import"
    };
  }

  if (!normalized.resolvedUrl) {
    throw new Error("Could not resolve the requested Markdown source.");
  }

  assertRemoteUrlAllowed(normalized.resolvedUrl);

  const response = await fetcher(normalized.resolvedUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch the requested Markdown source.");
  }

  return {
    markdown: await readMarkdownResponse(response),
    label: type === "github" ? "GitHub source" : "Remote source",
    resolvedUrl: normalized.resolvedUrl
  };
}

export async function loadMarkdownSourceViaApi(
  input: string,
  fetcher: Fetcher = fetch
): Promise<LoadedMarkdownSource> {
  if (detectSourceType(input) === "markdown") {
    return loadMarkdownSource(input, fetcher);
  }

  const response = await fetcher(importApiPath, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ source: input })
  });

  if (!response.ok) {
    throw new Error(await readImportError(response));
  }

  return (await response.json()) as LoadedMarkdownSource;
}
