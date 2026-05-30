export type ResolvedMarkdownLink = {
  hash?: string;
  path: string;
};

const markdownFilePattern = /\.(md|markdown|mdx|txt)$/i;

function splitPathAndHash(value: string) {
  const hashIndex = value.indexOf("#");

  if (hashIndex === -1) {
    return {
      hash: undefined,
      path: value
    };
  }

  return {
    hash: value.slice(hashIndex + 1) || undefined,
    path: value.slice(0, hashIndex)
  };
}

export function normalizeFolderPath(value: string): string | null {
  const normalized = value
    .replace(/\\/g, "/")
    .replace(/^folder:/, "")
    .replace(/^\/+/, "");
  const parts = normalized.split("/").filter(Boolean);
  const stack: string[] = [];

  for (const part of parts) {
    if (part === ".") {
      continue;
    }

    if (part === "..") {
      if (stack.length === 0) {
        return null;
      }

      stack.pop();
      continue;
    }

    stack.push(part);
  }

  return `/${stack.join("/")}`;
}

export function joinFolderPath(baseDirectory: string, relativePath: string): string | null {
  const base = normalizeFolderPath(baseDirectory);

  if (!base) {
    return null;
  }

  const basePrefix = base === "/" ? "" : base;
  return normalizeFolderPath(`${basePrefix}/${relativePath}`);
}

export function getFolderPathDirectory(path: string) {
  const normalized = normalizeFolderPath(path);

  if (!normalized || normalized === "/") {
    return "/";
  }

  const lastSlash = normalized.lastIndexOf("/");
  return lastSlash <= 0 ? "/" : normalized.slice(0, lastSlash);
}

export function getFolderPathName(path: string) {
  const normalized = normalizeFolderPath(path);

  if (!normalized || normalized === "/") {
    return "";
  }

  return normalized.split("/").filter(Boolean).at(-1) ?? "";
}

export function isMarkdownFolderPath(path: string) {
  return markdownFilePattern.test(path);
}

export function resolveMarkdownLink(currentFilePath: string, href: string): ResolvedMarkdownLink | null {
  const trimmed = href.trim();

  if (!trimmed || /^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith("#")) {
    return null;
  }

  const decoded = decodeURI(trimmed);
  const { hash, path } = splitPathAndHash(decoded);

  if (!path || !isMarkdownFolderPath(path)) {
    return null;
  }

  const resolvedPath = path.startsWith("/")
    ? normalizeFolderPath(path)
    : joinFolderPath(getFolderPathDirectory(currentFilePath), path);

  return resolvedPath
    ? {
        hash,
        path: resolvedPath
      }
    : null;
}
