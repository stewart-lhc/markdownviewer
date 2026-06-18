# Share Growth + Local Recent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补齐增长留存 PRD 中最靠近当前代码的缺口：M1-lite 事件口径、M3 本地 Recent/Continue、M4 分享页增长闭环。交付后，分享读者可以安全地编辑副本或作为模板使用，workspace 能记录本地回访入口，分享成功和 Share Pro intent 可被衡量。

**Architecture:** 保持本地优先。分享页继续读取现有 share store；share copy/template 通过 URL 参数进入 workspace；workspace 初始解析负责标记来源；本地 Recent 使用独立 localStorage schema；首页和 workspace 通过小型 client component 读取 Recent；analytics 仍复用 `trackProductEvent`，本轮不新增后端事件仓库。

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Testing Library, localStorage, existing `trackProductEvent`, `resolveInitialWorkspaceDocument`, `createShareViaApi`, `ShareReader`, `WorkspaceShell`.

---

## 范围

本轮实现 `Share Growth Loop + Local Recent`，对应 PRD 的收敛版下一 MVP。

P0 交付：

- 分享页顶部保留 `Open in workspace`，底部新增 `Edit a Copy` 和 `Use as Template`。
- workspace 支持 `shareAction=open|copy|template`，并把 `sourceInput` 标记为 `share:<id>:<action>`。
- share copy/template 进入 workspace 后不覆盖原分享，只生成本地可编辑文档。
- workspace 分享成功写入 Local Recent，并发送 `share_created`。
- 从 share copy/template 打开的文档写入 Local Recent，并发送 reader/workspace 相关事件。
- 首页和 workspace 显示最多 3 条 Continue 入口。
- Share Pro intent 保持现有行为，继续带 `source=share_success&intent=...`。

本轮不做：

- 登录、账号、My Shares、云同步。
- 真实密码、过期时间、自定义 slug。
- 完整 analytics backend、增长看板、事件回填。
- Markdown Check/AI Markdown QA Lite。
- README Badge、GitHub repo URL 到 README 解析。

## 文件映射

新增文件：

- `lib/workspace/recent-activity.ts`：Local Recent schema、解析、去重、排序、上限裁剪、remove/clear。
- `components/workspace/recent-activity-panel.tsx`：workspace 内 Continue/Recent 面板。
- `components/landing/continue-panel.tsx`：首页 Continue 面板，最多显示 3 条。
- `tests/workspace/recent-activity.test.ts`：Recent schema 和 localStorage 行为测试。
- `tests/landing/continue-panel.test.tsx`：首页 Continue 渲染和空态测试。
- `docs/superpowers/plans/2026-06-17-share-growth-local-recent.md`：本计划。

修改文件：

- `docs/growth_retention_mvp_prd.md`：记录 2026-06-17 实现状态和下一 MVP 收敛。
- `lib/workspace/resolve-initial-document.ts`：解析 `shareAction`，返回明确的 `sourceInput` 和状态文案。
- `lib/i18n/messages.ts`：新增 share CTA、Recent、share copy/template 状态文案。
- `components/share/share-page-content.tsx`：生成 open/copy/template workspace 链接，传给 reader。
- `components/share/share-reader.tsx`：底部 CTA 区、CTA click tracking。
- `components/workspace/workspace-shell.tsx`：写入 Recent、发送 `share_created`，在合适位置展示 Recent 面板。
- `components/landing/home-page-content.tsx`：引入首页 Continue 面板。
- `app/globals.css`：补齐 share CTA、Recent/Continue 面板样式。
- `tests/share/share-page.test.tsx`：验证 CTA 链接和文案。
- `tests/workspace/resolve-initial-document.test.ts`：验证 `shareAction` 解析。
- `tests/workspace/workspace-shell.test.tsx`：验证分享成功 Recent 写入和 `share_created`。
- `README.md`：实现完成后补充本地 Recent/分享 copy-template 行为。
- `CHANGELOG.md`：实现完成后记录 Growth/Retention MVP slice。

## 数据与事件口径

Recent storage key：

```ts
export const recentActivityStorageKey = "markdownviewer.recentActivity.v1";
```

Recent item schema：

```ts
export type RecentActivityKind =
  | "share-created"
  | "share-copy"
  | "share-template"
  | "converted-document";

export type RecentActivityItem = {
  id: string;
  kind: RecentActivityKind;
  title: string;
  sourceInput: string;
  href?: string;
  shareId?: string;
  createdAt: number;
  updatedAt: number;
};
```

本轮事件：

