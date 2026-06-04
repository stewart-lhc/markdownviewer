import { app, BrowserWindow, dialog, ipcMain } from "electron";
import type { OpenDialogOptions, SaveDialogOptions } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import { readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { basename, extname, join } from "node:path";

type DesktopFileSnapshot = {
  path: string;
  name: string;
  markdown: string;
  lastModified: number;
};

type SaveMarkdownFileRequest = {
  path: string;
  markdown: string;
};

type SaveMarkdownFileAsRequest = {
  markdown: string;
  suggestedName: string;
};

const markdownExtensions = new Set([".md", ".markdown", ".mdx", ".txt"]);
let mainWindow: BrowserWindow | null = null;
let nextProcess: ChildProcess | null = null;
let launchFilePaths: string[] = [];

function isMarkdownFilePath(filePath: string) {
  return markdownExtensions.has(extname(filePath).toLowerCase());
}

function collectMarkdownPaths(argv: string[]) {
  return argv.filter(isMarkdownFilePath);
}

async function readDesktopFile(filePath: string): Promise<DesktopFileSnapshot> {
  const [markdown, stats] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);

  return {
    lastModified: stats.mtimeMs,
    markdown,
    name: basename(filePath),
    path: filePath
  };
}

async function readDesktopFiles(filePaths: string[]) {
  const uniquePaths = Array.from(new Set(filePaths.filter(isMarkdownFilePath)));
  const files: DesktopFileSnapshot[] = [];

  for (const filePath of uniquePaths) {
    files.push(await readDesktopFile(filePath));
  }

  return files;
}

async function findFreePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;

      server.close(() => resolve(port));
    });
  });
}

function getRuntimeRoot() {
  if (!app.isPackaged) {
    return process.cwd();
  }

  return join(process.resourcesPath, "desktop-runtime");
}

async function startNextRuntime() {
  if (!app.isPackaged && process.env.MARKDOWNVIEWER_NEXT_DEV_URL) {
    return process.env.MARKDOWNVIEWER_NEXT_DEV_URL;
  }

  const nextPort = await findFreePort();
  const runtimeRoot = getRuntimeRoot();
  const serverPath = app.isPackaged
    ? join(runtimeRoot, "server.js")
    : join(process.cwd(), ".next", "standalone", "server.js");
  const nodeRuntimePath = app.isPackaged && process.platform === "win32" ? join(runtimeRoot, "node.exe") : process.execPath;

  nextProcess = spawn(nodeRuntimePath, [serverPath], {
    cwd: runtimeRoot,
    env: {
      ...process.env,
      HOSTNAME: "127.0.0.1",
      PORT: String(nextPort)
    },
    stdio: "ignore",
    windowsHide: true
  });

  return `http://127.0.0.1:${nextPort}`;
}

async function waitForNextRuntime(baseUrl: string) {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/workspace`);

      if (response.ok) {
        return;
      }
    } catch {
      // The standalone Next server may need a short warmup before accepting HTTP traffic.
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error("Next runtime did not become ready.");
}

async function createMainWindow(baseUrl: string) {
  mainWindow = new BrowserWindow({
    height: 860,
    minHeight: 640,
    minWidth: 960,
    title: "Markdownviewer",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, "preload.js")
    },
    width: 1280
  });

  await mainWindow.loadURL(`${baseUrl}/workspace?desktop=1`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function sendFilesToRenderer(files: DesktopFileSnapshot[]) {
  if (!mainWindow || files.length === 0) {
    return;
  }

  mainWindow.webContents.send("desktop:open-files", files);
  mainWindow.focus();
}

function registerIpcHandlers() {
  ipcMain.handle("desktop:get-launch-files", async () => {
    const files = await readDesktopFiles(launchFilePaths);
    launchFilePaths = [];

    return files;
  });

  ipcMain.handle("desktop:open-markdown-files", async () => {
    const options: OpenDialogOptions = {
      filters: [
        {
          extensions: ["md", "markdown", "mdx", "txt"],
          name: "Markdown"
        }
      ],
      properties: ["openFile", "multiSelections"]
    };
    const result = mainWindow ? await dialog.showOpenDialog(mainWindow, options) : await dialog.showOpenDialog(options);

    if (result.canceled) {
      return [];
    }

    return readDesktopFiles(result.filePaths);
  });

  ipcMain.handle("desktop:save-markdown-file", async (_event, request: SaveMarkdownFileRequest) => {
    await writeFile(request.path, request.markdown, "utf8");

    return readDesktopFile(request.path);
  });

  ipcMain.handle("desktop:save-markdown-file-as", async (_event, request: SaveMarkdownFileAsRequest) => {
    const options: SaveDialogOptions = {
      defaultPath: request.suggestedName || "Untitled.md",
      filters: [
        {
          extensions: ["md", "markdown", "mdx", "txt"],
          name: "Markdown"
        }
      ]
    };
    const result = mainWindow ? await dialog.showSaveDialog(mainWindow, options) : await dialog.showSaveDialog(options);

    if (result.canceled || !result.filePath) {
      return null;
    }

    await writeFile(result.filePath, request.markdown, "utf8");

    return readDesktopFile(result.filePath);
  });
}

const hasLock = app.requestSingleInstanceLock();

if (!hasLock) {
  app.quit();
} else {
  launchFilePaths = collectMarkdownPaths(process.argv);

  app.on("second-instance", async (_event, argv) => {
    const files = await readDesktopFiles(collectMarkdownPaths(argv));
    sendFilesToRenderer(files);
  });

  app.on("open-file", (event, filePath) => {
    event.preventDefault();

    if (isMarkdownFilePath(filePath)) {
      launchFilePaths.push(filePath);
    }
  });

  app.whenReady().then(async () => {
    registerIpcHandlers();

    const baseUrl = await startNextRuntime();
    await waitForNextRuntime(baseUrl);
    await createMainWindow(baseUrl);
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("before-quit", () => {
    nextProcess?.kill();
  });
}
