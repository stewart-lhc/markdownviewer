import { starterDocument } from "@/lib/workspace/default-document";
import { decodeMarkdownShare } from "@/lib/share/share-codec";

type SharedDocument = {
  id: string;
  title: string;
  markdown: string;
};

const documents: Record<string, SharedDocument> = {
  "starter-doc": {
    id: "starter-doc",
    title: "Markdown Feature Atlas",
    markdown: starterDocument
  },
  starter: {
    id: "starter",
    title: "Markdown Feature Atlas",
    markdown: starterDocument
  }
};

export function getSharedDocument(id: string) {
  const existing = documents[id];

  if (existing) {
    return existing;
  }

  const decoded = decodeMarkdownShare(id);

  if (!decoded) {
    return null;
  }

  const titleMatch = decoded.match(/^#\s+(.+)$/m);

  return {
    id,
    title: titleMatch?.[1]?.trim() ?? "Shared Markdown",
    markdown: decoded
  };
}
