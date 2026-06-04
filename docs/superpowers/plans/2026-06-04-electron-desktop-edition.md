# Electron Desktop Edition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans task-by-task 执行。步骤使用 checkbox (`- [ ]`) 语法追踪。

**Goal:** 在不移除现有 Web/PWA/SEO 入口的前提下，为 Markdownviewer 增加 Windows/macOS/Linux Electron 桌面版，提供原生窗口、文件打开、保存、文件关联、最近文件和可打包分发能力。

**Architecture:** Electron 只做薄桌面壳：`main` 进程启动本地 Next standalone runtime，`BrowserWindow` 加载 `/workspace?desktop=1`，`preload` 通过受控 IPC 暴露文件系统能力。现有 `/workspace`、PWA `launchQueue`、File System Access API、Markdown 渲染、MarkItDown `/api/convert` 继续保留；桌面端通过 adapter 增加 `desktop-file` 来源，而不是重写工作区。

**Tech Stack:** Electron、electron-builder、Next.js 16 standalone output、React 19、TypeScript strict、Vitest/jsdom、Node `fs/promises`、IPC、现有 workspace shell、现有 MarkItDown API route。

---

## 产品边界

- 桌面版是新增发行形态，不替代 `markdownviewer.run`。
- Electron 不支持 Android/iOS；移动端继续走 PWA，后续如需 App Store/Google Play 再单独评估 Capacitor。
- MVP 支持 `.md/.markdown/.mdx/.txt` 原生打开、保存、另存为、文件关联、第二次打开文件进入现有窗口的新 tab、最近文件。
- MarkItDown 转换先复用当前本地 Next runtime 的 `/api/convert`；不在第一版内置 Python、OCR、批量转换。
- 本计划不做云同步、插件系统、Obsidian vault graph、复杂多窗口编辑器。

## File Structure

- Create `electron/main.ts`: Electron app lifecycle、single instance lock、Next runtime 启动、窗口创建、文件打开事件、IPC handlers。
- Create `electron/preload.ts`: `contextBridge` 暴露受限的 `window.markdownviewerDesktop` API。
- Create `electron/tsconfig.json`: Electron main/preload 编译配置。
- Create `types/desktop-api.d.ts`: renderer 侧 `window.markdownviewerDesktop` 类型声明。
- Create `lib/workspace/desktop-bridge.ts`: 浏览器安全的 desktop adapter，负责检测 Electron、调用 IPC、订阅打开文件事件。
- Create `tests/workspace/desktop-bridge.test.ts`: adapter 单元测试。
- Create `scripts/desktop-dev.mjs`: 启动 Next dev server 并打开 Electron。
- Create `scripts/desktop-stage-next.mjs`: 将 Next standalone runtime 复制到 Electron 打包资源目录。
- Modify `next.config.ts`: 开启 `output: "standalone"`，保持 Turbopack root。
- Modify `package.json`: 增加 Electron 依赖、desktop scripts、build 配置。
- Modify `.gitignore`: 忽略 Electron 编译和打包产物。
- Modify `components/workspace/workspace-shell.tsx`: 增加 `desktop-file` tab 来源、desktop open/save handlers、启动恢复/订阅逻辑、toolbar wiring。
- Modify `components/workspace/workspace-toolbar.tsx`: 增加桌面端打开/保存/另存入口；Web/PWA 下不显示桌面专属控件。
- Modify `lib/i18n/messages.ts`: 增加英文/中文桌面端文案。
- Modify `tests/workspace/workspace-shell.test.tsx`: 覆盖桌面打开文件、新 tab、保存、另存、错误状态和 PWA 非回归。
- Modify `README.md`: 增加 Desktop Edition 开发/打包说明。

## Task 1: Electron 依赖、脚本和 standalone 基线

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`
- Modify: `.gitignore`
- Create: `electron/tsconfig.json`

- [ ] **Step 1: 修改 `package.json` 的 scripts、devDependencies 和 build 配置**

把 `scripts` 扩展为：

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "vitest run",
  "test:watch": "vitest",
  "desktop:dev": "node scripts/desktop-dev.mjs",
  "desktop:build:main": "tsc -p electron/tsconfig.json",
  "desktop:stage-next": "node scripts/desktop-stage-next.mjs",
  "desktop:dist": "npm run build && npm run desktop:build:main && npm run desktop:stage-next && electron-builder --win nsis --x64",
  "desktop:dist:dir": "npm run build && npm run desktop:build:main && npm run desktop:stage-next && electron-builder --dir"
}
```

在 `devDependencies` 增加：

