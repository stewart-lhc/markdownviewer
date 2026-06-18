# MarkdownViewer.run 非商业化增长与留存优化 PRD

> 文档类型：产品需求文档（PRD）
> 产品：MarkdownViewer.run
> 主题：用户增长、用户粘性、使用便利、回头客与长期护城河
> 阶段：MVP 实施版
> 版本：v1.0
> 日期：2026-06-09
> 作者：Product / Growth

---

## 1. 背景与结论

### 1.1 产品背景

`markdownviewer.run` 是一个面向 Markdown 阅读、编辑、转换、导入、分享和导出的在线工具。当前产品已经具备较完整的基础能力：

- 粘贴 Markdown 后即时预览。
- 本地 Markdown 文件 / 文件夹打开。
- GitHub / Gist / raw URL 导入。
- 文档转 Markdown，包括 DOCX、PPTX、XLSX、CSV、HTML、JSON、XML、文本 PDF 等。
- Mermaid、KaTeX、代码高亮等技术 Markdown 渲染能力。
- PWA 安装、持久化 tabs、本地优先 workspace。
- 存储型分享链接 `/share/{id}`。
- HTML / PDF 导出。

产品刚上线，流量和用户量都不大。当前阶段的首要任务不是商业化变现，也不是继续横向堆功能，而是验证产品是否能形成稳定的用户习惯。

### 1.2 当前阶段核心判断

当前阶段应优先解决四个问题：

```text
第一次用得爽
下次还愿意回来
愿意把内容分享出去
逐渐把 markdownviewer.run 当成默认 Markdown 工作台
```

因此，产品方向应从「通用 Markdown 预览器」收敛为：

```text
AI 时代的 Markdown 阅读、清理、检查和分享工作台
```

更具体地说，现阶段应重点占领四个用户心智：

```text
AI 输出 Markdown 后的第一落点
README 发布前的检查台
本地 Markdown 文件的轻量 workspace
可分享 Markdown 的漂亮 reader
```

### 1.3 为什么现阶段不优先商业化

当前阶段不建议优先做：

- 付费墙。
- 高级订阅套餐。
- 团队空间。
- SSO / RBAC。
- 大规模 API 计费。
- 企业销售。
- 重型协作编辑。
- 完整知识库替代品。

原因：

1. 流量小、用户少时，商业化会过早增加摩擦，降低增长速度。
2. 还没有足够数据证明核心高频场景、留存路径和付费价值。
3. 基础 Markdown 预览工具高度商品化，用户不会为“能看 Markdown”付费。
4. 现阶段真正值得验证的是：用户是否会回访、分享、安装、复用、形成默认工作流。
5. 当留存和使用习惯被验证后，后续 Share Pro、Converter Pro、AI QA Pro、Team Workspace 才有商业化基础。

---

## 2. PRD 目标

### 2.1 产品目标

本 PRD 聚焦非商业化增长，目标是在不引入付费墙的前提下，提升：

- 首次访问激活率。
- 7 日和 30 日回访率。
- 分享页带来的自然新增。
- 用户打开 Markdown 的便利性。
- 用户对产品的默认使用习惯。
- 产品在 AI Markdown、README 预览、文档转换和本地 workspace 场景下的护城河。

### 2.2 北极星指标

建议北极星指标定义为：

```text
Weekly Returning Activated Users，简称 WRAU

每周回访并完成至少 1 个核心动作的用户数。
```

核心动作包括：

- 粘贴 Markdown。
- 打开本地 Markdown 文件。
- 打开本地文件夹。
- 导入 GitHub / Gist / raw URL。
- 转换文档为 Markdown。
- 创建分享链接。
- 从分享页打开 workspace。
- 导出 HTML / PDF。
- 运行 Markdown Check。
- 安装或启动 PWA。

### 2.3 MVP 成功标准

MVP 上线后 4 周内，达到以下任一组指标即可视为方向有效：

| 指标 | 目标 |
|---|---:|
| 首次访问到核心动作转化率 | 提升 30% |
| 新用户 7 日回访率 | 达到 8%–15% |
| 分享页访问到 workspace 转化率 | 达到 5%–10% |
| Recent Workspace 使用率 | ≥ 20% 的回访用户使用 |
| Markdown Check 使用率 | ≥ 15% 的激活用户使用 |
| PWA 安装点击率 | ≥ 2%–5% |
| README / GitHub URL 导入使用占比 | 稳定增长 |
| AI Markdown 粘贴入口使用占比 | 成为 Top 2 入口之一 |

---

## 3. 用户与核心场景

### 3.1 目标用户

#### 用户 A：AI 工具高频用户

典型画像：

- 使用 ChatGPT、Claude、Cursor、Copilot、Gemini 等工具。
- 经常得到大段 Markdown 输出。
- 需要快速阅读、整理、检查、分享 AI 生成内容。
- 不想打开重型编辑器或新建文档。

核心痛点：

- AI 输出的 Markdown 在聊天窗口里阅读体验不好。
- 表格、代码块、目录、Mermaid、数学公式可能显示异常。
- 复制到普通文档软件后格式容易乱。
- 发布前不知道有没有链接、标题、代码块等问题。

产品机会：

```text
Paste AI Markdown → Clean Reader → Check Issues → Share / Export
```

#### 用户 B：开发者 / 开源维护者

典型画像：

- 维护 GitHub README、CHANGELOG、release notes、技术文档。
- 需要在发布前检查 Markdown 渲染效果。
- 对 GFM、代码块、Mermaid、链接、图片路径有较高要求。
- 希望无需复杂配置即可预览和检查。

核心痛点：

- GitHub 上预览需要 commit 或跳转。
- 本地编辑器和 GitHub 渲染效果不完全一致。
- README 的完整性、可读性和链接有效性容易忽略。
- 分享预览给别人不方便。

产品机会：

```text
Import GitHub README → Preview → Markdown Check → Share Preview → Improve README
```

#### 用户 C：技术写作者 / PM / 文档工作者

典型画像：

- 经常处理需求文档、会议纪要、方案文档。
- 内容来源包括 Word、PDF、HTML、CSV、AI 输出等。
- 希望把文档转成 Markdown 后继续编辑、预览和分享。
- 对工具轻量、快速、无需登录有偏好。

核心痛点：

- Word/PDF/HTML 转 Markdown 后格式不可控。
- 临时查看 Markdown 不想启动 IDE。
- 与别人共享 Markdown 预览页面不方便。
- 缺少跨文件的最近工作区记忆。

产品机会：

```text
Convert Document → Edit Markdown → Preview → Save / Share / Reopen Later
```

#### 用户 D：偶发访问用户

