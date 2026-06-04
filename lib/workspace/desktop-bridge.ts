import type { DesktopFileSnapshot, MarkdownviewerDesktopApi } from "@/types/desktop-api";

export function getDesktopBridge(): MarkdownviewerDesktopApi | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.markdownviewerDesktop?.isDesktop ? window.markdownviewerDesktop : null;
}

export function isDesktopBridgeAvailable() {
  return Boolean(getDesktopBridge());
}

export function normalizeDesktopFileSourceInput(path: string) {
  return `desktop:${path.replaceAll("\\", "/")}`;
}

export function getDesktopFileTabTitle(file: DesktopFileSnapshot) {
  return file.name || "Untitled.md";
}
