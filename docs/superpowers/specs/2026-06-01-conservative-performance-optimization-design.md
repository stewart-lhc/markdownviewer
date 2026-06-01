# Markdownviewer 保守性能优化设计

## 背景

本次目标是全面优化 `markdownviewer.run` 的性能，同时把“功能不变、UI look and feel 不变”作为硬约束。优化不改变用户看到的布局、按钮、主题、文案、路由、编辑流程、分享/导出、PWA、folder workspace 或 Markdown 渲染能力。

当前构建状态：

- `npm run build` 已通过。
- 当前工作树已有未提交的 workspace UI/layout 改动，本设计和后续实现必须保护这些改动，不做回滚或覆盖。
- 构建产物显示首页 client reference 会因为 `LiveSample` 引入 `MarkdownRenderer`，把 Markdown/rehype/remark/highlight/Mermaid 相关重型客户端 chunk 带入 landing 首屏。这个问题可以在不改变视觉效果的前提下优化。

## 目标

1. 降低首页首屏 JavaScript 负载，尤其避免 landing 首屏加载完整 Markdown renderer 客户端栈。
2. 改善 workspace 输入、预览、outline、scroll sync、tabs persistence、folder rail/search 等热路径的响应性。
3. 保留现有 Markdown 能力：GFM、Mermaid、KaTeX、code highlighting、copy code、source positions、outline、relative Markdown links、share/export。
4. 保留现有 UI 外观和功能入口，不新增用户可见流程，不删除任何现有控件。
5. 用自动化测试、构建产物检查和浏览器视觉检查证明没有功能/UI 回归。

## 非目标

- 不做视觉重设计。
- 不重写 workspace 状态模型。
- 不改变 editor、preview、tabs、folder workspace、PWA file handling、share/export 的用户语义。
- 不移除 Mermaid、KaTeX、syntax highlighting 或 source-position scroll/navigate 能力。
- 不把性能优化和 release/deploy 工作混在一起；若后续需要上线验证，再单独执行部署和 production parity 检查。

## 推荐方案

采用“保守分层优化”：

1. 先处理首页首屏 bundle：`LiveSample` 改为轻量静态/Server-rendered 预览，不再 import `MarkdownRenderer`。
2. 再处理 workspace 热路径：减少输入时同步计算、重复 localStorage 写入、重复 heading/title 派生和 scroll sync 抖动。
3. 最后补充回归测试和构建产物检查，证明首页重型 chunk 不再进入 landing 首屏，同时 workspace 功能不退化。

这个方案优先解决已确认的高收益问题，避免深度重构带来的 UI/功能风险。

## 架构

### Landing

`components/landing/live-sample.tsx` 保留现有 `.hero-preview`、`.preview-window`、`.preview-window-scroll`、`.preview-ribbon` 等 DOM/CSS 结构，使视觉外观继续由当前 CSS 驱动。

差异只在实现方式：landing sample 不再通过客户端 `MarkdownRenderer` 渲染 `starterDocument`，而是输出等价的轻量静态 markup。该 markup 只覆盖 hero sample 需要展示的固定内容，不承担完整 Markdown renderer 职责。

验收标准：

- 首页视觉不变。
- 首页 client reference 不再包含 `components/markdown/markdown-renderer.tsx`。
- 首页不再首屏加载 Markdown renderer 关联重型 chunk。

### Markdown Renderer

`components/markdown/markdown-renderer.tsx` 继续作为完整 Markdown 渲染入口，供 workspace 和 share 页面使用。保持现有插件和组件语义：

- `remark-gfm`
- `remark-math`
- `remark-breaks`
- `rehype-slug`
- source-position annotation
- heading autolinks
- highlight
- KaTeX
- Mermaid block
- code copy toolbar
- local folder relative link interception

本次不改变渲染结果，不改变 code frame、Mermaid frame、KaTeX 或 link click 行为。

### Workspace

`components/workspace/workspace-shell.tsx` 继续持有核心状态。优化点限于派生计算和调度：