```json
{
  "electron": "^42.3.3",
  "electron-builder": "^26.8.1"
}
```

在 `package.json` 顶层增加：

```json
{
  "main": "dist-electron/main.js",
  "build": {
    "appId": "run.markdownviewer.desktop",
    "productName": "Markdownviewer",
    "files": [
      "dist-electron/**/*",
      "package.json"
    ],
    "extraResources": [
      {
        "from": "desktop-runtime",
        "to": "desktop-runtime"
      }
    ],
    "directories": {
      "output": "release"
    },
    "win": {
      "target": [
        "nsis"
      ]
    },
    "nsis": {
      "oneClick": false,
      "perMachine": false,
      "allowToChangeInstallationDirectory": true
    },
    "fileAssociations": [
      {
        "ext": [
          "md",
          "markdown",
          "mdx",
          "txt"
        ],
        "name": "Markdown document",
        "role": "Editor"
      }
    ]
  }
}
```

- [ ] **Step 2: 让 Next 产出 standalone runtime**

修改 `next.config.ts`：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
```

- [ ] **Step 3: 忽略 Electron 产物**

在 `.gitignore` 增加：

```gitignore
dist-electron/
desktop-runtime/
release/
```

- [ ] **Step 4: 创建 Electron TypeScript 配置**

创建 `electron/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "../dist-electron",
    "rootDir": ".",
    "types": ["node", "electron"]
  },
  "include": ["*.ts"]
}
```

- [ ] **Step 5: 安装依赖并验证基线**

Run:

```powershell
npm install
npm run build
npm run desktop:build:main
```

Expected:

```text
next build succeeds
tsc fails only until electron/main.ts and electron/preload.ts are added in Task 2
```

- [ ] **Step 6: Commit Task 1**

```bash
git add package.json package-lock.json next.config.ts .gitignore electron/tsconfig.json
git commit -m "chore: prepare electron desktop build"
```

## Task 2: Electron main/preload 和本地 Next runtime

**Files:**
- Create: `electron/main.ts`
- Create: `electron/preload.ts`
- Create: `scripts/desktop-dev.mjs`
- Create: `scripts/desktop-stage-next.mjs`

- [ ] **Step 1: 创建受控 preload API**

创建 `electron/preload.ts`：

```ts
import { contextBridge, ipcRenderer } from "electron";

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
    ipcRenderer.invoke("desktop:save-markdown-file-as", { markdown, suggestedName }) as Promise<DesktopFileSnapshot | null>,
  onOpenFiles: (callback: (files: DesktopFileSnapshot[]) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, files: DesktopFileSnapshot[]) => callback(files);

    ipcRenderer.on("desktop:open-files", listener);

    return () => {
      ipcRenderer.removeListener("desktop:open-files", listener);
    };
  }
};

contextBridge.exposeInMainWorld("markdownviewerDesktop", api);
```

- [ ] **Step 2: 创建 Electron main 进程**

创建 `electron/main.ts`：

```ts
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { basename, extname, join } from "node:path";
import { readFile, stat, writeFile } from "node:fs/promises";

type DesktopFileSnapshot = {
  path: string;
  name: string;
  markdown: string;
  lastModified: number;
};

const markdownExtensions = new Set([".md", ".markdown", ".mdx", ".txt"]);
let mainWindow: BrowserWindow | null = null;
let nextProcess: ChildProcess | null = null;
let launchFilePaths: string[] = [];
let nextPort = 0;

function isMarkdownFilePath(filePath: string) {
  return markdownExtensions.has(extname(filePath).toLowerCase());
}

function collectMarkdownPaths(argv: string[]) {
  return argv.filter((value) => isMarkdownFilePath(value));
}