典型画像：

- 通过搜索进入。
- 只想临时打开或预览一个 Markdown 文件。
- 对产品没有认知，也没有注册意愿。
- 只要一步不顺就会离开。

核心痛点：

- 不知道该点哪里。
- 看到功能太多会犹豫。
- 上传文件前担心隐私。
- 临时任务完成后容易流失。

产品机会：

```text
Clear Entry → Instant Value → Recent Session → Share / Install / Return
```

---

## 4. 产品定位

### 4.1 当前定位问题

如果只表达为：

```text
Online Markdown Viewer
```

会面临几个问题：

1. 搜索流量竞争激烈。
2. 用户把它当成一次性工具。
3. 与 Dillinger、StackEdit、VS Code、GitHub、HackMD、Obsidian 等工具相比缺少心智差异。
4. 很难形成回访习惯。
5. 基础预览能力无法构成护城河。

### 4.2 建议定位

建议将产品定位为：

```text
MarkdownViewer.run is a local-first Markdown workspace for reading, checking, converting, and sharing AI-generated and developer Markdown.
```

中文表达：

```text
一个本地优先的 Markdown 工作台，用来阅读、检查、转换和分享 AI 与开发者 Markdown。
```

### 4.3 首页核心心智

首页不应首先展示完整功能清单，而应围绕 3 个高频任务入口：

```text
Paste AI Markdown
Preview README
Convert Document
```

辅助入口：

```text
Open File / Folder
Import from GitHub / Gist / Raw URL
Open Recent Workspace
```

---

## 5. MVP 范围

### 5.1 MVP 总体原则

MVP 目标不是“做全”，而是尽快验证增长和留存假设。

原则：

1. 优先做能提高首次激活和回访的功能。
2. 优先复用现有能力，不做大型重构。
3. 不引入付费、团队、复杂账号。
4. 不强制登录。
5. 本地优先，强调隐私和速度。
6. 埋点先行，所有关键路径必须可衡量。
7. 先静态检查，再考虑 AI 修复。
8. 先做单用户体验，再做多人协作。

### 5.2 MVP 功能列表

MVP 包含 6 个模块：

```text
M1. 增长与留存数据底座
M2. 首页和 Workspace 首屏任务入口重构
M3. Recent Workspace / Continue Last Session
M4. Share Page Growth Loop
M5. Markdown Check / AI Markdown QA Lite
M6. Open in MarkdownViewer / README Badge
```

### 5.3 2026-06-17 实现状态审计与下一 MVP 收敛

本节用于合并 2026-06-17 的代码审计结果和下一轮 MVP 决策。结论是：原始增长留存 PRD 还没有完整做完，但已经具备若干可复用基础。下一轮不应一次性补齐 6 个模块，而应先收敛到能同时验证分享增长和本地回访的最小闭环。

#### 5.3.1 当前完成状态

| 模块 | 当前状态 | 代码侧证据 | 结论 |
|---|---|---|---|
| M1. 增长与留存数据底座 | 部分完成 | 已有 `lib/analytics/product-events.ts`，workspace 分享成功弹层已记录 `pro_feature_clicked`，Waitlist 已有局部提交事件 | 只有前端事件透传，没有统一 visitor/session、核心事件表、漏斗和回填策略 |
| M2. 首页和 Workspace 首屏任务入口重构 | 部分完成 | 首页已有 Paste/File/Sample/URL 入口；workspace 已有 starter document 和多种导入能力 | 不是 PRD 定义的三主任务入口，workspace 空状态和 `entryIntent` 仍未闭环 |
| M3. Recent Workspace / Continue Last Session | 部分完成 | workspace tabs 已用 localStorage 保存和恢复 | 只恢复编辑标签页，没有用户可见的 Recent 面板、Continue Last Session、Pin/Remove |
| M4. Share Page Growth Loop | 部分完成 | 分享页顶部已有 `Open in workspace`；分享成功弹层已有 Share Pro 意图链接 | 缺少底部增长 CTA、`Edit a Copy`、`Use as Template`、分享链路来源追踪和本地回访记录 |
| M5. Markdown Check / AI Markdown QA Lite | 未开始 | 当前代码没有 checker/linter 规则引擎和 issue panel | 暂不纳入下一轮实现 |
| M6. Open in MarkdownViewer / README Badge | 部分完成 | `?source=` 可打开 raw/GitHub blob/Gist/raw URL | 缺少 GitHub repo URL 到 README 的解析、badge 生成器和 `source=github_badge` 来源标记 |

#### 5.3.2 下一 MVP 决策

下一轮 MVP 命名为 **Share Growth Loop + Local Recent**。

目标不是补齐完整商业化、账号或协作体系，而是把已经存在的分享页、workspace、本地 tab 保存和 Pro intent 探针串成一个可衡量闭环：

```text
reader opens share
→ reader clicks Edit a Copy / Use as Template
→ workspace opens a safe local copy
→ user creates or edits a document
→ user creates another share
→ local Recent exposes the return path
```

#### 5.3.3 下一 MVP 必做范围

P0 必做：

- 为分享阅读页补齐顶部和底部 CTA：`Open in workspace`、`Edit a Copy`、`Use as Template`。
- `Edit a Copy` 打开 workspace 中的本地副本，不覆盖原分享内容。
- `Use as Template` 打开 workspace 中的模板派生文档，内容来自原分享，但状态和来源明确标记为 template-derived。
- 为分享页到 workspace 的动作记录来源：`share_reader_opened`、`share_reader_open_workspace_clicked`、`share_reader_edit_copy_clicked`、`share_reader_use_template_clicked`。
- 分享成功后记录 `share_created`，并保留现有 Share Pro 意图：password、expiration、noindex、custom slug。
- 增加 Local Recent：记录最近创建的 share、从 share 复制/模板打开的文档、最近转换成功的文档。
- 首页和 workspace 空状态显示轻量 Continue 区域，最多 3 条，不引入账号和云同步。
- 为用户生成分享确认默认索引策略。若继续允许搜索引擎索引，必须在文档中说明；若默认 `noindex`，则需要同步 metadata 行为和增长口径。

P1 可做：

- Recent item 支持 remove。
- Recent item 支持 pin，但不阻塞 P0。
- 分享成功弹层展示最近分享入口。
- 将 `entryIntent` 写入 workspace 初始状态，供后续 M2 重构继续使用。

明确不做：

- 不做登录、云端 My Shares、团队空间。
- 不做真实密码、过期时间、自定义 slug，只保留 Pro intent 探针。
- 不做完整 Markdown Check。
- 不做 README Badge 和 GitHub repo README 解析。
- 不做后端事件仓库或增长看板，先以前端事件和可测试数据结构打通口径。

