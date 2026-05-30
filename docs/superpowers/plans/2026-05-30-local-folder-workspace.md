# Markdownviewer 本地文件夹工作区 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans task-by-task 执行。步骤使用 checkbox (`- [ ]`) 语法追踪。

**Goal:** 基于 PRD 在现有 `/workspace` 中实现完整 MVP：打开本地文件夹、文件树、搜索、文件打开、保存回磁盘、新建文件、本地 Markdown 链接跳转、权限/降级/PWA 打磨。

**Architecture:** 文件系统能力集中在 `lib/workspace/folder-*`，React UI 只消费稳定的 folder session 状态。`WorkspaceShell` 继续持有当前 Markdown 编辑源，但扩展 tab metadata 来区分普通草稿、远程导入和本地文件夹来源。预览、outline、导出、分享复用现有能力。

**Tech Stack:** Next.js 16、React 19、TypeScript strict、Vitest/jsdom、原生 File System Access API、IndexedDB、现有 PWA service worker。

---

## 1. 核心接口与模块

- [x] 新增最小类型声明：`types/file-system-access.d.ts`，只声明本功能用到的 `showDirectoryPicker`、`FileSystemDirectoryHandle`、`FileSystemFileHandle`、`queryPermission`、`requestPermission`、`createWritable`。
- [x] 新增 `lib/workspace/folder-capabilities.ts`：导出 `getFolderCapability()`、`queryFolderPermission(handle)`、`requestFolderPermission(handle)`；状态固定为 `unsupported | prompt | granted | denied`。
- [x] 新增 `lib/workspace/folder-paths.ts`：导出 `normalizeFolderPath()`、`joinFolderPath()`、`resolveMarkdownLink()`；统一使用 `/docs/guide.md` 这种根相对路径，阻止 `..` 越过根目录。
- [x] 新增 `lib/workspace/folder-scan.ts`：递归扫描 `.md/.markdown/.mdx/.txt`，忽略 `.git/node_modules/.next/dist/build/vendor` 和隐藏目录；默认 `maxDepth=8`、`maxFiles=500`，返回 `partial` 和 `skippedCount`。
- [x] 新增 `lib/workspace/folder-handles.ts`：用 IndexedDB 保存/读取/清除 root directory handle；store 名称固定为 `markdownviewer-folder-workspace-v1`，key 固定为 `root`.
- [x] 新增 `lib/workspace/folder-documents.ts`：读文件、写文件、创建 `Untitled.md` 冲突后缀、计算简单 `hashMarkdown(markdown)`；文件内容沿用现有 `maxImportedMarkdownCharacters` 限制。

## 2. Workspace 集成

- [x] 扩展 `WorkspaceTab`：增加 `sourceKind?: "draft" | "file-import" | "remote-url" | "folder-file"`、`folderFilePath?: string`、`folderLastModified?: number`、`savedMarkdownHash?: string`、`hasExplicitSave?: boolean`。
- [x] 保持 `sourceInput` 向后兼容；本地文件夹文件使用 `folder:/docs/guide.md`，并在 `describeSource()` 中显示文件名或 `本地文件夹`。
- [x] 在 `WorkspaceToolbar` 增加 `openFolder` 和 `saveToDisk` 入口：导入菜单里始终显示 `打开文件夹`；不支持 API 时点击后只设置状态文案，不抛错。
- [x] 新增 `components/workspace/folder-rail.tsx`：在现有左侧 rail 中显示文件夹名、重连/新建/搜索按钮、文件树；未打开文件夹时继续显示现有 tabs。
- [x] `WorkspaceShell` 增加 folder session 状态：`folderRootName`、`folderFiles`、`folderOpen`、`folderPermission`、`folderPartial`、`folderSearchOpen`、`saveState`。
- [x] 打开文件夹流程：点击 `打开文件夹` → `showDirectoryPicker({ mode: "readwrite" })` → 请求权限 → 存 IndexedDB → 扫描 → 显示文件树 → 状态提示。
- [x] 启动恢复流程：如果 IndexedDB 有 root handle，先 `queryPermission`；granted 则扫描，prompt/denied 则显示 `重新连接文件夹`，不自动弹权限框。

## 3. 文件打开、保存、新建