async function readDesktopFile(filePath: string): Promise<DesktopFileSnapshot> {
  const [markdown, stats] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);

  return {
    path: filePath,
    name: basename(filePath),
    markdown,
    lastModified: stats.mtimeMs
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
  nextPort = await findFreePort();

  if (!app.isPackaged && process.env.MARKDOWNVIEWER_NEXT_DEV_URL) {
    return process.env.MARKDOWNVIEWER_NEXT_DEV_URL;
  }

  const runtimeRoot = getRuntimeRoot();
  const serverPath = app.isPackaged ? join(runtimeRoot, "server.js") : join(process.cwd(), ".next", "standalone", "server.js");

  nextProcess = spawn(process.execPath, [serverPath], {
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

async function createMainWindow(baseUrl: string) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: "Markdownviewer",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, "preload.js")
    }
  });

  await mainWindow.loadURL(`${baseUrl}/workspace?desktop=1`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function sendFilesToRenderer(files: DesktopFileSnapshot[]) {
  if (mainWindow && files.length > 0) {
    mainWindow.webContents.send("desktop:open-files", files);
    mainWindow.focus();
  }
}

function registerIpcHandlers() {
  ipcMain.handle("desktop:get-launch-files", async () => {
    const files = await readDesktopFiles(launchFilePaths);
    launchFilePaths = [];

    return files;
  });

  ipcMain.handle("desktop:open-markdown-files", async () => {
    const result = await dialog.showOpenDialog(mainWindow ?? undefined, {
      properties: ["openFile", "multiSelections"],
      filters: [
        {
          name: "Markdown",
          extensions: ["md", "markdown", "mdx", "txt"]
        }
      ]
    });

    if (result.canceled) {
      return [];
    }

    return readDesktopFiles(result.filePaths);
  });

  ipcMain.handle("desktop:save-markdown-file", async (_event, request: { path: string; markdown: string }) => {
    await writeFile(request.path, request.markdown, "utf8");

    return readDesktopFile(request.path);
  });

  ipcMain.handle(
    "desktop:save-markdown-file-as",
    async (_event, request: { markdown: string; suggestedName: string }) => {
      const result = await dialog.showSaveDialog(mainWindow ?? undefined, {
        defaultPath: request.suggestedName || "Untitled.md",
        filters: [
          {
            name: "Markdown",
            extensions: ["md", "markdown", "mdx", "txt"]
          }
        ]
      });

      if (result.canceled || !result.filePath) {
        return null;
      }

      await writeFile(result.filePath, request.markdown, "utf8");

      return readDesktopFile(result.filePath);
    }
  );
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
```

- [ ] **Step 3: 创建开发启动脚本**

创建 `scripts/desktop-dev.mjs`：

```js
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = process.env.PORT || "3030";

function run(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options
  });
}

const next = run("npm", ["run", "dev", "--", "-p", port]);

await delay(3500);

const electron = run("npm", ["run", "desktop:build:main"], {
  stdio: "inherit"
});

electron.on("exit", (code) => {
  if (code !== 0) {
    next.kill();
    process.exit(code ?? 1);
  }

  const app = run("npx", ["electron", "."], {
    env: {
      ...process.env,
      MARKDOWNVIEWER_NEXT_DEV_URL: `http://127.0.0.1:${port}`
    }
  });

  app.on("exit", (appCode) => {
    next.kill();
    process.exit(appCode ?? 0);
  });
});
```

- [ ] **Step 4: 创建 standalone staging 脚本**

创建 `scripts/desktop-stage-next.mjs`：

```js
import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const runtime = join(root, "desktop-runtime");

await rm(runtime, { force: true, recursive: true });
await mkdir(runtime, { recursive: true });