#### 5.3.4 成功标准

- 分享页读者在不登录的情况下，可以明确选择“打开工作区”、“编辑副本”或“作为模板使用”。
- 从分享页进入 workspace 后，文档不会覆盖原分享，source 能区分 open/copy/template。
- workspace 分享成功后，本地 Recent 能出现该 share。
- 从分享页 copy/template 打开的文档会进入本地 Recent。
- 首页或 workspace 能展示最多 3 条 Continue 入口。
- `trackProductEvent` 至少覆盖 share reader CTA、workspace share created、Share Pro intent。
- 新增路径有 Vitest 覆盖，`pnpm test` 和 `pnpm build` 通过。

---

# 6. M1：增长与留存数据底座

## 6.1 模块目标

建立产品增长和留存分析基础，回答以下问题：

- 用户从哪里来？
- 用户第一次来做了什么？
- 哪些入口转化最高？
- 哪些功能带来回访？
- 分享页是否带来自然新增？
- 用户是否安装 PWA？
- 用户是否把产品用于 AI Markdown、README、转换、本地 workspace 等高价值场景？

## 6.2 用户故事

```text
作为产品负责人，
我希望看到用户从访问到激活、分享、回访的完整漏斗，
以判断下一步应该优化哪个场景。
```

```text
作为增长负责人，
我希望知道分享页是否带来新用户，
以决定是否继续投入分享页回流和 badge。
```

```text
作为开发者，
我希望在不侵犯用户隐私的前提下记录关键行为，
以评估功能是否真正被使用。
```

## 6.3 功能需求

### 6.3.1 匿名用户标识

要求：

- 不强制登录。
- 生成匿名 `visitor_id`。
- 存储在 localStorage 或隐私友好的 cookie 中。
- 不记录用户文档内容。
- 不上传 Markdown 正文。
- 对文件名进行脱敏或仅记录文件类型，不记录完整路径。

字段建议：

```ts
type AnonymousIdentity = {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  sessionId: string;
  visitCount: number;
};
```

### 6.3.2 事件埋点

必须记录以下事件：

| 事件名 | 触发时机 |
|---|---|
| `landing_view` | 用户访问首页 |
| `workspace_view` | 用户进入 workspace |
| `entry_click` | 点击首页任务入口 |
| `sample_open` | 打开示例 |
| `paste_markdown` | 粘贴 Markdown |
| `open_file` | 打开本地文件 |
| `open_folder` | 打开本地文件夹 |
| `import_github_url` | 导入 GitHub URL |
| `import_gist_url` | 导入 Gist URL |
| `import_raw_url` | 导入 raw URL |
| `convert_document_start` | 开始转换文档 |
| `convert_document_success` | 转换成功 |
| `convert_document_fail` | 转换失败 |
| `preview_render_success` | 预览渲染成功 |
| `preview_render_fail` | 预览渲染失败 |
| `edit_started` | 用户开始编辑 |
| `save_to_disk` | 保存到本地 |
| `create_share_link` | 创建分享链接 |
| `open_share_page` | 打开分享页 |
| `share_open_workspace` | 从分享页打开 workspace |
| `share_edit_copy` | 从分享页编辑副本 |
| `share_use_template` | 从分享页使用模板 |
| `export_html` | 导出 HTML |
| `export_pdf` | 导出 PDF |
| `markdown_check_run` | 运行 Markdown Check |
| `markdown_check_fix_click` | 点击修复建议 |
| `recent_workspace_open` | 打开最近工作区 |
| `continue_last_session` | 继续上次 session |
| `pwa_install_prompt_seen` | 展示 PWA 安装提示 |
| `pwa_installed` | 完成 PWA 安装 |
| `feedback_submitted` | 提交反馈 |

事件基础属性：

```ts
type AnalyticsEvent = {
  eventName: string;
  visitorId: string;
  sessionId: string;
  timestamp: string;
  referrer?: string;
  landingPath?: string;
  source?: "direct" | "search" | "social" | "share" | "github" | "unknown";
  entryIntent?: "ai_markdown" | "readme_preview" | "document_convert" | "file_open" | "folder_open" | "github_import" | "unknown";
  isReturningVisitor?: boolean;
  deviceType?: "desktop" | "mobile" | "tablet";
  browser?: string;
  locale?: string;
  properties?: Record<string, unknown>;
};
```

### 6.3.3 漏斗看板

MVP 至少需要支持以下漏斗：

#### 首访激活漏斗

```text
landing_view
→ entry_click
→ workspace_view
→ paste/open/import/convert/share/check
```

#### 分享页增长漏斗

```text
open_share_page
→ share_open_workspace / share_edit_copy / share_use_template
→ paste/open/import/convert/share
```

#### 回访漏斗

```text
first_activation
→ return_visit_1d
→ return_visit_7d
→ return_visit_30d
→ repeated_core_action
```

#### Markdown Check 漏斗

```text
workspace_view
→ markdown_check_run
→ issue_found
→ fix_click / user_edit
→ share/export/save
```

## 6.4 非功能需求

- 不上传用户 Markdown 正文。
- 不记录本地文件完整路径。
- 对 URL 可记录 domain 和类型，但应避免记录完整私密 query。
- 提供隐私说明。
- Analytics SDK 不应显著影响首屏加载速度。
- 埋点失败不能影响核心功能使用。

## 6.5 验收标准

- 所有核心事件可以在 analytics 后台查询。
- 能区分新用户和回访用户。
- 能识别分享页带来的 session。
- 能查看各入口的首次激活转化。
- 能查看 1 日、7 日、30 日回访。
- 不记录文档正文。
- 事件丢失或 analytics 服务异常时，产品功能不受影响。

---

# 7. M2：首页与 Workspace 首屏任务入口重构

## 7.1 模块目标

让新用户在 3 秒内理解产品能帮他完成什么任务，并快速进入核心路径。

现阶段首页应从“功能展示”转为“任务选择”。

## 7.2 核心入口

首页主入口建议为：

```text
Paste AI Markdown
Preview README
Convert Document
```

次级入口：

```text
Open File
Open Folder
Import GitHub / Gist / Raw URL
Open Recent Workspace
```

## 7.3 首页结构

### 7.3.1 Hero 文案

建议英文主文案：

```text
Read, check, convert, and share Markdown in one local-first workspace.
```

建议副文案：

```text
Paste AI output, preview README files, convert documents to Markdown, and create clean share links without signing in.
```

中文版本：

```text
在一个本地优先的工作台中阅读、检查、转换和分享 Markdown。
```