| Event | 触发点 | 必带属性 |
|---|---|---|
| `share_reader_opened` | 分享页 reader mount | `share_id`, `document_title` |
| `share_reader_open_workspace_clicked` | 分享页 open CTA click | `share_id`, `source` |
| `share_reader_edit_copy_clicked` | 分享页 edit copy CTA click | `share_id`, `source` |
| `share_reader_use_template_clicked` | 分享页 template CTA click | `share_id`, `source` |
| `workspace_share_source_opened` | workspace 从 share 打开 | `share_id`, `share_action` |
| `share_created` | workspace 创建分享成功 | `share_id`, `source_kind`, `source_input`, `document_title` |
| `pro_feature_clicked` | 分享成功弹层 Pro intent | 保持现有 `feature`, `product_area`, `source` |

## 任务

### 1. 建立 Local Recent 纯函数模块

- [x] 新增 `tests/workspace/recent-activity.test.ts`，先覆盖以下行为：
  - 空 storage 返回 `[]`。
  - 非法 JSON、错误 version、非数组 payload 返回 `[]`。
  - `upsertRecentActivity` 按 `id` 去重，更新 `updatedAt` 后排在最前。
  - 默认最多保留 12 条。
  - `readRecentActivity(..., { limit: 3 })` 返回最新 3 条。
  - `removeRecentActivity` 只删除目标 id。
  - `clearRecentActivity` 清空 storage。
- [x] 新增 `lib/workspace/recent-activity.ts`，导出：
  - `recentActivityStorageKey`
  - `RecentActivityKind`
  - `RecentActivityItem`
  - `readRecentActivity(storage?: Storage, options?: { limit?: number })`
  - `writeRecentActivity(items: RecentActivityItem[], storage?: Storage)`
  - `upsertRecentActivity(item: RecentActivityItem, storage?: Storage)`
  - `removeRecentActivity(id: string, storage?: Storage)`
  - `clearRecentActivity(storage?: Storage)`
  - `createShareRecentActivityItem(input)`
  - `createShareCopyRecentActivityItem(input)`
  - `createShareTemplateRecentActivityItem(input)`
- [x] 约束实现：
  - 所有函数必须在 SSR 下安全；没有 `window` 且未显式传入 storage 时返回空数组或 no-op。
  - 写入前过滤无效 item。
  - `title` 为空时回退到 `Untitled markdown`。
  - `id` 格式使用稳定前缀：`share-created:<shareId>`、`share-copy:<shareId>`、`share-template:<shareId>`、`converted:<sourceInput>`。
- [x] 运行验证：

```powershell
pnpm test -- tests/workspace/recent-activity.test.ts
```

预期：该测试文件全部通过，没有 unhandled rejection。

### 2. 解析 shareAction 并标记 workspace 来源

- [x] 修改 `tests/workspace/resolve-initial-document.test.ts`，增加用例：
  - `?share=abc` 默认返回 `sourceInput: "share:abc:open"`。
  - `?share=abc&shareAction=copy` 返回 `sourceInput: "share:abc:copy"`，markdown 等于分享内容。
  - `?share=abc&shareAction=template` 返回 `sourceInput: "share:abc:template"`，markdown 等于分享内容。
  - 非法 `shareAction` 回退为 `open`。
  - 分享不存在时仍返回 shared missing，不写 fake source。
- [x] 修改 `lib/workspace/resolve-initial-document.ts`：
  - 使用 `takeFirst(searchParams.shareAction)`。
  - 允许值为 `open | copy | template`。
  - 分享存在时返回 `sourceInput: \`share:${shareValue}:${shareAction}\``。
  - 为 copy/template 返回本地化 `statusMessage`，例如“已打开分享副本，可安全编辑”。
- [x] 修改 `lib/i18n/messages.ts`：
  - `workspace.status.sharedCopyReady`
  - `workspace.status.sharedTemplateReady`
  - `workspace.status.sharedOpenReady`
- [x] 运行验证：

```powershell
pnpm test -- tests/workspace/resolve-initial-document.test.ts
```

预期：resolve initial document 相关测试全部通过。

### 3. 补齐分享页 CTA 与 reader 事件

- [x] 修改 `tests/share/share-page.test.tsx`，增加断言：
  - 顶部 `Open in workspace` href 为 `/workspace?share=<id>&shareAction=open`，中文路径使用 `localizePath`。
  - 底部存在 `Edit a Copy` href `/workspace?share=<id>&shareAction=copy`。
  - 底部存在 `Use as Template` href `/workspace?share=<id>&shareAction=template`。
  - CTA 文案中英文均来自 `lib/i18n/messages.ts`。
- [x] 修改 `components/share/share-page-content.tsx`：
  - 计算 `openWorkspaceHref`、`editCopyHref`、`useTemplateHref`。
  - 顶部 open 链接带 `shareAction=open`。
  - 将 `shareId` 和三个 href 传给 `ShareReader`。
