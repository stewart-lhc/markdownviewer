import { starterDocument } from "@/lib/workspace/default-document";
import { getSharedDocument } from "@/lib/share/mock-share-store";
import { loadMarkdownSource } from "@/lib/workspace/load-markdown-source";

type SearchParams = Record<string, string | string[] | undefined>;

type ResolvedWorkspaceDocument = {
  markdown: string;
  sourceInput: string;
  statusMessage?: string;
};

function takeFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function resolveInitialWorkspaceDocument(
  searchParams: SearchParams,
  fetcher?: typeof fetch
): Promise<ResolvedWorkspaceDocument> {
  const shareValue = takeFirst(searchParams.share);
  const sourceValue = takeFirst(searchParams.source);

  if (shareValue) {
    const sharedDocument = getSharedDocument(shareValue);

    if (!sharedDocument) {
      return {
        markdown: "",
        sourceInput: "",
        statusMessage: "Shared document not found."
      };
    }

    return {
      markdown: sharedDocument.markdown,
      sourceInput: ""
    };
  }

  if (sourceValue) {
    try {
      const loaded = await loadMarkdownSource(sourceValue, fetcher);

      return {
        markdown: loaded.markdown,
        sourceInput: sourceValue
      };
    } catch (error) {
      return {
        markdown: "",
        sourceInput: sourceValue,
        statusMessage: error instanceof Error ? error.message : "Failed to load Markdown."
      };
    }
  }

  return {
    markdown: starterDocument,
    sourceInput: ""
  };
}
