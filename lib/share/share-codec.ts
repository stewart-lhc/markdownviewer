import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export const maxEncodedMarkdownShareLength = 6000;

export function encodeMarkdownShare(markdown: string) {
  return `md-${compressToEncodedURIComponent(markdown)}`;
}

export function createMarkdownShare(markdown: string) {
  const id = encodeMarkdownShare(markdown);

  if (id.length > maxEncodedMarkdownShareLength) {
    return {
      ok: false as const,
      error: "This document is too large for link sharing. Export HTML or PDF instead."
    };
  }

  return {
    ok: true as const,
    id
  };
}

export function decodeMarkdownShare(value: string) {
  if (!value.startsWith("md-")) {
    return null;
  }

  if (value.length > maxEncodedMarkdownShareLength) {
    return null;
  }

  return decompressFromEncodedURIComponent(value.slice(3));
}