await cp(join(root, ".next", "standalone"), runtime, { recursive: true });
await mkdir(join(runtime, ".next"), { recursive: true });
await cp(join(root, ".next", "static"), join(runtime, ".next", "static"), { recursive: true });
await cp(join(root, "public"), join(runtime, "public"), { recursive: true });
```

- [ ] **Step 5: 验证 Electron 编译**

Run:

```powershell
npm run desktop:build:main
```

Expected:

```text
electron/main.ts and electron/preload.ts compile to dist-electron/main.js and dist-electron/preload.js
```

- [ ] **Step 6: Commit Task 2**

```bash
git add electron/main.ts electron/preload.ts scripts/desktop-dev.mjs scripts/desktop-stage-next.mjs
git commit -m "feat: add electron shell runtime"
```

## Task 3: Renderer Desktop Bridge

**Files:**
- Create: `types/desktop-api.d.ts`
- Create: `lib/workspace/desktop-bridge.ts`
- Create: `tests/workspace/desktop-bridge.test.ts`

- [ ] **Step 1: 写 adapter 失败测试**

创建 `tests/workspace/desktop-bridge.test.ts`：

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getDesktopBridge,
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
      isDesktop: true,
      getLaunchFiles: vi.fn(),
      openMarkdownFiles: vi.fn(),
      saveMarkdownFile: vi.fn(),
      saveMarkdownFileAs: vi.fn(),
      onOpenFiles: vi.fn()
    };

    Object.defineProperty(window, "markdownviewerDesktop", {
      configurable: true,
      value: bridge
    });

    expect(isDesktopBridgeAvailable()).toBe(true);
    expect(getDesktopBridge()).toBe(bridge);
  });

  it("builds stable desktop source input from native file paths", () => {
    expect(normalizeDesktopFileSourceInput("D:\\GitHub\\demo\\README.md")).toBe(
      "desktop:D:/GitHub/demo/README.md"
    );
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```powershell
npm test -- tests/workspace/desktop-bridge.test.ts
```

Expected:

```text
FAIL because lib/workspace/desktop-bridge.ts does not exist
```

- [ ] **Step 3: 增加 renderer 类型声明**

创建 `types/desktop-api.d.ts`：

```ts
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
```

- [ ] **Step 4: 实现 desktop bridge**

创建 `lib/workspace/desktop-bridge.ts`：

```ts
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
```

- [ ] **Step 5: 验证 adapter 测试通过**

Run:

```powershell
npm test -- tests/workspace/desktop-bridge.test.ts
```

Expected:

```text
PASS tests/workspace/desktop-bridge.test.ts
```

- [ ] **Step 6: Commit Task 3**

```bash
git add types/desktop-api.d.ts lib/workspace/desktop-bridge.ts tests/workspace/desktop-bridge.test.ts
git commit -m "feat: add desktop renderer bridge"
```

## Task 4: Workspace 桌面文件打开和 tab 来源

**Files:**
- Modify: `components/workspace/workspace-shell.tsx`
- Modify: `lib/i18n/messages.ts`
- Modify: `tests/workspace/workspace-shell.test.tsx`

- [ ] **Step 1: 写桌面启动文件打开测试**

在 `tests/workspace/workspace-shell.test.tsx` 追加：

```ts
it("opens Electron launch files as desktop-backed workspace tabs", async () => {
  Object.defineProperty(window, "markdownviewerDesktop", {
    configurable: true,
    value: {
      isDesktop: true,
      getLaunchFiles: vi.fn().mockResolvedValue([
        {
          path: "D:\\Docs\\README.md",
          name: "README.md",
          markdown: "# Desktop README",
          lastModified: 1000
        }
      ]),
      openMarkdownFiles: vi.fn(),
      saveMarkdownFile: vi.fn(),
      saveMarkdownFileAs: vi.fn(),
      onOpenFiles: vi.fn().mockReturnValue(() => undefined)
    }
  });

  render(<WorkspaceShell markdown="" sourceInput="" />);

  await waitFor(() => {
    expect(screen.getByRole("tab", { name: /desktop readme/i })).toHaveAttribute("aria-selected", "true");
  });
  expect(within(screen.getByTestId("preview-panel")).getByRole("heading", { name: "Desktop README" })).toBeInTheDocument();
  expect(screen.getAllByText("desktop:D:/Docs/README.md").length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: 写 second-instance 打开文件测试**

继续追加：

```ts
it("opens Electron file events into new tabs without replacing existing Markdown", async () => {
  let openFilesCallback: ((files: Array<{ path: string; name: string; markdown: string; lastModified: number }>) => void) | null =
    null;

  Object.defineProperty(window, "markdownviewerDesktop", {
    configurable: true,
    value: {
      isDesktop: true,
      getLaunchFiles: vi.fn().mockResolvedValue([]),
      openMarkdownFiles: vi.fn(),
      saveMarkdownFile: vi.fn(),
      saveMarkdownFileAs: vi.fn(),
      onOpenFiles: vi.fn((callback) => {
        openFilesCallback = callback;
        return () => undefined;
      })
    }
  });

  render(<WorkspaceShell markdown="# Existing" sourceInput="" />);

  await waitFor(() => {
    expect(openFilesCallback).toBeTypeOf("function");
  });

  openFilesCallback?.([
    {
      path: "D:\\Docs\\Guide.md",
      name: "Guide.md",
      markdown: "# Desktop Guide",
      lastModified: 2000
    }
  ]);

  await waitFor(() => {
    expect(screen.getByRole("tab", { name: /desktop guide/i })).toHaveAttribute("aria-selected", "true");
  });
  expect(screen.getByRole("tab", { name: /existing/i })).toBeInTheDocument();
});
```

- [ ] **Step 3: 运行测试确认失败**

Run:

```powershell
npm test -- tests/workspace/workspace-shell.test.tsx -t "Electron"
```

Expected:

```text
FAIL because WorkspaceShell does not consume window.markdownviewerDesktop yet
```

- [ ] **Step 4: 扩展 workspace source 类型**

在 `components/workspace/workspace-shell.tsx` 中把 source kind 扩展为：

```ts
type WorkspaceSourceKind = "draft" | "file-import" | "remote-url" | "folder-file" | "converted-file" | "desktop-file";
```

在 `WorkspaceTab` 增加：

```ts
  desktopFilePath?: string;
  desktopLastModified?: number;
```

在 tab restore parser 允许：

```ts
record.sourceKind === "desktop-file"
```

并读取：

```ts
const desktopFilePath = typeof record.desktopFilePath === "string" ? record.desktopFilePath : undefined;
const desktopLastModified = typeof record.desktopLastModified === "number" ? record.desktopLastModified : undefined;
```

返回 tab 时带上：

```ts
desktopFilePath,
desktopLastModified,
```

- [ ] **Step 5: 引入 desktop bridge 并添加打开逻辑**

在 `components/workspace/workspace-shell.tsx` 顶部增加：

```ts
import {
  getDesktopBridge,
  getDesktopFileTabTitle,
  normalizeDesktopFileSourceInput
} from "@/lib/workspace/desktop-bridge";
import type { DesktopFileSnapshot } from "@/types/desktop-api";
```

在组件内部增加函数：

```ts
function openDesktopFiles(files: DesktopFileSnapshot[]) {
  if (files.length === 0) {
    return;
  }

  const nextTabs = files.map((file) => ({
    id: createWorkspaceTabId(),
    title: getDesktopFileTabTitle(file),
    markdown: file.markdown,
    sourceInput: normalizeDesktopFileSourceInput(file.path),
    sourceKind: "desktop-file" as const,
    desktopFilePath: file.path,
    desktopLastModified: file.lastModified,
    savedMarkdownHash: hashMarkdown(file.markdown)
  }));

  setWorkspaceTabs((currentTabs) => [...currentTabs, ...nextTabs]);
  setActiveTabId(nextTabs[nextTabs.length - 1]?.id ?? null);
  setStatus(messages.status.loadedFile(nextTabs[nextTabs.length - 1]?.title ?? "Markdown file"));
}
```

如果当前文件没有 `hashMarkdown` 可复用，先从 `lib/workspace/folder-documents.ts` 导入：

```ts
import { hashMarkdown } from "@/lib/workspace/folder-documents";
```

- [ ] **Step 6: 订阅 Electron 启动文件和二次打开事件**

在 `WorkspaceShell` 中添加 effect：

```ts
useEffect(() => {
  const bridge = getDesktopBridge();

  if (!bridge) {
    return undefined;
  }

  let disposed = false;

  bridge
    .getLaunchFiles()
    .then((files) => {
      if (!disposed) {
        openDesktopFiles(files);
      }
    })
    .catch(() => {
      if (!disposed) {
        setStatus(messages.status.loadFailed);
      }
    });

  const unsubscribe = bridge.onOpenFiles((files) => {
    openDesktopFiles(files);
  });

  return () => {
    disposed = true;
    unsubscribe();
  };
}, [messages.status]);
```

- [ ] **Step 7: 增加 i18n 文案**

在 `lib/i18n/messages.ts` 的 workspace status 增加：

```ts
desktopSaved: (fileName: string) => string;
desktopSaveFailed: string;
desktopUnavailable: string;
```

英文：

```ts
desktopSaved: (fileName) => `Saved ${fileName}.`,
desktopSaveFailed: "Could not save this desktop file.",
desktopUnavailable: "Desktop features are only available in the installed app.",
```

中文：

```ts
desktopSaved: (fileName) => `已保存 ${fileName}。`,
desktopSaveFailed: "无法保存这个桌面文件。",
desktopUnavailable: "桌面能力仅在已安装的应用中可用。",
```

- [ ] **Step 8: 验证打开文件测试**

Run:

```powershell
npm test -- tests/workspace/workspace-shell.test.tsx -t "Electron"
```

Expected:

```text
PASS Electron launch files and second-instance file events open as tabs
```

- [ ] **Step 9: Commit Task 4**

```bash
git add components/workspace/workspace-shell.tsx lib/i18n/messages.ts tests/workspace/workspace-shell.test.tsx
git commit -m "feat: open desktop files in workspace tabs"
```

## Task 5: 桌面打开、保存和另存 toolbar

**Files:**
- Modify: `components/workspace/workspace-toolbar.tsx`
- Modify: `components/workspace/workspace-shell.tsx`
- Modify: `lib/i18n/messages.ts`
- Modify: `tests/workspace/workspace-shell.test.tsx`

- [ ] **Step 1: 写桌面保存测试**

在 `tests/workspace/workspace-shell.test.tsx` 追加：

```ts
it("saves an active desktop-backed tab through Electron IPC", async () => {
  const user = userEvent.setup();
  const saveMarkdownFile = vi.fn().mockResolvedValue({
    path: "D:\\Docs\\README.md",
    name: "README.md",
    markdown: "# Edited README",
    lastModified: 3000
  });

  Object.defineProperty(window, "markdownviewerDesktop", {
    configurable: true,
    value: {
      isDesktop: true,
      getLaunchFiles: vi.fn().mockResolvedValue([
        {
          path: "D:\\Docs\\README.md",
          name: "README.md",
          markdown: "# README",
          lastModified: 1000
        }
      ]),
      openMarkdownFiles: vi.fn(),
      saveMarkdownFile,
      saveMarkdownFileAs: vi.fn(),
      onOpenFiles: vi.fn().mockReturnValue(() => undefined)
    }
  });

  render(<WorkspaceShell markdown="" sourceInput="" />);

  await waitFor(() => {
    expect(screen.getByRole("tab", { name: /readme/i })).toHaveAttribute("aria-selected", "true");
  });

  await user.click(screen.getByRole("button", { name: /save/i }));

  expect(saveMarkdownFile).toHaveBeenCalledWith({
    path: "D:\\Docs\\README.md",
    markdown: expect.any(String)
  });
});
```

- [ ] **Step 2: 写桌面打开按钮测试**

继续追加：

```ts
it("opens Markdown files from the desktop toolbar", async () => {
  const user = userEvent.setup();
  const openMarkdownFiles = vi.fn().mockResolvedValue([
    {
      path: "D:\\Docs\\Toolbar.md",
      name: "Toolbar.md",
      markdown: "# Toolbar Open",
      lastModified: 4000
    }
  ]);

  Object.defineProperty(window, "markdownviewerDesktop", {
    configurable: true,
    value: {
      isDesktop: true,
      getLaunchFiles: vi.fn().mockResolvedValue([]),
      openMarkdownFiles,
      saveMarkdownFile: vi.fn(),
      saveMarkdownFileAs: vi.fn(),
      onOpenFiles: vi.fn().mockReturnValue(() => undefined)
    }
  });

  render(<WorkspaceShell markdown="" sourceInput="" />);

  await user.click(screen.getByRole("button", { name: /open desktop file/i }));

  expect(openMarkdownFiles).toHaveBeenCalled();
  await waitFor(() => {
    expect(screen.getByRole("tab", { name: /toolbar/i })).toHaveAttribute("aria-selected", "true");
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

Run:

```powershell
npm test -- tests/workspace/workspace-shell.test.tsx -t "desktop toolbar|saves an active desktop"
```

Expected:

```text
FAIL because toolbar has no desktop open/save wiring
```

- [ ] **Step 4: 增加 toolbar props 和按钮**

在 `components/workspace/workspace-toolbar.tsx` 的 props 增加：

```ts
  isDesktop: boolean;
  canSaveDesktopFile: boolean;
  onOpenDesktopFiles: () => void;
  onSaveDesktopFile: () => void;
  onSaveDesktopFileAs: () => void;
```

在 toolbar 按钮区增加：

```tsx
{isDesktop ? (
  <>
    <button
      aria-label={messages.openDesktopFile}
      className="toolbar-button"
      onClick={onOpenDesktopFiles}
      type="button"
    >
      <FileUp aria-hidden="true" size={16} strokeWidth={2} />
      <span>{messages.openDesktopFile}</span>
    </button>
    <button
      aria-label={messages.saveDesktopFile}
      className="toolbar-button"
      disabled={!canSaveDesktopFile}
      onClick={onSaveDesktopFile}
      type="button"
    >
      <Save aria-hidden="true" size={16} strokeWidth={2} />
      <span>{messages.saveDesktopFile}</span>
    </button>
    <button
      aria-label={messages.saveDesktopFileAs}
      className="toolbar-button"
      onClick={onSaveDesktopFileAs}
      type="button"
    >
      <Save aria-hidden="true" size={16} strokeWidth={2} />
      <span>{messages.saveDesktopFileAs}</span>
    </button>
  </>
) : null}
```

- [ ] **Step 5: 增加 toolbar 文案类型和值**

在 `lib/i18n/messages.ts` 的 toolbar 增加：

```ts
openDesktopFile: string;
saveDesktopFile: string;
saveDesktopFileAs: string;
```

英文：

```ts
openDesktopFile: "Open desktop file",
saveDesktopFile: "Save",
saveDesktopFileAs: "Save as",
```

中文：

```ts
openDesktopFile: "打开桌面文件",
saveDesktopFile: "保存",
saveDesktopFileAs: "另存为",
```

- [ ] **Step 6: 在 WorkspaceShell 实现 handlers**

在 `WorkspaceShell` 中增加：

```ts
const desktopBridge = getDesktopBridge();
const isDesktop = Boolean(desktopBridge);
const canSaveDesktopFile = activeTab?.sourceKind === "desktop-file" && Boolean(activeTab.desktopFilePath);

async function openDesktopFilesFromToolbar() {
  const bridge = getDesktopBridge();

  if (!bridge) {
    setStatus(messages.status.desktopUnavailable);
    return;
  }

  try {
    openDesktopFiles(await bridge.openMarkdownFiles());
  } catch {
    setStatus(messages.status.loadFailed);
  }
}

async function saveDesktopFile() {
  const bridge = getDesktopBridge();

  if (!bridge || activeTab?.sourceKind !== "desktop-file" || !activeTab.desktopFilePath) {
    setStatus(messages.status.desktopUnavailable);
    return;
  }

  try {
    const saved = await bridge.saveMarkdownFile({
      path: activeTab.desktopFilePath,
      markdown: currentMarkdown
    });

    updateActiveTab({
      markdown: saved.markdown,
      desktopLastModified: saved.lastModified,
      savedMarkdownHash: hashMarkdown(saved.markdown)
    });
    setStatus(messages.status.desktopSaved(saved.name));
  } catch {
    setStatus(messages.status.desktopSaveFailed);
  }
}

async function saveDesktopFileAs() {
  const bridge = getDesktopBridge();

  if (!bridge) {
    setStatus(messages.status.desktopUnavailable);
    return;
  }

  try {
    const saved = await bridge.saveMarkdownFileAs(currentMarkdown, activeTab?.title ?? "Untitled.md");

    if (saved) {
      openDesktopFiles([saved]);
      setStatus(messages.status.desktopSaved(saved.name));
    }
  } catch {
    setStatus(messages.status.desktopSaveFailed);
  }
}
```

如果没有 `updateActiveTab` helper，则使用现有 `setWorkspaceTabs` 模式更新 `activeTabId` 对应 tab。

- [ ] **Step 7: 把 props 传给 WorkspaceToolbar**

在 `WorkspaceShell` 渲染 `WorkspaceToolbar` 时增加：

```tsx
isDesktop={isDesktop}
canSaveDesktopFile={canSaveDesktopFile}
onOpenDesktopFiles={openDesktopFilesFromToolbar}
onSaveDesktopFile={saveDesktopFile}
onSaveDesktopFileAs={saveDesktopFileAs}
```

- [ ] **Step 8: 验证桌面 toolbar 测试**

Run:

```powershell
npm test -- tests/workspace/workspace-shell.test.tsx -t "desktop toolbar|saves an active desktop"
```

Expected:

```text
PASS desktop toolbar can open and save files through the preload bridge
```

- [ ] **Step 9: Commit Task 5**

```bash
git add components/workspace/workspace-toolbar.tsx components/workspace/workspace-shell.tsx lib/i18n/messages.ts tests/workspace/workspace-shell.test.tsx
git commit -m "feat: add desktop workspace file actions"
```

## Task 6: 打包资源、文件关联和 Windows 验证

**Files:**
- Modify: `electron/main.ts`
- Modify: `package.json`
- Modify: `README.md`

- [ ] **Step 1: 补 Windows 安装包元数据**

在 `package.json` 的 `build.win` 增加图标占位路径；如果没有 `.ico`，先使用后续可替换的 `public/icon.svg` 不参与 Windows 图标配置，避免无效路径导致打包失败：

```json
{
  "win": {
    "target": ["nsis"]
  }
}
```

如果新增 `public/icon.ico`，再改为：

```json
{
  "win": {
    "target": ["nsis"],
    "icon": "public/icon.ico"
  }
}
```

- [ ] **Step 2: 确保 packaged runtime 路径可启动**

在 `electron/main.ts` 的 `startNextRuntime()` 后增加本地健康等待：

```ts
async function waitForNextRuntime(baseUrl: string) {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/workspace`);

      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  throw new Error("Next runtime did not become ready.");
}
```

并在 `createMainWindow` 前调用：

```ts
const baseUrl = await startNextRuntime();
await waitForNextRuntime(baseUrl);
await createMainWindow(baseUrl);
```

- [ ] **Step 3: 记录 Desktop Edition 开发命令**

在 `README.md` 增加：

````md
## Desktop Edition

Markdownviewer keeps the hosted Web/PWA app as the main public entry point. The Electron desktop edition adds native file open/save, OS file association, and packaged Windows/macOS/Linux distribution around the same `/workspace` experience.

Development:

```bash
npm run desktop:dev
```

Windows directory build:

```bash
npm run desktop:dist:dir
```

Windows installer:

```bash
npm run desktop:dist
```

The desktop app starts a local Next standalone runtime and loads `/workspace?desktop=1` inside Electron. The renderer does not get Node access directly; all native file access goes through the preload bridge.
````

- [ ] **Step 4: 生成 staged runtime**

Run:

```powershell
npm run build
npm run desktop:build:main
npm run desktop:stage-next
```

Expected:

```text
desktop-runtime/server.js exists
desktop-runtime/.next/static exists
desktop-runtime/public exists
```

- [ ] **Step 5: 打目录包验证**

Run:

```powershell
npm run desktop:dist:dir
```

Expected:

```text
release/win-unpacked/Markdownviewer.exe exists
```

- [ ] **Step 6: 手动验收 Windows 桌面版**

Run:

```powershell
.\release\win-unpacked\Markdownviewer.exe
```

Expected:

```text
Electron window opens /workspace
Open desktop file opens a .md file into a tab
Save writes changes back to disk
Save as creates a new Markdown file
Existing Web/PWA file import still works
```

- [ ] **Step 7: Commit Task 6**

```bash
git add electron/main.ts package.json README.md
git commit -m "chore: document and verify desktop packaging"
```

## Task 7: 回归测试和发布前检查

**Files:**
- Modify only if previous tests expose regressions.

- [ ] **Step 1: 运行 focused workspace tests**

Run:

```powershell
npm test -- tests/workspace/desktop-bridge.test.ts tests/workspace/workspace-shell.test.tsx
```

Expected:

```text
PASS desktop bridge tests
PASS workspace shell tests, including existing drag/drop, launchQueue, folder-link, conversion tests
```

- [ ] **Step 2: 运行 PWA manifest 非回归测试**

Run:

```powershell
npm test -- tests/pwa/manifest.test.ts
```

Expected:

```text
PASS manifest still exposes Markdown file_handlers for the Web/PWA app
```

- [ ] **Step 3: 运行完整测试**

Run:

```powershell
npm test
```

Expected:

```text
PASS all tests
```

如果 full Vitest 在 workspace shell timing 上 flaky，先运行失败的单测文件和失败的 `-t` case；只有 focused 失败时才改产品代码。

- [ ] **Step 4: 运行 Web build**

Run:

```powershell
npm run build
```

Expected:

```text
Next production build succeeds
```

- [ ] **Step 5: 运行 Electron directory build**

Run:

```powershell
npm run desktop:dist:dir
```

Expected:

```text
Electron directory package succeeds and contains Markdownviewer.exe on Windows
```

- [ ] **Step 6: 最终人工验收清单**

在 Windows 上确认：

```text
1. Desktop app starts without requiring network.
2. /workspace UI loads, existing sample Markdown renders.
3. Open desktop file opens .md/.markdown/.mdx/.txt.
4. Opening another file while app is already running creates a new tab in the same window.
5. Save writes back to the original file.
6. Save as creates a new file and opens it as desktop-file tab.
7. Existing browser file upload still works.
8. PWA launchQueue tests still pass.
9. /, /workspace, /zh-CN, SEO landing pages still build for the Web app.
```

- [ ] **Step 7: Commit final verification notes if docs changed**

```bash
git add README.md docs/superpowers/plans/2026-06-04-electron-desktop-edition.md
git commit -m "docs: add electron desktop implementation plan"
```

## Execution Notes

- 执行实现时建议使用独立 worktree，避免影响当前 `main` 上的 Web/PWA 修复。
- 每个 Task 完成后先跑对应 focused tests，再 commit。
- 不要为了 Electron 删除 `public/manifest.webmanifest`、`launchQueue`、File System Access API 或 SEO landing pages。
- 如果 Electron 打包遇到 `markitdown` 缺失，第一版只记录为转换功能降级；不要在 MVP 内临时塞 Python runtime。
- 如果 Next standalone server 在 packaged app 中路径异常，优先修 `scripts/desktop-stage-next.mjs` 和 `getRuntimeRoot()`，不要把 renderer 改成 Node-enabled。

## Self-Review

- Spec coverage: 计划覆盖了桌面壳、本地 Next runtime、preload bridge、workspace adapter、打开/保存/另存、文件关联、打包和验证。
- Placeholder scan: 文档没有遗留占位项；每个改代码步骤都给出目标文件和具体代码形状。
- Type consistency: `DesktopFileSnapshot`、`SaveDesktopFileRequest`、`window.markdownviewerDesktop`、`desktop-file`、`normalizeDesktopFileSourceInput()` 在各任务中命名一致。
