import { starterDocument } from "@/lib/workspace/default-document";
import { getSharedDocument } from "@/lib/share/share-store";
import { defaultLocale, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
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
  fetcher?: typeof fetch,
  locale: Locale = defaultLocale
): Promise<ResolvedWorkspaceDocument> {
  const messages = getMessages(locale).workspace;
  const shareValue = takeFirst(searchParams.share);
  const sourceValue = takeFirst(searchParams.source);

  if (shareValue) {
    const sharedDocument = await getSharedDocument(shareValue);

    if (!sharedDocument) {
      return {
        markdown: "",
        sourceInput: "",
        statusMessage: messages.status.sharedMissing
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
        statusMessage: error instanceof Error ? error.message : messages.status.loadFailed
      };
    }
  }

  return {
    markdown: starterDocument,
    sourceInput: ""
  };
}
