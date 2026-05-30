type FileSystemPermissionMode = "read" | "readwrite";

type FileSystemPermissionDescriptor = {
  mode?: FileSystemPermissionMode;
};

type DirectoryPickerOptions = {
  id?: string;
  mode?: FileSystemPermissionMode;
  startIn?: FileSystemHandle | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos";
};

interface FileSystemHandle {
  queryPermission?: (descriptor?: FileSystemPermissionDescriptor) => Promise<PermissionState>;
  requestPermission?: (descriptor?: FileSystemPermissionDescriptor) => Promise<PermissionState>;
}

interface FileSystemDirectoryHandle {
  entries?: () => AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>;
  values?: () => AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;
}

interface Window {
  showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
}