- [x] 文件树点击打开文件：如果当前 folder-backed tab dirty，弹出保存/放弃/取消；保存失败则保持当前文档不切换。
- [x] 打开成功后把文件内容写入当前 tab，设置 `sourceKind="folder-file"`、`folderFilePath`、`folderLastModified`、`savedMarkdownHash`，并复用现有 editor/preview/outline。
- [x] `Ctrl+S` / `Cmd+S` 只在 folder-backed tab 上写回磁盘；其它来源保持现有浏览器默认阻止并显示“当前文档不是本地文件夹文件”。
- [x] 写回前调用 `fileHandle.getFile()` 比较 `lastModified`；外部变更时用确认对话框让用户选择覆盖或取消，本 MVP 不做三方 merge。
- [x] 首次显式保存成功后开启 1200ms debounce 自动保存；保存状态固定为 `idle | dirty | saving | saved | failed | conflict`。
- [x] 新建文件：在根目录或当前选中文件所在目录创建 `Untitled.md`，冲突递增 `Untitled 2.md`；内容为 `# Untitled`，创建后立即打开并标记已保存。
- [x] 写入失败时：保留当前 Markdown 到现有 localStorage 草稿和 tabs storage，状态显示保存失败，并继续允许 HTML/PDF/分享导出。

## 4. 搜索、链接、PWA 与文案

- [x] 文件搜索：新增命令面板，`Ctrl+K/Cmd+K` 在 folder open 时打开文件搜索；按文件名 substring 排序，先不引入新依赖。
- [x] `MarkdownRenderer` 增加可选 `onLinkClick(href)`；Workspace 中只拦截相对 Markdown 链接，外部 `http(s)` 保持默认。
- [x] 本地链接解析：支持 `docs/a.md`、`../a.md`、`./a.md`、`a.md#heading`；文件不存在时显示非阻塞状态。
- [x] i18n：在 `lib/i18n/messages.ts` 同步补齐英文和中文文案，至少包含打开文件夹、重新连接、新建文件、保存状态、浏览器不支持、扫描过大、文件不存在、外部变更冲突。
- [x] PWA：确认 `public/sw.js` 缓存 `/workspace`、`/zh-CN/workspace` 和静态资源；如静态缓存策略变化，将 cacheName 升到 `markdownviewer-pwa-v2`。
- [x] README：用中文优先补一段本地文件夹模式说明，同时保留必要英文 SEO 术语；明确 Chrome/Edge 桌面支持和 Safari/Firefox/mobile 降级。

## 5. 测试计划

- [x] 单元测试：
  - `tests/workspace/folder-capabilities.test.ts`
  - `tests/workspace/folder-paths.test.ts`
  - `tests/workspace/folder-scan.test.ts`
  - `tests/workspace/folder-documents.test.ts`
- [x] 组件测试：
  - `WorkspaceToolbar` 显示 `打开文件夹`， unsupported 时点击显示降级状态。
  - `WorkspaceShell` mock `showDirectoryPicker` 后渲染文件树、打开文件、切换文件。
  - dirty folder-backed tab 切换文件时触发保存/放弃/取消保护。
  - `Ctrl+S` 写回 mock file handle，并更新 saved 状态。
  - 新建文件使用冲突后缀并立即打开。
  - 本地 Markdown 链接打开另一个 folder file；缺失链接显示状态。
- [x] PWA/回归测试：
  - `tests/pwa/manifest.test.ts` 继续通过。
  - `tests/workspace/workspace-shell.test.tsx` 现有 tabs、导入、分享、导出、PWA launch queue 测试不退化。
- [x] 执行命令：
  - `npm test -- tests/workspace/folder-capabilities.test.ts tests/workspace/folder-paths.test.ts tests/workspace/folder-scan.test.ts tests/workspace/folder-documents.test.ts`
  - `npm test -- tests/workspace/workspace-shell.test.tsx tests/pwa/manifest.test.ts`
  - `npm run build`

## 6. 执行约束与默认假设

- [x] 执行前先处理当前 dirty worktree：不得回退用户已有改动；本功能改动需要在现有修改基础上合并。
- [x] 不实现删除、移动、重命名、backlinks、graph、chat、同步服务、图片写入 media。
- [x] 不新增第三方依赖；搜索先用内建 substring，后续有证据再加 fuzzy。
- [x] IndexedDB 只保存 root handle，不保存文件内容；文件内容仍由用户本地文件和现有 tab/draft storage 承担。
- [x] 计划文档执行时保存到 `docs/superpowers/plans/2026-05-30-local-folder-workspace.md`，正文使用中文。