```text
粘贴 AI 输出、预览 README、转换文档为 Markdown，并无需登录即可创建清爽的分享页面。
```

### 7.3.2 主任务卡片

#### 入口 1：Paste AI Markdown

展示文案：

```text
Paste AI Markdown
Cleanly read ChatGPT, Claude, Cursor, or Copilot Markdown output.
```

点击行为：

- 打开 workspace。
- 自动聚焦编辑区。
- 显示 paste 引导。
- 设置 `entryIntent = ai_markdown`。
- 如果剪贴板有 Markdown，可提示一键粘贴。

首屏辅助提示：

```text
Tip: Paste AI-generated tables, code blocks, Mermaid diagrams, or long answers here.
```

#### 入口 2：Preview README

展示文案：

```text
Preview README
Open a GitHub README, raw Markdown URL, or local README.md before publishing.
```

点击行为：

- 打开 README 导入弹窗。
- 支持粘贴 GitHub repo URL、README URL、raw URL。
- 支持上传本地 README.md。
- 设置 `entryIntent = readme_preview`。

输入示例：

```text
https://github.com/owner/repo
https://github.com/owner/repo/blob/main/README.md
https://raw.githubusercontent.com/owner/repo/main/README.md
```

#### 入口 3：Convert Document

展示文案：

```text
Convert Document
Turn DOCX, PDF, HTML, CSV, JSON, XML, PPTX, or XLSX into Markdown.
```

点击行为：

- 打开文件选择器。
- 显示支持格式和隐私说明。
- 转换完成后进入 workspace。
- 设置 `entryIntent = document_convert`。

### 7.3.3 次级入口区域

次级入口放在主入口下方：

```text
Open File
Open Folder
Import URL
Continue Last Session
```

其中 `Continue Last Session` 仅在本地存在 session 时展示。

## 7.4 Workspace 空状态

当 workspace 无内容时，不显示空白编辑器，而显示任务入口：

```text
What do you want to do?
```

卡片：

```text
Paste AI output
Open README.md
Convert Word/PDF
Open GitHub URL
Open local folder
Continue last session
```

每个卡片都应在点击后触发相应的 entry 事件。

## 7.5 用户路径

### 路径 A：AI Markdown

```text
首页
→ Paste AI Markdown
→ Workspace 聚焦编辑区
→ 用户粘贴内容
→ 渲染预览
→ 可选运行 Markdown Check
→ 可选分享 / 导出 / 保存
```

### 路径 B：README Preview

```text
首页
→ Preview README
→ 输入 GitHub repo / raw URL / 上传 README.md
→ 渲染预览
→ 运行 README Check
→ 分享预览 / 导出 / 返回编辑
```

### 路径 C：Document Convert

```text
首页
→ Convert Document
→ 选择文件
→ 转换为 Markdown
→ 进入 workspace
→ 编辑 / 检查 / 分享 / 导出
```

## 7.6 验收标准

- 新用户首页首屏必须清晰展示 3 个主入口。
- 点击任一主入口后，用户能在 1 步内进入对应任务。
- Workspace 空状态不再是空白，而是任务引导。
- 所有入口必须写入 `entryIntent`。
- 首屏加载速度不显著下降。
- 移动端入口布局可用。
- `Continue Last Session` 仅在有历史 session 时展示。

---

# 8. M3：Recent Workspace / Continue Last Session

## 8.1 模块目标

让用户无需登录也能“下次继续”，提高回访率和默认使用习惯。

当前阶段的核心不是云同步，而是本地优先的工作区记忆。

## 8.2 核心价值

用户第一次来只是临时使用；如果第二次来发现上次内容、链接、文件和 share link 还在，产品就从“一次性工具”变成“个人工作台”。

## 8.3 功能范围

MVP 支持记录以下对象：

```text
最近打开的 Markdown 文件
最近打开的文件夹
最近导入的 GitHub / Gist / raw URL
最近转换的文档
最近创建的 share link
最近运行 Markdown Check 的文档
固定的工作区 / URL / 文件夹
上次 session tabs
```

## 8.4 数据结构

```ts
type RecentWorkspaceItem = {
  id: string;
  type: "local_file" | "local_folder" | "github_url" | "gist_url" | "raw_url" | "converted_document" | "share_link" | "draft";
  title: string;
  displayPath?: string;
  sourceUrl?: string;
  shareId?: string;
  fileHandleRef?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  pinned: boolean;
  entryIntent?: "ai_markdown" | "readme_preview" | "document_convert" | "file_open" | "folder_open" | "github_import";
  metadata?: {
    fileExtension?: string;
    fileSizeBucket?: "small" | "medium" | "large";
    checkScore?: number;
    issueCount?: number;
  };
};
```

## 8.5 功能需求

### 8.5.1 Continue Last Session

当本地存在上次 session 时，在首页和 workspace 空状态展示：

```text
Continue last session
```

展示信息：

- 上次打开时间。
- 上次 tabs 数量。
- 最近文档标题。
- 是否包含本地文件夹。
- 是否有未分享 / 未导出的草稿。

点击后：

- 恢复 tabs。
- 恢复编辑 / 预览模式。
- 恢复当前选中的 tab。
- 触发 `continue_last_session` 事件。

### 8.5.2 Recent 面板

在 workspace 左侧或顶部增加 Recent 面板入口。

内容分组：

```text
Pinned
Recent Files
Recent URLs
Converted Documents
Share Links
```

每条 item 操作：

- Open。
- Pin / Unpin。
- Remove from recent。
- Copy URL，适用于 URL 和 share link。
- Re-run Check。
- Edit a copy，适用于 share link 和 converted document。

### 8.5.3 Pin 工作区

用户可以将常用文件、文件夹、URL、share link 固定。

用途：

- 提高重复访问便利性。
- 形成个人工作区感。
- 为后续账号同步预留升级路径。

### 8.5.4 本地隐私说明

需要明确提示：

```text
Recent items are stored locally in your browser. Markdown content is not uploaded unless you create a share link.
```

中文：

```text
最近记录保存在你的浏览器本地。除非你主动创建分享链接，否则 Markdown 内容不会上传。
```

## 8.6 边界情况

- 用户清除浏览器缓存后，recent 丢失。
- 文件句柄权限失效时，需要提示重新选择文件。
- 本地文件路径不应完整上传。
- 同名文件应通过最近打开时间和类型区分。
- share link 被删除或失效时，应提示用户重新创建。

## 8.7 验收标准

