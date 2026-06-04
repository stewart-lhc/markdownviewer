import { randomBytes, createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import { starterDocument } from "@/lib/workspace/default-document";
import { decodeMarkdownShare } from "@/lib/share/share-codec";

export type SharedDocumentSource = "stored" | "seeded" | "legacy-url";

export type SharedDocument = {
  createdAt: string;
  id: string;
  markdown: string;
  source: SharedDocumentSource;
  title: string;
};

type StoredSharedDocument = {
  createdAt: string;
  contentHash: string;
  id: string;
  markdown: string;
  title: string;
};

export const maxSharedMarkdownCharacters = 500_000;

const localShareDirectory = path.join(process.cwd(), ".data", "shares");
const shareBlobAccess = "public" as const;

const seededDocuments: Record<string, SharedDocument> = {
  "starter-doc": {
    createdAt: "2026-04-18T00:00:00.000Z",
    id: "starter-doc",
    title: "Markdown Feature Atlas",
    markdown: starterDocument,
    source: "seeded"
  },
  starter: {
    createdAt: "2026-04-18T00:00:00.000Z",
    id: "starter",
    title: "Markdown Feature Atlas",
    markdown: starterDocument,
    source: "seeded"
  }
};

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

function hasBlobStorageCredentials() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function getShareBlobPath(id: string) {
  return `shares/${id}.json`;
}

function getLocalSharePath(id: string) {
  return path.join(localShareDirectory, `${id}.json`);
}

function slugifyTitle(title: string) {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/g, "");

  return slug || "shared-markdown";
}

function createShareId(title: string) {
  return `${slugifyTitle(title)}-${randomBytes(6).toString("base64url").toLowerCase()}`;
}

function deriveShareTitle(markdown: string, requestedTitle?: string) {
  if (requestedTitle?.trim()) {
    return requestedTitle.trim().slice(0, 120);
  }

  const titleMatch = markdown.match(/^#\s+(.+)$/m);

  return titleMatch?.[1]?.trim().slice(0, 120) || "Shared Markdown";
}

function toStoredDocument(document: SharedDocument): StoredSharedDocument {
  return {
    createdAt: document.createdAt,
    contentHash: createHash("sha256").update(document.markdown).digest("hex"),
    id: document.id,
    markdown: document.markdown,
    title: document.title
  };
}

function fromStoredDocument(document: StoredSharedDocument): SharedDocument {
  return {
    createdAt: document.createdAt,
    id: document.id,
    markdown: document.markdown,
    source: "stored",
    title: document.title
  };
}

function parseStoredDocument(value: string) {
  const parsed = JSON.parse(value) as Partial<StoredSharedDocument>;

  if (
    typeof parsed.id !== "string" ||
    typeof parsed.title !== "string" ||
    typeof parsed.markdown !== "string" ||
    typeof parsed.createdAt !== "string"
  ) {
    return null;
  }

  return fromStoredDocument({
    createdAt: parsed.createdAt,
    contentHash: typeof parsed.contentHash === "string" ? parsed.contentHash : "",
    id: parsed.id,
    markdown: parsed.markdown,
    title: parsed.title
  });
}

async function saveWithBlob(document: SharedDocument) {
  await put(getShareBlobPath(document.id), JSON.stringify(toStoredDocument(document)), {
    access: shareBlobAccess,
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: "application/json",
  });
}

async function readWithBlob(id: string) {
  const result = await get(getShareBlobPath(id), { access: shareBlobAccess });

  if (!result || result.statusCode !== 200) {
    return null;
  }

  const text = await new Response(result.stream).text();
  return parseStoredDocument(text);
}

async function saveWithLocalFile(document: SharedDocument) {
  await mkdir(localShareDirectory, { recursive: true });
  await writeFile(getLocalSharePath(document.id), JSON.stringify(toStoredDocument(document)), "utf8");
}

async function readWithLocalFile(id: string) {
  try {
    return parseStoredDocument(await readFile(getLocalSharePath(id), "utf8"));
  } catch {
    return null;
  }
}

async function saveStoredDocument(document: SharedDocument) {
  if (hasBlobStorageCredentials()) {
    await saveWithBlob(document);
    return;
  }

  if (isVercelRuntime()) {
    throw new Error("Share storage is not configured. Connect Vercel Blob with BLOB_STORE_ID/OIDC or expose BLOB_READ_WRITE_TOKEN.");
  }

  await saveWithLocalFile(document);
}

async function readStoredDocument(id: string) {
  if (hasBlobStorageCredentials()) {
    try {
      return await readWithBlob(id);
    } catch {
      return null;
    }
  }

  if (isVercelRuntime()) {
    return null;
  }

  return readWithLocalFile(id);
}

function getLegacyUrlDocument(id: string) {
  const decoded = decodeMarkdownShare(id);

  if (!decoded) {
    return null;
  }

  return {
    createdAt: "2026-06-01T00:00:00.000Z",
    id,
    markdown: decoded,
    source: "legacy-url" as const,
    title: deriveShareTitle(decoded)
  };
}

export async function getSharedDocument(id: string) {
  const seededDocument = seededDocuments[id];

  if (seededDocument) {
    return seededDocument;
  }

  const storedDocument = await readStoredDocument(id);

  if (storedDocument) {
    return storedDocument;
  }

  return getLegacyUrlDocument(id);
}

export async function createSharedDocument(markdown: string, title?: string) {
  const normalizedMarkdown = markdown.trimEnd();

  if (!normalizedMarkdown.trim()) {
    throw new Error("Add Markdown content before creating a share link.");
  }

  if (normalizedMarkdown.length > maxSharedMarkdownCharacters) {
    throw new Error("This document is too large to share online. Export HTML or PDF instead.");
  }

  const documentTitle = deriveShareTitle(normalizedMarkdown, title);
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const document: SharedDocument = {
      createdAt: new Date().toISOString(),
      id: createShareId(documentTitle),
      markdown: normalizedMarkdown,
      source: "stored",
      title: documentTitle
    };

    try {
      await saveStoredDocument(document);
      return document;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to create share link.");
}
