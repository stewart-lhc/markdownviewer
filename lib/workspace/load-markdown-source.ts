import { detectSourceType, normalizeSourceInput } from "@/lib/workspace/source-parser";

export type LoadedMarkdownSource = {
  markdown: string;
  label: string;
  resolvedUrl?: string;
};

type Fetcher = typeof fetch;

function isMarkdownLikeFile(filename: string) {
  return /\.(md|markdown|mdx|txt)$/i.test(filename);
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

    return {
      markdown: preferred.content,
      label: "Gist import"
    };
  }

  if (!normalized.resolvedUrl) {
    throw new Error("Could not resolve the requested Markdown source.");
  }

  const response = await fetcher(normalized.resolvedUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch the requested Markdown source.");
  }

  return {
    markdown: await response.text(),
    label: type === "github" ? "GitHub source" : "Remote source",
    resolvedUrl: normalized.resolvedUrl
  };
}