- 用户完成核心动作后，对应 item 出现在 Recent 面板。
- 用户再次访问首页时可看到 Continue Last Session。
- Pin 后 item 固定在顶部。
- Remove 后不再展示。
- 清除某个 recent item 不影响实际本地文件。
- Recent 数据不上传正文。
- 在移动端可查看和打开 Recent item。
- 事件 `recent_workspace_open`、`continue_last_session` 可正常记录。

---

# 9. M4：Share Page Growth Loop

## 9.1 模块目标

将分享页从“内容展示页”升级为“自然增长入口”。

当前产品已经具备 `/share/{id}`，这是早期最重要的增长资产之一。每一个分享出去的 Markdown 页面，都是潜在的新用户入口。

## 9.2 分享页问题

如果分享页只展示内容，用户看完就离开，增长价值有限。

分享页需要提供三个回流动作：

```text
Open in Workspace
Edit a Copy
Use as Template
```

## 9.3 分享页结构

建议分享页包含：

1. 文档标题。
2. Reader controls。
3. Markdown 内容。
4. 顶部轻量 CTA。
5. 底部产品回流 CTA。
6. 安全与隐私提示。
7. 可选 metadata，如创建时间、字数、阅读时间。

## 9.4 核心 CTA

### 9.4.1 Open in Workspace

文案：

```text
Open in Workspace
```

点击行为：

- 将当前 share 内容打开到 workspace。
- 默认只读或复制模式，避免误解为可编辑原文。
- 触发 `share_open_workspace`。

### 9.4.2 Edit a Copy

文案：

```text
Edit a Copy
```

点击行为：

- 复制当前 Markdown 到新 workspace draft。
- 不修改原分享文档。
- 触发 `share_edit_copy`。

### 9.4.3 Use as Template

文案：

```text
Use as Template
```

点击行为：

- 将当前 Markdown 作为模板创建新文档。
- 自动进入编辑模式。
- 可引导用户创建自己的分享链接。
- 触发 `share_use_template`。

## 9.5 分享页底部增长文案

建议英文：

```text
Read, check, and share Markdown with MarkdownViewer.run.
```

按钮：

```text
Create your own Markdown page
```

中文：

```text
用 MarkdownViewer.run 阅读、检查和分享 Markdown。
```

按钮：

```text
创建我的 Markdown 页面
```

## 9.6 分享后的二次传播

当用户从分享页进入 workspace 并创建新 share link 后，记录 `share_chain_depth`。

数据结构：

```ts
type ShareMetadata = {
  shareId: string;
  parentShareId?: string;
  createdAt: string;
  source: "workspace" | "share_edit_copy" | "share_use_template";
  shareChainDepth: number;
};
```

用途：

- 评估分享传播链。
- 识别高传播模板。
- 后续可推出公共模板库。

## 9.7 滥用与安全

MVP 需要基础防护：

- 创建 share link 时增加大小限制。
- 限制同一 visitor 短时间创建数量。
- 分享页提供 Report / Delete 机制。
- 支持 noindex 选项。
- 内容过大时懒加载。
- 明确提示分享内容会被上传并可被访问。

## 9.8 验收标准

- 分享页顶部和底部均有轻量回流入口。
- 用户可从分享页一键打开 workspace。
- 用户可编辑副本，且不影响原文。
- 用户可使用模板创建新文档。
- 分享链路来源可追踪。
- CTA 不应干扰阅读体验。
- 移动端分享页 CTA 可用。
- 分享内容上传前有明确提示。

---

# 10. M5：Markdown Check / AI Markdown QA Lite

## 10.1 模块目标

增加用户反复使用理由，让产品从“查看器”升级为“发布前检查台”。

MVP 阶段不做完整 AI 写作助手，而是先做静态规则检查和轻量修复建议。

## 10.2 产品定位

功能名称建议：

```text
Markdown Check
```

副标题：

```text
Find rendering, structure, README, and safety issues before you share or publish.
```

中文：

```text
在分享或发布前检查 Markdown 的渲染、结构、README 完整性和安全问题。
```

## 10.3 使用入口

Markdown Check 入口应出现在：

- Workspace 顶部工具栏。
- 预览区右上角。
- 分享前确认弹窗。
- README Preview 流程完成后。
- Convert Document 完成后。
- AI Markdown 粘贴完成后。

## 10.4 检查类型

### 10.4.1 结构检查

规则：

- 标题层级是否跳级，如 H1 后直接 H3。
- 是否缺少 H1。
- 是否存在多个 H1。
- 标题是否过长。
- 是否存在重复标题导致锚点冲突。
- 文档是否过长但没有目录。
- 列表缩进是否异常。

示例输出：

```text
Heading level jumps from H2 to H4 at line 38.
```

### 10.4.2 渲染检查

规则：

- 代码块是否未闭合。
- 代码块是否缺少语言标识。
- 表格列数是否不一致。
- Mermaid 是否渲染失败。
- KaTeX 是否渲染失败。
- HTML 标签是否未闭合。
- 图片语法是否异常。
- 链接语法是否异常。

示例输出：

```text
Table row has 4 cells but header has 3 cells at line 72.
```

### 10.4.3 链接与资源检查

MVP 可先做语法层面的检查，后续再做网络请求验证。

规则：

- 空链接。
- 相对链接在当前上下文不可解析。
- 图片 alt 为空。
- URL 协议异常。
- 重复链接。
- mailto / tel 等特殊协议提示。

后续增强：

- Broken link check。
- 图片加载验证。
- GitHub 相对路径解析。

### 10.4.4 README 完整性检查

当 entryIntent 为 README 或文件名为 README.md 时，启用 README Check。

检查项：

- 是否有项目介绍。
- 是否有安装说明。
- 是否有使用示例。
- 是否有配置说明。
- 是否有 API / CLI 用法。
- 是否有 License。
- 是否有 Contributing。
- 是否有截图或 demo。
- 是否有 badges。
- 是否有 changelog / release 入口。
- 是否有常见问题。

评分示例：

```text
README Readiness: 76 / 100
Missing: Installation, License, Usage Example
```

### 10.4.5 安全与隐私检查

规则：

- 疑似 API key。
- 疑似 token。
- 疑似 private key。
- 疑似邮箱。
- 疑似内网 URL。
- 疑似带 secret 的 query 参数。
- 分享前包含本地绝对路径。
- 分享前包含 `.env` 片段。

示例输出：

```text
Potential secret found near line 128. Review before sharing.
```

注意：

- 所有安全检查应在本地执行。
- 不上传内容。
- 不做过度确定性判断，使用“potential / suspected”文案。

### 10.4.6 AI Markdown 清理检查

针对 AI 输出常见问题：

