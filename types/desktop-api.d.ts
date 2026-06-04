export type DesktopFileSnapshot = {
  path: string;
  name: string;
  markdown: string;
  lastModified: number;
};

export type SaveDesktopFileRequest = {
  path: string;
  markdown: string;
};

export type MarkdownviewerDesktopApi = {
  isDesktop: true;
  getLaunchFiles: () => Promise<DesktopFileSnapshot[]>;
  openMarkdownFiles: () => Promise<DesktopFileSnapshot[]>;
  saveMarkdownFile: (request: SaveDesktopFileRequest) => Promise<DesktopFileSnapshot>;
  saveMarkdownFileAs: (markdown: string, suggestedName: string) => Promise<DesktopFileSnapshot | null>;
  onOpenFiles: (callback: (files: DesktopFileSnapshot[]) => void) => () => void;
};

declare global {
  interface Window {
    markdownviewerDesktop?: MarkdownviewerDesktopApi;
  }
}

export {};
