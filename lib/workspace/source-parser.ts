export type SourceType = "github" | "gist" | "remote" | "markdown";

export type NormalizedSource = {
  type: SourceType;
  original: string;
  resolvedUrl?: string;
  gistId?: string;
};

const githubBlobPattern =
  /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i;
const gistPattern = /^https:\/\/gist\.github\.com\/[^/]+\/([a-z0-9]+)/i;
const githubRawPattern = /^https:\/\/raw\.githubusercontent\.com\/.+/i;
const remoteMarkdownPattern = /^https?:\/\/.+\.md(?:[?#].*)?$/i;

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

  if (remoteMarkdownPattern.test(value)) {
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
      const [, owner, repo, branch, path] = match;

      return {
        type,
        original: value,
        resolvedUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
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
