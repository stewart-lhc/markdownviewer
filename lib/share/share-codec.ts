import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export function encodeMarkdownShare(markdown: string) {
  return `md-${compressToEncodedURIComponent(markdown)}`;
}

export function decodeMarkdownShare(value: string) {
  if (!value.startsWith("md-")) {
    return null;
  }

  return decompressFromEncodedURIComponent(value.slice(3));
}