- 开头或结尾包含多余解释，如“Sure, here is...”。
- 包含三重反引号包住整篇 Markdown。
- 表格过宽。
- 标题层级混乱。
- 代码块语言缺失。
- 重复总结。
- 引用和列表混用异常。
- Markdown 中出现未替换占位符，如 `[your name]`、`TODO`、`TBD`。
- 过长段落缺少标题。

## 10.5 结果展示

### 10.5.1 总览卡片

展示：

```text
Markdown Quality Score: 82 / 100
Rendering Issues: 1
Structure Suggestions: 4
README Missing Items: 2
Share Safety Warnings: 1
```

颜色和等级：

```text
90–100 Excellent
75–89 Good
60–74 Needs work
0–59 Risky
```

### 10.5.2 问题列表

字段：

```ts
type MarkdownIssue = {
  id: string;
  type: "structure" | "rendering" | "link" | "readme" | "security" | "ai_cleanup";
  severity: "info" | "warning" | "error";
  title: string;
  description: string;
  lineStart?: number;
  lineEnd?: number;
  suggestion?: string;
  fixable: boolean;
  ruleId: string;
};
```

### 10.5.3 一键定位

点击问题后：

- 编辑器滚动到对应行。
- 预览区域高亮对应内容。
- 如果无法定位，显示说明。

### 10.5.4 轻量修复

MVP 阶段支持有限修复：

- 添加缺失代码块语言。
- 修复表格分隔线。
- 添加缺失 alt 占位。
- 移除包住全文的外层代码块。
- 生成目录。
- 标题层级建议，但不自动大规模修改。
- README 缺失项插入模板段落。

## 10.6 验收标准

- 用户可在 workspace 运行 Markdown Check。
- 检查结果不上传 Markdown 正文。
- 至少支持结构、渲染、README、安全、AI cleanup 五类规则。
- 能输出总分和问题数量。
- 点击问题可定位到文本。
- 至少 3 类问题支持轻量修复。
- 分享前如存在高风险安全问题，应提示用户确认。
- Check 运行时间在普通文档下不超过 2 秒。
- 事件 `markdown_check_run` 可记录 entryIntent、issueCount、score。

---

# 11. M6：Open in MarkdownViewer / README Badge

## 11.1 模块目标

建立开发者传播入口，让 GitHub README、文档仓库和外部 Markdown URL 成为自然获客渠道。

## 11.2 核心能力

支持通过 URL 参数直接打开 Markdown：

```text
https://markdownviewer.run/open?url=<encoded-markdown-url>
```

支持 GitHub 仓库 README 快捷打开：

```text
https://markdownviewer.run/open?repo=owner/repo
```

支持指定分支和路径：

```text
https://markdownviewer.run/open?repo=owner/repo&branch=main&path=README.md
```

## 11.3 Badge 生成器

提供一个简单页面或弹窗：

```text
Generate README Badge
```

用户输入：

- GitHub repo URL。
- Markdown file path。
- Badge 文案。
- Badge 样式。

输出 Markdown：

```md
[![Open in MarkdownViewer](https://markdownviewer.run/badge.svg)](https://markdownviewer.run/open?repo=owner/repo&path=README.md)
```

也可输出 HTML：

```html
<a href="https://markdownviewer.run/open?repo=owner/repo&path=README.md">
  <img src="https://markdownviewer.run/badge.svg" alt="Open in MarkdownViewer" />
</a>
```

## 11.4 README 场景增强

当通过 badge 或 repo 参数进入时：

- 自动识别 README。
- 展示 README Check 入口。
- 支持 GitHub 风格渲染提示。
- 支持一键复制 raw URL。
- 支持分享当前预览。
- 支持打开 repo 首页。

## 11.5 增长飞轮

```text
开发者用 MarkdownViewer 检查 README
↓
生成 badge 或分享预览
↓
其他用户从 GitHub / 分享页进入
↓
新用户打开自己的 README / AI Markdown
↓
再次生成分享链接或 badge
```

## 11.6 验收标准

- URL 参数可打开 raw Markdown。
- GitHub repo URL 可解析 README。
- 用户可生成 badge Markdown。
- 通过 badge 进入的 session 可被标记为 `source=github_badge`。
- 打开失败时有清晰错误提示。
- 不影响普通 workspace 使用。

---

# 12. MVP 实施计划

## 12.1 分阶段路线

2026-06-17 修订：由于当前实现已具备分享页、workspace、本地 tab 恢复和 Share Pro intent 的基础能力，下一轮实施从收敛版 Phase 2 开始，即 **Share Growth Loop + Local Recent**。原 Phase 0/1 中的完整 analytics 后端、完整首页三入口重构，以及原 Phase 3/4 的 Markdown Check、README Badge 暂不进入本轮。

本轮实施映射：

| 本轮任务 | 对应原模块 | 处理方式 |
|---|---|---|
| 事件命名和 source 标记 | M1 | 做 M1-lite，不建后端仓库 |
| 本地 Recent/Continue | M3 | 作为核心交付 |
| 分享页 CTA 和 copy/template | M4 | 作为核心交付 |
| 首页/workspace 轻量 Continue | M2/M3 | 只做回访入口，不重做全首屏 |
| Markdown Check | M5 | 延后 |
| README Badge | M6 | 延后 |

### Phase 0：准备与基础治理，建议 2–3 天

目标：

- 明确路径、事件、数据口径。
- 确认隐私边界。
- 确认 MVP 功能开关。

任务：

- 定义 analytics 事件 schema。
- 定义匿名 visitor/session 方案。
- 梳理首页入口和 workspace 空状态设计。
- 确认 Recent Workspace 的本地存储方式。
- 确认 Markdown Check 规则清单。
- 确认 share page CTA 文案。

交付物：

- 埋点表。
- 页面原型。
- MVP scope freeze。
- 技术实现方案。

### Phase 1：数据底座 + 入口重构，建议 1 周

目标：

- 让用户更容易完成首次核心动作。
- 让团队能看到基础漏斗。

任务：

- 接入匿名 analytics。
- 实现核心事件埋点。
- 首页改为三主入口。
- Workspace 空状态重构。
- README URL 导入弹窗优化。
- Convert Document 入口优化。
- 建立基础漏斗看板。

验收：

- 能看到首访激活漏斗。
- 三主入口可用。
- 各入口能进入对应任务。
- 新用户不再面对空白 workspace。

### Phase 2：Recent Workspace + Share Growth Loop，建议 1–2 周

目标：

- 提升回访。
- 让分享页变成增长入口。

任务：

- 实现 Continue Last Session。
- 实现 Recent 面板。
- 支持 pin / remove。
- 分享页增加 Open in Workspace。
- 分享页增加 Edit a Copy。
- 分享页增加 Use as Template。
- 分享链路来源追踪。
- 分享页底部增长 CTA。