- [x] 修改 `components/share/share-reader.tsx`：
  - props 增加 `shareId`、`openWorkspaceHref`、`editCopyHref`、`useTemplateHref`。
  - reader mount 后发送 `share_reader_opened`。
  - 底部 bar 加入 CTA group，不遮挡 typography controls。
  - CTA click 分别调用 `trackProductEvent`。
- [x] 修改 `lib/i18n/messages.ts`：
  - `share.openInWorkspace`
  - `share.editCopy`
  - `share.useTemplate`
  - `share.readerCtaLabel`
- [x] 修改 `app/globals.css`：
  - CTA group 在桌面横排，在窄屏换行。
  - 按钮高度固定，文本不溢出。
  - 不把页面 section 做成嵌套卡片。
- [x] 运行验证：

```powershell
pnpm test -- tests/share/share-page.test.tsx
```

预期：分享页测试通过，CTA href 精确匹配。

### 4. workspace 写入 Recent 并发送分享事件

- [x] 修改 `tests/workspace/workspace-shell.test.tsx`，增加用例：
  - 点击 Share，mock `createShare` 成功后，`window.dataLayer` 包含 `share_created`。
  - 成功分享后 localStorage 的 `markdownviewer.recentActivity.v1` 包含 `share-created:<id>`。
  - 初始 `sourceInput="share:abc:copy"` mount 后写入 `share-copy:abc`。
  - 初始 `sourceInput="share:abc:template"` mount 后写入 `share-template:abc`。
- [x] 修改 `components/workspace/workspace-shell.tsx`：
  - 引入 Recent helper。
  - `handleShare` 成功后调用 `trackProductEvent("share_created", ...)`。
  - `handleShare` 成功后调用 `upsertRecentActivity(createShareRecentActivityItem(...))`。
  - 在 mount effect 中识别 `currentSource` 是否匹配 `share:<id>:copy|template|open`。
  - copy/template 写入 Recent；open 只发送 `workspace_share_source_opened`。
  - 确保 StrictMode 下不会重复写入或重复发事件，可用 `useRef` 记录已处理 source。
- [x] 修改 `deriveDocumentTitle` 或 Recent item 创建调用，确保分享来源也能有可读 title。
- [x] 运行验证：

```powershell
pnpm test -- tests/workspace/workspace-shell.test.tsx
```

预期：workspace shell 测试通过，share-created 和 share-copy/template 行为稳定。

### 5. 增加 workspace Recent/Continue 面板

- [x] 新增 `components/workspace/recent-activity-panel.tsx`：
  - `"use client"`。
  - mount 后读取 `readRecentActivity(undefined, { limit: 3 })`。
  - 空数组时返回 `null`。
  - 每条 item 显示 title、kind label、相对或短日期。
  - `href` 存在则渲染 `<a>`，否则渲染 disabled-looking item。
  - 提供 remove 按钮，调用 `removeRecentActivity` 后更新 state。
- [x] 修改 `lib/i18n/messages.ts`：
  - `recent.title`
  - `recent.empty`
  - `recent.remove`
  - `recent.kind.shareCreated`
  - `recent.kind.shareCopy`
  - `recent.kind.shareTemplate`
  - `recent.kind.convertedDocument`
- [x] 修改 `components/workspace/workspace-shell.tsx`：
  - 在当前 starter/空状态附近引入 `RecentActivityPanel`。
  - 面板不影响已有编辑器、预览、tabs 布局。
  - 只显示最多 3 条 Continue。
- [x] 修改或新增测试：
  - `tests/workspace/workspace-shell.test.tsx` 覆盖有 recent 时渲染 Continue。
  - `tests/workspace/recent-activity.test.ts` 已覆盖 remove 函数，不在组件里重复测 helper 内部。
- [x] 运行验证：

```powershell
pnpm test -- tests/workspace/workspace-shell.test.tsx tests/workspace/recent-activity.test.ts
```

预期：workspace 相关测试通过。

### 6. 首页 Continue 面板

- [x] 新增 `tests/landing/continue-panel.test.tsx`：
  - localStorage 为空时不渲染标题。
  - localStorage 有 4 条时只渲染最新 3 条。
  - 点击 remove 后目标 item 消失。
- [x] 新增 `components/landing/continue-panel.tsx`：
  - `"use client"`。
  - 复用 `readRecentActivity`。
  - 布局保持首页现有信息密度，不做大型 marketing card。
- [x] 修改 `components/landing/home-page-content.tsx`：
  - 在 hero 之后、feature grid 之前放置 `ContinuePanel`。
  - 面板为空时不占位。
- [x] 修改 `app/globals.css`：
  - Continue 面板使用全宽 band 或非嵌套轻量布局。
  - 移动端不挤压 hero 导入控件。
