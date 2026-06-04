import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getDesktopBridge,
  getDesktopFileTabTitle,
  isDesktopBridgeAvailable,
  normalizeDesktopFileSourceInput
} from "@/lib/workspace/desktop-bridge";

describe("desktop bridge", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "markdownviewerDesktop");
    vi.restoreAllMocks();
  });

  it("detects when Electron desktop APIs are unavailable", () => {
    expect(isDesktopBridgeAvailable()).toBe(false);
    expect(getDesktopBridge()).toBeNull();
  });

  it("returns the desktop bridge when preload exposes it", () => {
    const bridge = {
      getLaunchFiles: vi.fn(),
      isDesktop: true,
      onOpenFiles: vi.fn(),
      openMarkdownFiles: vi.fn(),
      saveMarkdownFile: vi.fn(),
      saveMarkdownFileAs: vi.fn()
    };

    Object.defineProperty(window, "markdownviewerDesktop", {
      configurable: true,
      value: bridge
    });

    expect(isDesktopBridgeAvailable()).toBe(true);
    expect(getDesktopBridge()).toBe(bridge);
  });

  it("builds stable desktop source input from native file paths", () => {
    expect(normalizeDesktopFileSourceInput("D:\\GitHub\\demo\\README.md")).toBe("desktop:D:/GitHub/demo/README.md");
  });

  it("uses the native file name as the desktop tab title", () => {
    expect(
      getDesktopFileTabTitle({
        lastModified: 1000,
        markdown: "# Demo",
        name: "README.md",
        path: "D:\\GitHub\\demo\\README.md"
      })
    ).toBe("README.md");
  });
});