验收：

- 回访用户可继续上次 session。
- 分享页能带用户回 workspace。
- share → workspace → create share 的链路可追踪。

### Phase 3：Markdown Check Lite，建议 2 周

目标：

- 增加用户反复使用理由。
- 让产品从 viewer 变为 check workspace。

任务：

- 实现规则引擎。
- 实现结构检查。
- 实现渲染检查。
- 实现 README 完整性检查。
- 实现安全检查。
- 实现 AI Markdown cleanup 检查。
- 实现 score 和 issue panel。
- 实现点击定位。
- 实现部分轻量修复。
- 分享前高风险提示。

验收：

- 用户可运行 Markdown Check。
- 至少 20 条 MVP 规则可用。
- 检查结果可定位。
- 分享前安全提醒可用。
- 运行时间满足性能要求。

### Phase 4：Open in MarkdownViewer + README Badge，建议 1 周

目标：

- 建立开发者增长入口。

任务：

- 支持 `/open?url=`。
- 支持 `/open?repo=owner/repo`。
- 支持指定 branch/path。
- 实现 badge 生成器。
- 生成 badge.svg。
- 记录 badge 来源。
- README 场景自动推荐 Markdown Check。

验收：

- GitHub README 可通过 URL 参数打开。
- badge 代码可复制。
- badge 来源可追踪。
- 打开失败有清晰提示。

## 12.2 MVP 总排期建议

| 阶段 | 周期 | 优先级 | 目标 |
|---|---:|---:|---|
| Phase 0 | 2–3 天 | P0 | 需求冻结、埋点与隐私方案 |
| Phase 1 | 1 周 | P0 | 首访激活与数据底座 |
| Phase 2 | 1–2 周 | P0/P1 | 回访与分享增长 |
| Phase 3 | 2 周 | P1 | Markdown Check 粘性能力 |
| Phase 4 | 1 周 | P2 | 开发者传播入口 |

建议 MVP 总周期：

```text
5–6 周
```

---

# 13. 关键指标体系

## 13.1 Acquisition 获取

| 指标 | 说明 |
|---|---|
| UV | 独立访问用户 |
| Landing source | direct/search/share/github/social |
| Share referral sessions | 分享页带来的 session |
| Badge referral sessions | README badge 带来的 session |
| SEO landing pages | 搜索进入页面 |
| New visitor activation rate | 新用户激活率 |

## 13.2 Activation 激活

| 指标 | 说明 |
|---|---|
| Core action rate | 访问后完成核心动作比例 |
| Time to first core action | 从访问到核心动作耗时 |
| Entry intent distribution | 三主入口使用占比 |
| Paste success rate | 粘贴成功率 |
| Import success rate | URL/GitHub 导入成功率 |
| Convert success rate | 文档转换成功率 |
| Render success rate | Markdown 渲染成功率 |

## 13.3 Retention 留存

| 指标 | 说明 |
|---|---|
| D1 return rate | 1 日回访率 |
| D7 return rate | 7 日回访率 |
| D30 return rate | 30 日回访率 |
| Returning activated users | 回访且激活用户 |
| Recent Workspace open rate | 打开最近工作区比例 |
| Continue Last Session rate | 继续上次 session 比例 |
| PWA installed users | PWA 安装用户 |
| Repeat check users | 多次运行 Markdown Check 用户 |

## 13.4 Referral 传播

| 指标 | 说明 |
|---|---|
| Share links created | 创建分享链接数 |
| Share page views | 分享页访问数 |
| Share to workspace conversion | 分享页回 workspace 转化 |
| Edit copy rate | 分享页编辑副本比例 |
| Use template rate | 分享页使用模板比例 |
| Share chain depth | 分享链路深度 |
| Badge generated | badge 生成次数 |
| Badge click sessions | badge 点击带来的 session |

## 13.5 Engagement 使用深度

| 指标 | 说明 |
|---|---|
| Markdown Check runs | 检查运行次数 |
| Average check score | 平均评分 |
| Issues found per document | 每文档平均问题数 |
| Fix click rate | 修复建议点击率 |
| Export rate | 导出比例 |
| Save to disk rate | 保存比例 |
| Multi-tab usage rate | 多 tab 使用比例 |
| Folder workspace usage | 文件夹工作区使用比例 |

---

# 14. 实验设计

## 14.1 实验 A：首页入口文案

目标：

验证哪种定位更能提升首次激活。

版本：

```text
A：Online Markdown Viewer
B：Read, check, convert, and share Markdown
C：Paste AI Markdown / Preview README / Convert Document
```

核心指标：

- entry_click rate。
- core_action rate。
- time_to_first_core_action。
- D7 return rate。

判定：

- 若 C 版本激活率提升 ≥ 20%，采用任务入口版首页。

## 14.2 实验 B：Share Page CTA

目标：

验证分享页 CTA 是否带来新用户。

版本：

```text
A：无 CTA
B：顶部 Open in Workspace
C：顶部 + 底部 CTA + Edit a Copy
```

核心指标：

- share_open_workspace rate。
- share_edit_copy rate。
- create_own_share rate。
- bounce rate。

判定：

- 若 C 版本从分享页到 workspace 转化 ≥ 5%，保留 CTA。

## 14.3 实验 C：Markdown Check 入口

目标：

验证 Check 是否是高粘性功能。

版本：

```text
A：工具栏入口
B：工具栏 + 分享前提示
C：工具栏 + 分享前提示 + README 自动推荐
```

核心指标：

- markdown_check_run rate。
- repeat check rate。
- share after check rate。
- D7 return rate。

判定：

- 若运行 Check 的用户 D7 留存显著高于未运行用户，继续加码 Check。

## 14.4 实验 D：Recent Workspace

目标：

验证 Recent 是否提升回访和使用便利。

版本：

```text
A：不展示 Continue Last Session
B：首页展示 Continue Last Session
C：首页 + Workspace 空状态 + Recent 面板
```

核心指标：

- continue_last_session rate。
- recent_workspace_open rate。
- D7 return rate。
- repeated core action rate。

判定：

- 若 Recent 使用用户回访率高于普通用户 ≥ 30%，继续增强本地 workspace。

---

# 15. 护城河设计

## 15.1 不依赖数据锁定的护城河

早期不应通过强制登录、私有格式、迁移困难来锁定用户。更适合的护城河是习惯和工作流。

护城河来源：

```text
使用习惯
本地 workspace 记忆
分享链接网络
README badge 入口
Markdown Check 规则库
AI Markdown cleanup 模式
模板和检查经验积累
PWA / 默认打开工具
```