- 保持 `useDeferredValue` 用于 preview markdown，避免输入时立即阻塞完整 preview 渲染。
- 对 headings、document title、tab title 等派生数据使用稳定 memoization，只在实际依赖变化时计算。
- 对 localStorage persistence 保持延迟写入，并避免同一 tick 内重复写入。
- 对 scroll sync 和 keyboard navigation 保持 requestAnimationFrame 节流，不改变源/预览同步语义。
- 对 folder rail 的 sort/search 派生结果保持 memoized，避免每次 workspace state 更新都重算文件列表。

不得改变：

- mode：preview/split/editor
- rich/raw editor 切换
- preview typography/theme controls
- tabs create/select/close/restore/merge
- folder open/reconnect/search/new/save
- PWA `launchQueue`
- drag/drop file opening
- share link/export HTML/print PDF

### Folder Rail

`components/workspace/folder-rail.tsx` 继续只消费 `files`、`searchQuery`、`activePath` 等 props。优化可以集中在：

- sorted files memoization
- search results memoization
- render output保持当前 role、className 和 button structure

不得引入虚拟列表，除非另有单独设计和视觉验证；虚拟列表容易改变滚动行为和可见 DOM，不符合本次保守目标。

## 数据流

现有用户模型不变：

1. 用户输入、导入、打开本地文件或 folder file。
2. Workspace state 更新当前 markdown/source/tab。
3. Preview 使用 deferred markdown 渲染。
4. Headings/outline 从 preview markdown 派生。
5. Tabs 和 draft 延迟保存到 localStorage。
6. 用户可继续保存、分享、导出或跳转相对 Markdown link。

优化后的数据流只减少不必要的同步工作，不改变数据含义。

## 错误处理

- Landing static sample 不引入新的 runtime error surface；若 sample markup 写死，不存在 Markdown parse/render 失败分支。
- Workspace renderer 保持现有 Mermaid fallback、file read/save error、folder permission error、share/import error 处理。
- 如果优化过程发现某个缓存可能导致 stale UI，优先放弃该缓存，保留正确性和 UI 一致性。

## 测试策略

### 自动化测试

运行并维护以下测试面：

- `npm test -- tests/landing/homepage.test.tsx tests/landing/hero-layout-styles.test.ts`
- `npm test -- tests/markdown/markdown-renderer.test.tsx tests/markdown/mermaid-styles.test.ts tests/markdown/extract-headings.test.ts`
- `npm test -- tests/workspace/workspace-page.test.tsx tests/workspace/workspace-shell.test.tsx tests/workspace/workspace-layout-styles.test.ts`
- 需要时补充 focused tests，覆盖 landing sample 不再依赖 `MarkdownRenderer`，以及 workspace 派生计算不造成功能退化。

### 构建检查

- `npm run build`
- 检查 `.next/server/app/page_client-reference-manifest.js`，确认首页不再引用 `components/markdown/markdown-renderer.tsx`。
- 检查 `.next/static/chunks` 的大 chunk 入口变化，确认 landing route 不再强制关联 Markdown renderer chunk。

### 浏览器/视觉检查

使用本地 production 或 dev server 打开：

- `/`
- `/zh-CN`
- `/workspace`
- `/zh-CN/workspace`

检查重点：

- 首页 hero sample 的外观、尺寸、滚动框、ribbon 和 Markdown-like 内容保持一致。
- Workspace header、tabs rail、preview controls、editor/preview/split modes、folder rail、mobile chrome 不出现布局漂移。
- Mermaid、code block、KaTeX、outline、share/export、file/folder flows 仍可用。

## 接受标准

本次实现只有在以下条件全部满足时才算完成：

1. 现有 UI look and feel 无可见变化。
2. 现有功能无删减、无交互语义变化。
3. 首页首屏不再加载完整 Markdown renderer 客户端栈。
4. Workspace 输入和预览路径没有明显卡顿回退。
5. 相关 Vitest 通过。
6. `npm run build` 通过。
7. 浏览器检查确认 landing 和 workspace 关键视图一致。
8. 未覆盖或回滚当前工作树中已有的未提交 UI/layout 改动。

## 实施边界

后续实现应小步提交：

1. Landing sample bundle 优化。
2. Workspace 派生计算和 persistence 调度优化。
3. Folder rail/search memoization。
4. 测试和构建产物检查。

每一步都要优先保持行为和视觉不变。若某项优化需要改变 DOM 结构或可见交互，应暂停并重新确认设计。
