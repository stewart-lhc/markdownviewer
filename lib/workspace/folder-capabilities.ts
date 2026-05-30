export type FolderPermissionState = "unsupported" | "prompt" | "granted" | "denied";

const readWritePermission = { mode: "readwrite" as const };

export function getFolderCapability(): FolderPermissionState {
  if (typeof window === "undefined" || typeof window.showDirectoryPicker !== "function") {
    return "unsupported";
  }

  return "prompt";
}

function normalizePermissionState(state: PermissionState | undefined): FolderPermissionState {
  if (state === "granted" || state === "denied" || state === "prompt") {
    return state;
  }

  return "prompt";
}

export async function queryFolderPermission(
  handle: FileSystemDirectoryHandle | null | undefined
): Promise<FolderPermissionState> {
  if (!handle || typeof handle.queryPermission !== "function") {
    return getFolderCapability() === "unsupported" ? "unsupported" : "prompt";
  }

  try {
    return normalizePermissionState(await handle.queryPermission(readWritePermission));
  } catch {
    return "denied";
  }
}

export async function requestFolderPermission(
  handle: FileSystemDirectoryHandle | null | undefined
): Promise<FolderPermissionState> {
  if (!handle || typeof handle.requestPermission !== "function") {
    return queryFolderPermission(handle);
  }

  try {
    return normalizePermissionState(await handle.requestPermission(readWritePermission));
  } catch {
    return "denied";
  }
}