## 15.2 增长飞轮

### 飞轮 1：AI Markdown 飞轮

```text
用户粘贴 AI Markdown
→ 阅读体验好
→ 运行 Markdown Check
→ 修复或整理
→ 分享 / 导出
→ 下次 AI 输出继续回来
```

### 飞轮 2：Share 飞轮

```text
用户创建分享链接
→ 他人打开分享页
→ 点击 Edit a Copy / Use as Template
→ 新用户创建自己的文档
→ 新分享链接继续传播
```

### 飞轮 3：README 飞轮

```text
开发者导入 README
→ 检查 README 完整性
→ 生成 badge / 分享预览
→ GitHub 访客进入 MarkdownViewer
→ 更多开发者导入自己的 README
```

### 飞轮 4：Local-first Workspace 飞轮

```text
用户打开本地文件 / 文件夹
→ Recent 保存上下文
→ 下次继续 session
→ 安装 PWA
→ 逐渐成为默认 Markdown reader
```

---

# 16. 非目标范围

MVP 阶段明确不做：

- 强制注册登录。
- 付费订阅。
- 团队空间。
- 复杂权限系统。
- 实时多人协作。
- SSO / RBAC。
- 企业管理后台。
- 大规模 API 计费。
- 完整云端知识库。
- 与 Notion / GitBook / HackMD 全面竞争。
- LLM 自动重写整篇文档。
- 云端保存所有用户文档。

---

# 17. 风险与应对

## 17.1 功能过多导致定位发散

风险：

- 继续堆功能会让用户不知道产品到底解决什么问题。

应对：

- 首页只保留三主入口。
- 所有新功能都必须映射到 AI Markdown、README、文档转换、本地 workspace、分享增长之一。

## 17.2 Markdown Check 质量不足

风险：

- 检查太弱，用户觉得没用。
- 检查误报太多，用户不信任。

应对：

- 先做确定性强的静态规则。
- 区分 error、warning、info。
- 对不确定项使用“potential / suggestion”文案。
- 允许用户忽略规则。
- 后续基于用户反馈优化规则。

## 17.3 分享页滥用

风险：

- 被用于垃圾内容、违规内容、过大内容。
- 存储成本增加。

应对：

- 创建频率限制。
- 文件大小限制。
- Report / Delete 机制。
- 可选 noindex。
- 滥用监控。
- 内容安全策略。

## 17.4 隐私信任不足

风险：

- 用户担心文档上传。

应对：

- 明确本地优先。
- 转换和分享前说明是否上传。
- Analytics 不上传正文。
- 安全检查本地执行。
- 提供隐私说明页面。

## 17.5 Recent Workspace 兼容性

风险：

- 浏览器文件句柄权限不稳定。
- 用户清缓存导致记录丢失。

应对：

- 提示 recent 存储在本地。
- 权限失效时重新选择文件。
- 不承诺云同步。
- 后续再引入可选登录同步。

---

# 18. 上线清单

## 18.1 产品上线前

- [ ] 首页三主入口完成。
- [ ] Workspace 空状态完成。
- [ ] Continue Last Session 可用。
- [ ] Recent 面板可用。
- [ ] Share page CTA 可用。
- [ ] Markdown Check Lite 可用。
- [ ] README badge MVP 可用。
- [ ] 隐私说明更新。
- [ ] 分享前上传提示完成。
- [ ] 移动端核心路径可用。

## 18.2 数据上线前

- [ ] 匿名 visitor_id 可用。
- [ ] session_id 可用。
- [ ] 核心事件埋点完成。
- [ ] 首访激活漏斗可用。
- [ ] 分享页漏斗可用。
- [ ] 回访指标可用。
- [ ] Markdown Check 漏斗可用。
- [ ] 不上传 Markdown 正文。
- [ ] 埋点失败不影响功能。

## 18.3 QA 上线前

- [ ] 粘贴 Markdown 正常。
- [ ] 打开本地文件正常。
- [ ] 打开本地文件夹正常。
- [ ] GitHub URL 导入正常。
- [ ] 文档转换正常。
- [ ] 创建分享链接正常。
- [ ] 分享页打开 workspace 正常。
- [ ] Edit a Copy 不影响原文。
- [ ] Use as Template 正常。
- [ ] Markdown Check 能定位问题。
- [ ] 移动端可用。
- [ ] PWA 不受影响。

---

# 19. 后续演进方向

当 MVP 证明有效后，再考虑下一阶段。

## 19.1 可选账号同步

前提：

- Recent Workspace 使用率高。
- D7 / D30 回访明显提升。
- 用户反馈希望跨设备同步。

功能：

- 登录同步 recent。
- 同步 pinned workspace。
- 同步 share links。
- 同步 Markdown Check 历史。

## 19.2 模板库

前提：

- Use as Template 使用率高。
- 分享链路有传播深度。

功能：

- README 模板。
- PRD 模板。
- Release notes 模板。
- AI prompt output 模板。
- 技术方案模板。

## 19.3 GitHub App

前提：

- README badge 和 GitHub import 使用率高。

功能：

- PR 中自动预览 Markdown。
- README Check 评论。
- Broken link check。
- Release note preview。
- GitHub Action。

## 19.4 商业化

前提：

- 留存和高价值场景验证完成。
- Share / Convert / Check / GitHub workflow 任一方向出现明确高频用户。

可商业化方向：

- Share Pro。
- Converter Pro / API。
- AI Markdown QA Pro。
- Team Workspace。
- GitHub README Preview Suite。

---

# 20. 最终建议

现阶段最正确的产品策略不是商业化，也不是继续横向堆功能，而是：

```text
用最小 MVP 验证 markdownviewer.run 是否能成为用户处理 AI Markdown、README、文档转换和本地 Markdown 的默认工作台。
```

优先级如下：

```text
P0：埋点 + 首页任务入口 + Workspace 空状态
P0：Recent Workspace + Continue Last Session
P1：Share Page Growth Loop
P1：Markdown Check / AI Markdown QA Lite
P2：Open in MarkdownViewer / README Badge
P3：账号同步、团队、商业化
```

如果只能先做一个版本，建议先做：

```text
1. 首页三入口：Paste AI Markdown / Preview README / Convert Document
2. Workspace 空状态任务引导
3. Recent Workspace / Continue Last Session
4. Share page 的 Open in Workspace / Edit a Copy
5. Markdown Check Lite 的前 20 条规则
```

这组 MVP 可以同时提升：

- 新用户激活。
- 老用户回访。
- 分享传播。
- 使用便利。
- AI Markdown 场景心智。
- README 发布前检查心智。
- 长期工作流护城河。
