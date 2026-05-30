import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getFolderCapability,
  queryFolderPermission,
  requestFolderPermission
} from "@/lib/workspace/folder-capabilities";

const originalShowDirectoryPicker = window.showDirectoryPicker;

afterEach(() => {
  window.showDirectoryPicker = originalShowDirectoryPicker;
});

describe("folder capabilities", () => {
  it("reports unsupported when the directory picker API is missing", () => {
    window.showDirectoryPicker = undefined;

    expect(getFolderCapability()).toBe("unsupported");
  });

  it("reports prompt when the directory picker API exists", () => {
    window.showDirectoryPicker = vi.fn();

    expect(getFolderCapability()).toBe("prompt");
  });

  it("queries and requests readwrite permission from a directory handle", async () => {
    const handle = {
      kind: "directory",
      name: "docs",
      queryPermission: vi.fn().mockResolvedValue("prompt"),
      requestPermission: vi.fn().mockResolvedValue("granted")
    } as unknown as FileSystemDirectoryHandle;

    await expect(queryFolderPermission(handle)).resolves.toBe("prompt");
    await expect(requestFolderPermission(handle)).resolves.toBe("granted");
    expect(handle.queryPermission).toHaveBeenCalledWith({ mode: "readwrite" });
    expect(handle.requestPermission).toHaveBeenCalledWith({ mode: "readwrite" });
  });

  it("normalizes failed permission calls to denied", async () => {
    const handle = {
      kind: "directory",
      name: "docs",
      queryPermission: vi.fn().mockRejectedValue(new Error("blocked")),
      requestPermission: vi.fn().mockRejectedValue(new Error("blocked"))
    } as unknown as FileSystemDirectoryHandle;

    await expect(queryFolderPermission(handle)).resolves.toBe("denied");
    await expect(requestFolderPermission(handle)).resolves.toBe("denied");
  });
});
