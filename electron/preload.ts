import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

type DesktopFileSnapshot = {
  path: string;
  name: string;
  markdown: string;
  lastModified: number;
};

type SaveDesktopFileRequest = {
  path: string;
  markdown: string;
};

const api = {
  isDesktop: true,
  getLaunchFiles: () => ipcRenderer.invoke("desktop:get-launch-files") as Promise<DesktopFileSnapshot[]>,
  openMarkdownFiles: () => ipcRenderer.invoke("desktop:open-markdown-files") as Promise<DesktopFileSnapshot[]>,
  saveMarkdownFile: (request: SaveDesktopFileRequest) =>
    ipcRenderer.invoke("desktop:save-markdown-file", request) as Promise<DesktopFileSnapshot>,
  saveMarkdownFileAs: (markdown: string, suggestedName: string) =>
    ipcRenderer.invoke("desktop:save-markdown-file-as", {
      markdown,
      suggestedName
    }) as Promise<DesktopFileSnapshot | null>,
  onOpenFiles: (callback: (files: DesktopFileSnapshot[]) => void) => {
    const listener = (_event: IpcRendererEvent, files: DesktopFileSnapshot[]) => callback(files);

    ipcRenderer.on("desktop:open-files", listener);

    return () => {
      ipcRenderer.removeListener("desktop:open-files", listener);
    };
  }
};

contextBridge.exposeInMainWorld("markdownviewerDesktop", api);
