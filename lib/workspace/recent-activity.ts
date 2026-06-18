export const recentActivityStorageKey = "markdownviewer.recentActivity.v1";

const recentActivityStorageVersion = 1;
const maxRecentActivityItems = 12;
const fallbackRecentActivityTitle = "Untitled markdown";

export type RecentActivityKind =
  | "share-created"
  | "share-copy"
  | "share-template"
  | "converted-document";

export type RecentActivityItem = {
  id: string;
  kind: RecentActivityKind;
  title: string;
  sourceInput: string;
  href?: string;
  shareId?: string;
  createdAt: number;
  updatedAt: number;
};

type RecentActivityStoragePayload = {
  version: typeof recentActivityStorageVersion;
  items: RecentActivityItem[];
};

type CreateShareRecentActivityInput = {
  shareId: string;
  title: string;
  href?: string;
  sourceInput?: string;
  now?: number;
};

type CreateConvertedRecentActivityInput = {
  sourceInput: string;
  title: string;
  href?: string;
  now?: number;
};

function getDefaultStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

function resolveStorage(storage?: Storage) {
  return storage ?? getDefaultStorage();
}

function normalizeTitle(title: string) {
  return title.trim() || fallbackRecentActivityTitle;
}

function isRecentActivityKind(value: unknown): value is RecentActivityKind {
  return (
    value === "share-created" ||
    value === "share-copy" ||
    value === "share-template" ||
    value === "converted-document"
  );
}

function isFiniteTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function sanitizeRecentActivityItem(value: unknown): RecentActivityItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.id !== "string" ||
    !isRecentActivityKind(record.kind) ||
    typeof record.title !== "string" ||
    typeof record.sourceInput !== "string" ||
    !isFiniteTimestamp(record.createdAt) ||
    !isFiniteTimestamp(record.updatedAt)
  ) {
    return null;
  }

  return {
    id: record.id,
    kind: record.kind,
    title: normalizeTitle(record.title),
    sourceInput: record.sourceInput,
    ...(typeof record.href === "string" ? { href: record.href } : {}),
    ...(typeof record.shareId === "string" ? { shareId: record.shareId } : {}),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function normalizeRecentActivityItems(items: unknown[], limit = maxRecentActivityItems) {
  return items
    .map(sanitizeRecentActivityItem)
    .filter((item): item is RecentActivityItem => item !== null)
    .sort((first, second) => second.updatedAt - first.updatedAt)
    .slice(0, limit);
}

export function readRecentActivity(storage?: Storage, options: { limit?: number } = {}) {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage) {
    return [];
  }

  try {
    const storedValue = resolvedStorage.getItem(recentActivityStorageKey);

    if (!storedValue) {
      return [];
    }

    const payload = JSON.parse(storedValue) as Partial<RecentActivityStoragePayload>;

    if (payload.version !== recentActivityStorageVersion || !Array.isArray(payload.items)) {
      return [];
    }

    return normalizeRecentActivityItems(payload.items, options.limit ?? maxRecentActivityItems);
  } catch {
    return [];
  }
}

export function writeRecentActivity(items: RecentActivityItem[], storage?: Storage) {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage) {
    return;
  }

  const payload: RecentActivityStoragePayload = {
    version: recentActivityStorageVersion,
    items: normalizeRecentActivityItems(items)
  };

  resolvedStorage.setItem(recentActivityStorageKey, JSON.stringify(payload));
}

export function upsertRecentActivity(item: RecentActivityItem, storage?: Storage) {
  const sanitizedItem = sanitizeRecentActivityItem(item);

  if (!sanitizedItem) {
    return;
  }

  const items = readRecentActivity(storage).filter((current) => current.id !== sanitizedItem.id);
  writeRecentActivity([sanitizedItem, ...items], storage);
}

export function removeRecentActivity(id: string, storage?: Storage) {
  const items = readRecentActivity(storage).filter((item) => item.id !== id);
  writeRecentActivity(items, storage);
}

export function clearRecentActivity(storage?: Storage) {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage) {
    return;
  }

  resolvedStorage.removeItem(recentActivityStorageKey);
}

export function createShareRecentActivityItem({
  shareId,
  title,
  href,
  sourceInput = "",
  now = Date.now()
}: CreateShareRecentActivityInput): RecentActivityItem {
  return {
    id: `share-created:${shareId}`,
    kind: "share-created",
    title: normalizeTitle(title),
    sourceInput,
    ...(href ? { href } : {}),
    shareId,
    createdAt: now,
    updatedAt: now
  };
}

export function createShareCopyRecentActivityItem({
  shareId,
  title,
  href,
  now = Date.now()
}: CreateShareRecentActivityInput): RecentActivityItem {
  return {
    id: `share-copy:${shareId}`,
    kind: "share-copy",
    title: normalizeTitle(title),
    sourceInput: `share:${shareId}:copy`,
    ...(href ? { href } : {}),
    shareId,
    createdAt: now,
    updatedAt: now
  };
}

export function createShareTemplateRecentActivityItem({
  shareId,
  title,
  href,
  now = Date.now()
}: CreateShareRecentActivityInput): RecentActivityItem {
  return {
    id: `share-template:${shareId}`,
    kind: "share-template",
    title: normalizeTitle(title),
    sourceInput: `share:${shareId}:template`,
    ...(href ? { href } : {}),
    shareId,
    createdAt: now,
    updatedAt: now
  };
}

export function createConvertedRecentActivityItem({
  sourceInput,
  title,
  href,
  now = Date.now()
}: CreateConvertedRecentActivityInput): RecentActivityItem {
  return {
    id: `converted:${sourceInput}`,
    kind: "converted-document",
    title: normalizeTitle(title),
    sourceInput,
    ...(href ? { href } : {}),
    createdAt: now,
    updatedAt: now
  };
}