- [x] 运行验证：

```powershell
pnpm test -- tests/landing/continue-panel.test.tsx
```

预期：首页 Continue 测试通过。

### 7. 转换文档写入 Recent

- [x] 找到现有转换成功路径，优先在 `components/workspace/workspace-shell.tsx` 里处理 `sourceInput` 为 `converted:<name>` 的成功分支。
- [x] 修改或新增测试：
  - 在 `tests/workspace/workspace-shell.test.tsx` 中 mock 转换成功，断言写入 `kind: "converted-document"`。
  - 若现有转换测试更适合，使用 `tests/workspace/convert-document.test.ts` 或相关 route 测试补充最小断言。
- [x] 实现：
  - 转换成功后调用 `upsertRecentActivity`。
  - `href` 指向当前 workspace 能恢复的入口；若没有稳定 URL，先只写 `sourceInput`，组件对无 href item 做非链接展示。
- [x] 运行验证：

```powershell
pnpm test -- tests/workspace/workspace-shell.test.tsx tests/workspace/convert-document.test.ts
```

预期：转换相关测试和 workspace shell 测试通过。

### 8. 文案、样式、PRD/README/CHANGELOG 收口

- [x] 检查 `lib/i18n/messages.ts` 中英文文案：
  - 中文面向产品用户，不写实现说明。
  - 英文保持简短。
  - 不在 UI 里解释埋点、localStorage 或 keyboard shortcuts。
- [x] 检查 `app/globals.css`：
  - 颜色不要变成单一蓝/紫主题。
  - 按钮和标签在移动端不换出容器。
  - 不新增嵌套卡片。
- [x] 更新 `README.md`：
  - 增加 share copy/template 和 local recent 的简短说明。
  - 不夸大成账号同步或云端历史。
- [x] 更新 `CHANGELOG.md`：
  - 在 Unreleased 或当前版本下记录 Growth/Retention MVP slice。
- [x] 运行文档/样式相关测试：

```powershell
pnpm test -- tests/landing/continue-panel.test.tsx tests/share/share-page.test.tsx tests/workspace/workspace-shell.test.tsx tests/workspace/recent-activity.test.ts
```

预期：本轮相关测试全部通过。

### 9. 全量验证

- [x] 运行：

```powershell
pnpm test
```

预期：Vitest 全量通过。

- [x] 运行：

```powershell
pnpm build
```

预期：Next.js production build 通过，没有 TypeScript 或 route build error。

- [x] 手动验收本地开发：

```powershell
pnpm dev -- -H 0.0.0.0
```

验收路径：

- 打开 `/workspace`，创建分享，确认分享成功弹层、Pro intent、Recent 写入。
- 打开 `/share/<id>`，确认顶部 open 和底部 copy/template。
- 点击 `Edit a Copy`，确认进入 `/workspace?share=<id>&shareAction=copy`，文档可编辑，原分享不变。
- 点击 `Use as Template`，确认进入 `/workspace?share=<id>&shareAction=template`。
- 回到首页，确认 Continue 最多 3 条。

交付本地 URL 时同时提供：

- `http://localhost:3000/`
- WLAN/LAN IP 形式的 `http://<WLAN-IP>:3000/`

## 验收矩阵

| PRD 缺口 | 本计划覆盖 | 验收方式 |
|---|---|---|
| M1 事件底座不足 | M1-lite 事件命名与 `trackProductEvent` 覆盖 | dataLayer/gtag mock 测试 |
| M3 没有用户可见 Recent | Local Recent helper + workspace/home Continue | helper 和组件测试 |
| M4 分享页缺 copy/template | 分享页 CTA + workspace `shareAction` | share page 和 resolver 测试 |
| M4 分享链路不可追踪 | share reader/workspace/share created 事件 | dataLayer 测试 |
| M5 未实现 | 本轮明确延后 | PRD 和计划记录 |
| M6 badge 未实现 | 本轮明确延后 | PRD 和计划记录 |

## 风险与处理

- React StrictMode 可能导致 mount effect 重复执行。处理：workspace 对 `sourceInput` 使用 `useRef` 去重。
- 首页是 server-oriented composition。处理：Continue 面板单独做 `"use client"` 组件，空态返回 `null`。
- share 页面 metadata 当前可能允许索引。处理：本轮先确认并记录策略；如选择默认 `noindex`，同步 `buildShareMetadata` 和 PRD。
- localStorage schema 将来可能迁移。处理：versioned storage，非法数据静默丢弃。

## 执行顺序

建议按任务 1 到 9 顺序执行。任务 1-4 是闭环核心；任务 5-6 是回访入口；任务 7 是补齐转换场景；任务 8-9 是发布前收口。
