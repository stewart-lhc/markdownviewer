export type SourceType = "github" | "gist" | "remote" | "markdown";

export type NormalizedSource = {
  type: SourceType;
  original: string;
  resolvedUrl?: string;
  gistId?: string;
};

const githubBlobPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(blob|raw)\/(.+)$/i;
const gistPattern = /^https:\/\/gist\.github\.com\/(?:[^/]+\/)?([a-f0-9]{5,})(?:\/.*)?(?:[?#].*)?$/i;
const githubRawPattern = /^https:\/\/raw\.githubusercontent\.com\/.+/i;
const remoteUrlPattern = /^https?:\/\/.+/i;

const blockedHostnames = new Set(["localhost", "0.0.0.0"]);

function stripUrlNoise(value: string) {
  return value.replace(/[?#].*$/, "");
}

function isPrivateIPv4(hostname: string) {
  const parts = hostname.split(".").map((part) => Number.parseInt(part, 10));

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

function isBlockedIPv6Literal(hostname: string) {
  if (!hostname.startsWith("[") || !hostname.endsWith("]")) {
    return false;
  }

  return true;
}

export function isAllowedRemoteUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    if (
      blockedHostnames.has(hostname) ||
      hostname.endsWith(".local") ||
      isBlockedIPv6Literal(hostname) ||
      isPrivateIPv4(hostname)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function detectSourceType(input: string): SourceType {
  const value = input.trim();

  if (githubBlobPattern.test(value)) {
    return "github";
  }

  if (githubRawPattern.test(value)) {
    return "remote";
  }

  if (gistPattern.test(value)) {
    return "gist";
  }

  if (remoteUrlPattern.test(value)) {
    return "remote";
  }

  return "markdown";
}

export function normalizeSourceInput(input: string): NormalizedSource {
  const type = detectSourceType(input);
  const value = input.trim();

  if (type === "github") {
    const match = value.match(githubBlobPattern);

    if (match) {
      const [, owner, repo, mode, rest] = match;
      const [branch = "", ...pathParts] = stripUrlNoise(rest).split("/");
      const path = pathParts.join("/");

      return {
        type,
        original: value,
        resolvedUrl:
          mode.toLowerCase() === "raw"
            ? value
            : `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
      };
    }
  }

  if (type === "gist") {
    const match = value.match(gistPattern);

    if (match) {
      return {
        type,
        original: value,
        gistId: match[1]
      };
    }
  }

  return {
    type,
    original: value,
    resolvedUrl: type === "remote" ? value : undefined
  };
}
