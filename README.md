<div align="center">

# Markdown Viewer Online

**A polished online Markdown viewer for README files, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, code blocks, AI output, local files, GitHub URLs, Gists, raw Markdown links, document-to-Markdown conversion, and stored share links.**

[![Live Website](https://img.shields.io/badge/Live-markdownviewer.run-111827?style=for-the-badge)](https://markdownviewer.run/)
[![Workspace](https://img.shields.io/badge/Open-Workspace-2563eb?style=for-the-badge)](https://markdownviewer.run/workspace)
[![License: MIT](https://img.shields.io/badge/License-MIT-16a34a?style=for-the-badge)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)

[Live Markdown Viewer](https://markdownviewer.run/) - [Open the Workspace](https://markdownviewer.run/workspace) - [Changelog](https://markdownviewer.run/changelog) - [Star the Project](https://github.com/stewart-lhc/markdownviewer)

Current product update: **26.617**. Current package release: **v0.2.0**. See [CHANGELOG.md](CHANGELOG.md) and the live [Changelog](https://markdownviewer.run/changelog) for release notes and update history.

</div>

## English

### Short Pitch

[markdownviewer.run](https://markdownviewer.run/) is a free, open-source Markdown viewer built for people who care how technical Markdown looks before it ships. Paste Markdown, drop a file, convert a document to Markdown, open a local docs folder, load a GitHub README, load a Gist, or preview a raw URL and get a clean live preview in the browser.

It is designed to be more than a plain textarea preview. Markdownviewer gives README files, AI-generated Markdown, converted DOCX/PPTX/XLSX/CSV/HTML/JSON/XML/text-heavy PDF files, specs, changelogs, Mermaid diagrams, math notes, and code-heavy documents a focused reading surface with persistent tabs, stored share links, HTML/PDF export, PWA file opening, and a local folder workspace.

### Why Developers Use It

| Need | What Markdownviewer gives you |
| --- | --- |
| Preview README.md online | Open README files before publishing to GitHub, npm, docs pages, or product sites. |
| Read AI-generated Markdown | Turn raw ChatGPT, Claude, Cursor, Copilot, or coding-agent output into a clean document. |
| Check GitHub Flavored Markdown | Review tables, task lists, links, code fences, and README-style formatting. |
| Render technical Markdown | Preview Mermaid diagrams, KaTeX math, and syntax-highlighted code blocks. |
| Open Markdown from anywhere | Load local files, local folders, pasted Markdown, GitHub content, Gists, and raw URLs. |
| Convert documents to Markdown | Turn DOCX, PPTX, spreadsheets, HTML, JSON, XML, CSV, and text-heavy PDF files into Markdown tabs. |
| Share Markdown properly | Create short stored `/share/{id}` links, then let readers open the document, edit a local copy, or use it as a template. |
| Keep docs organized | Use persistent workspace tabs, a local Continue list, folder browsing, relative Markdown links, and save-to-disk on supported browsers. |

### Feature Highlights

- **Live Markdown preview** - edit or paste Markdown and see the rendered document update immediately.
- **README-first workflow** - built for README.md, changelogs, API docs, product notes, specs, and long-form technical writing.
- **GitHub Flavored Markdown support** - tables, task lists, links, fenced code blocks, and common README patterns.
- **Mermaid diagram rendering** - preview flowcharts and architecture diagrams inside Markdown.
- **KaTeX math rendering** - read inline and display formulas in technical notes.
- **Syntax-highlighted code blocks** - keep code-heavy documents readable.
- **Multiple import paths** - local files, local folders, pasted Markdown, GitHub URLs, Gists, raw Markdown URLs, and sample documents.
- **Document-to-Markdown conversion** - convert DOCX, PPTX, XLSX, XLS, CSV, HTML, JSON, XML, and text-heavy PDF files, then open the converted Markdown in a new workspace tab.
- **Local Folder Workspace** - open a local docs folder in supported desktop browsers, browse Markdown files, follow relative links, and save changes back to disk.
- **Persistent workspace tabs** - keep multiple Markdown documents open with independent source labels and restored tab state.
- **Stored share links** - generate canonical `/share/{id}` pages through `/api/share`, backed by Vercel Blob in production and a local file-store fallback in development.
- **Share growth loop** - shared pages include open, edit-copy, and use-as-template workspace actions with lightweight event tracking.
- **Local Recent and Continue** - recent shares, share copies/templates, and converted documents are kept in local browser storage and surfaced on the homepage and workspace.
- **Early-access waitlists** - collect verified email interest for future Share Pro and Converter API workflows without putting the free workspace behind a paywall.
- **Full share-page reader** - shared documents keep the logo, table of contents, typography controls, themes, font size controls, preview margin controls, and open-in-workspace behavior.
- **Immersive reading** - open workspace previews and shared documents in a book-style reader with text, typography controls, navigation, and a thin progress bar.
- **Installable PWA** - install Markdownviewer from supported browsers, use the mobile install prompt, and open `.md` files with it on compatible desktop Chromium browsers.
- **Export** - export polished HTML or print/PDF from the preview workspace.
- **Chinese localization** - use localized landing and workspace routes at `/zh-CN`.
- **Mobile app-style workspace** - refined mobile navigation, focused tab selection, auto-hiding top chrome, and a collapsible preview control bar.
- **Focused Markdown workflow pages** - dedicated pages for README preview, GFM, Mermaid, Markdown math, AI Markdown, online Markdown file viewing, and document conversion.
- **Open-source and self-hostable** - MIT licensed, built with Next.js, React, and TypeScript.

### Recent Updates

| Version | Date | Product update |
| --- | --- | --- |
| **26.617** | 2026-06-17 | Added share-page edit-copy and use-as-template actions, local Recent/Continue panels, System/Light/Dark controls, real feature screenshots, a readable dark palette, taller mobile live preview, and a refined mobile breadcrumbs menu with Workspace directly beside the trigger. |
| **26.612** | 2026-06-12 | Added automatic light/dark site theming from the system color scheme and separate workspace template memory for the most recent light and dark templates. |
| **26.611** | 2026-06-11 | Added early-access waitlist capture with email confirmation, a `/pricing` waitlist page, Resend delivery, and Neon/Postgres production storage with D1 and local development fallbacks. |
| **26.610** | 2026-06-10 | Refined the desktop workspace with per-tab preview scroll restoration, new tabs that start at the top, a resizable tab sidebar, a cleaner Paste/Blank/File/Folder new-tab dialog, consistent editor toolbar icons, preview line-height controls, auto-dismissing status messages, and theme-aware contents scrollbars. |
| **26.609** | 2026-06-09 | Refined the mobile workspace reader with auto-hiding top chrome, a default-hidden preview bottom bar, and a mobile PWA install prompt with native install support plus add-to-home-screen guidance. |
| **26.604** | 2026-06-04 | Added server-stored share links, canonical `/share/{id}` pages, Vercel Blob production storage, local development fallback storage, full preview-reader controls on share pages, the restored share-page logo, and working M- / M+ preview margin controls. |
| **26.603** | 2026-06-03 | Added document-to-Markdown conversion for Office, data, HTML, and text-heavy PDF files, a focused converter SEO page, updated homepage/README/llms discovery copy, and evenly spaced preview margin levels. |
| **26.602** | 2026-06-02 | Added six long-tail SEO landing pages, homepage quick links plus sitemap/llms discovery, FAQ structured data, default wide preview margins, workspace language switching, share-link fallback copying, and a build-stable local monospace font stack. |
| **26.531** | 2026-05-31 | Fixed mobile landing layout, added full-width top navigation, shipped the live changelog page, enlarged mobile workspace import controls, auto-collapsed the mobile tab rail, exposed generated share links, and refined the mobile preview bottom bar. |
| **26.530** | 2026-05-30 | Added Local Folder Workspace, folder browsing, relative Markdown link navigation, save-to-disk, folder reconnect states, mobile workspace layout fixes, and PWA tab handling improvements. |

### Perfect For

- Developers polishing a project README before publishing.
- Indie hackers adding a Markdown preview tool to their workflow.
- Technical writers reviewing docs without a full docs-site build.
- Students reading notes with code, diagrams, and formulas.
- AI power users turning model output into readable documents.
- Teams converting Word docs, slide decks, spreadsheets, HTML, JSON, XML, CSV, and text-heavy PDFs into Markdown drafts.
- Teams that need short public Markdown share links with a real reader page.

### Backlink-Friendly Description

Use this paragraph when listing the project in directories, roundups, resource pages, or comparison posts:

> [Markdown Viewer Online](https://markdownviewer.run/) is a free online Markdown viewer and live preview workspace for README files, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, syntax-highlighted code blocks, AI-generated Markdown, document-to-Markdown conversion, stored share links, local files, GitHub URLs, Gists, and raw Markdown links.

Suggested anchor text:

- Markdown Viewer Online
- online Markdown viewer
- Markdown preview online
- README viewer online
- GitHub Flavored Markdown viewer
- Mermaid Markdown viewer
- AI Markdown viewer
- document to Markdown converter
- Word to Markdown converter
- PDF to Markdown converter

### What Makes It Different

| Typical Markdown utility | Markdownviewer.run |
| --- | --- |
| Plain textarea and preview | Editorial reading surface with a focused workspace |
| Basic Markdown only | README, GFM, code, Mermaid, and KaTeX-oriented rendering |
| Paste-only workflow | File, folder, document conversion, paste, GitHub, Gist, raw URL, and sample imports |
| URL-packed share state | Stored share records with independent `/share/{id}` reader pages |
| Disposable one-off page | Open-source project with a canonical GitHub repository |
| Generic preview experience | Built around developer docs, AI output, and technical writing |

### Live Product Links

- Website: [https://markdownviewer.run/](https://markdownviewer.run/)
- Workspace: [https://markdownviewer.run/workspace](https://markdownviewer.run/workspace)
- README viewer: [https://markdownviewer.run/use-cases/readme-viewer](https://markdownviewer.run/use-cases/readme-viewer)
- GitHub Flavored Markdown viewer: [https://markdownviewer.run/features/github-flavored-markdown-viewer](https://markdownviewer.run/features/github-flavored-markdown-viewer)
- Mermaid Markdown viewer: [https://markdownviewer.run/features/mermaid-markdown-viewer](https://markdownviewer.run/features/mermaid-markdown-viewer)
- Markdown math preview: [https://markdownviewer.run/features/markdown-math-preview](https://markdownviewer.run/features/markdown-math-preview)
- AI Markdown viewer: [https://markdownviewer.run/use-cases/ai-markdown-viewer](https://markdownviewer.run/use-cases/ai-markdown-viewer)
- Markdown file viewer online: [https://markdownviewer.run/use-cases/markdown-file-viewer-online](https://markdownviewer.run/use-cases/markdown-file-viewer-online)
- Document to Markdown converter: [https://markdownviewer.run/use-cases/document-to-markdown-converter](https://markdownviewer.run/use-cases/document-to-markdown-converter)
- Source code: [https://github.com/stewart-lhc/markdownviewer](https://github.com/stewart-lhc/markdownviewer)
- Issues: [https://github.com/stewart-lhc/markdownviewer/issues](https://github.com/stewart-lhc/markdownviewer/issues)

### Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [rehype-katex](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex)
- [Mermaid](https://mermaid.js.org/)
- [Prism.js](https://prismjs.com/)

### Local Development

Requirements:

- Node.js 20 or newer
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the test suite:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

### Local Folder Workspace

Markdownviewer `/workspace` supports local folder mode in Chromium desktop browsers. After choosing a docs or project folder, you can browse `.md`, `.markdown`, `.mdx`, and `.txt` files, open files for preview and editing, save back to disk with `Ctrl+S` or `Cmd+S`, create `Untitled.md`, and follow relative Markdown links such as `docs/a.md`, `../guide.md`, and `./intro.md#heading`.

This feature uses the native File System Access API. Desktop Chrome and Edge support local folder read/write access. Safari, Firefox, and mobile browsers fall back to the normal online Markdown viewer workflow: paste Markdown, upload a single local file, open GitHub/raw URLs, create stored share links, and export HTML/PDF without requesting persistent folder write permission.

### PWA And File Opening

Markdownviewer ships with a web app manifest and service worker, so production builds can be installed as a PWA. The manifest declares file handlers for `.md`, `.markdown`, `.mdx`, and related Markdown extensions.

On Chromium-based desktop browsers that support PWA file handling, install the app from the browser, then choose Markdownviewer as an app for Markdown files in the operating system's "Open with" flow. Files opened this way are read locally in the browser and loaded into a new workspace tab.

### Share Link Storage

New share links are created through `/api/share` and open at canonical `/share/{id}` URLs. This keeps links short, avoids URL-size failures for large Markdown files, and gives shared Markdown an independent public page that can be linked and crawled.

Shared pages can open the document in the workspace, open an editable local copy, or use the shared Markdown as a template. These actions do not overwrite the original share. The browser also keeps a local Recent list for newly created shares, share copies/templates, and converted documents so returning users can continue without an account.

Production deployments should provide `BLOB_READ_WRITE_TOKEN` for Vercel Blob storage. Local development uses a file-store fallback under the project workspace so share behavior can still be tested without cloud credentials.

Legacy compressed `md-...` links remain readable, but new shares use stored records by default.

### Waitlist Storage

The `/pricing` page collects early-access interest for future controlled sharing and conversion automation. Waitlist submissions validate the email address, send a Resend confirmation email, and mark the subscriber as verified only after the confirmation link is opened. Duplicate submissions for an already verified email stay verified and do not send another confirmation email.

Production deployments should provide `DATABASE_URL` or `POSTGRES_URL` for Neon/Postgres waitlist storage on Vercel. Cloudflare D1 is retained only as a migration/self-hosting compatibility fallback through `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, and `CLOUDFLARE_API_TOKEN`. Local development falls back to `.data/waitlist/subscribers.jsonl` when no remote storage credentials are configured.

### Project Structure

```text
app/                 Next.js app routes, metadata, sitemap, and API routes
components/          Landing page, brand, Markdown renderer, share reader, and workspace UI
lib/                 Markdown loading, source parsing, sharing, export, and editor logic
public/              Public AI and crawler context files
tests/               Vitest coverage for renderer, workspace, imports, share pages, and landing page
types/               Local type declarations
```

### SEO And Attribution

This repository is the canonical open-source home for [markdownviewer.run](https://markdownviewer.run/), an online Markdown viewer and Markdown preview workspace. If you mention the project in a directory, article, comparison, or resource list, please link to the live tool with a descriptive anchor such as "Markdown Viewer Online", "online Markdown viewer", or "Markdown preview online".

The site is positioned around these use cases: markdown viewer, markdown viewer online, online markdown viewer, markdown preview, markdown preview online, GitHub Flavored Markdown viewer, README viewer online, Mermaid Markdown viewer, Markdown viewer with math, AI Markdown viewer, ChatGPT Markdown viewer, Claude Markdown viewer, raw Markdown viewer, markdown file viewer online, document to Markdown converter, Word to Markdown converter, PDF to Markdown converter, DOCX to Markdown, and Markdown share links.

### Contributing

Issues and pull requests are welcome. Good contributions include renderer fixes, import-source improvements, share-page improvements, accessibility improvements, test coverage, performance improvements, and focused workspace UI refinements.

For larger changes, open an issue first so the scope is clear before implementation.

### License

MIT License. See [LICENSE](LICENSE).

## 中文说明

### 产品简介

[markdownviewer.run](https://markdownviewer.run/) 是一个免费、开源的在线 Markdown 查看器，适合在发布前检查技术文档的真实阅读效果。你可以粘贴 Markdown、上传文件、把文档转换成 Markdown、打开本地 docs 文件夹、加载 GitHub README、加载 Gist，或预览 raw Markdown URL，并在浏览器里获得干净的实时预览。

它不是一个普通 textarea 工具。Markdownviewer 面向 README、AI 生成的 Markdown、转换后的 DOCX/PPTX/XLSX/CSV/HTML/JSON/XML/文本型 PDF、规格说明、更新日志、Mermaid 图表、数学公式和代码密集文档，提供持久 tabs、正式分享链接、HTML/PDF 导出、PWA 文件打开和本地文件夹工作区。

### 为什么开发者会用它

| 需求 | Markdownviewer 提供什么 |
| --- | --- |
| 在线预览 README.md | 在发布到 GitHub、npm、文档站或产品网站前检查 README。 |
| 阅读 AI 生成的 Markdown | 把 ChatGPT、Claude、Cursor、Copilot 或 coding agent 的原始输出变成干净文档。 |
| 检查 GitHub Flavored Markdown | 审阅表格、任务列表、链接、代码围栏和 README 风格排版。 |
| 渲染技术 Markdown | 预览 Mermaid 图表、KaTeX 数学公式和语法高亮代码块。 |
| 从多个来源打开 Markdown | 加载本地文件、本地文件夹、粘贴内容、GitHub 内容、Gist 和 raw URL。 |
| 把文档转换成 Markdown | 将 DOCX、PPTX、电子表格、HTML、JSON、XML、CSV 和文本型 PDF 转成 Markdown tabs。 |
| 正式分享 Markdown | 创建短的 `/share/{id}` 存储链接，并让读者打开、编辑本地副本或作为模板使用。 |
| 管理一组文档 | 使用持久 workspace tabs、本地 Continue 列表、文件夹浏览、相对 Markdown link 跳转，以及支持浏览器里的保存到磁盘。 |

### 功能亮点

- **实时 Markdown 预览** - 编辑或粘贴 Markdown 后立即看到渲染结果。
- **README 优先工作流** - 面向 README.md、更新日志、API 文档、产品笔记、规格说明和长篇技术写作。
- **GitHub Flavored Markdown 支持** - 支持表格、任务列表、链接、代码围栏和常见 README 模式。
- **Mermaid 图表渲染** - 直接在 Markdown 中预览流程图和架构图。
- **KaTeX 数学公式渲染** - 支持技术笔记中的行内公式和块级公式。
- **语法高亮代码块** - 让代码密集文档保持可读。
- **多种导入方式** - 支持本地文件、本地文件夹、粘贴 Markdown、GitHub URL、Gist、raw Markdown URL 和示例文档。
- **文档转 Markdown** - 支持 DOCX、PPTX、XLSX、XLS、CSV、HTML、JSON、XML 和文本型 PDF，并把转换结果打开为新的 workspace tab。
- **本地文件夹工作区** - 在支持的桌面浏览器里打开本地 docs 文件夹，浏览 Markdown 文件、跳转相对 links，并保存回磁盘。
- **持久 workspace tabs** - 多个 Markdown 文档可以独立保存来源标签和恢复状态。
- **正式分享链接** - 通过 `/api/share` 生成规范的 `/share/{id}` 页面；生产环境使用 Vercel Blob，本地开发使用文件存储 fallback。
- **分享增长闭环** - 分享页提供打开、编辑副本和作为模板使用三个工作区动作，并记录轻量事件。
- **本地 Recent / Continue** - 最近创建的分享、从分享打开的副本/模板和转换后的文档会保存在浏览器本地，并出现在首页和工作区。
- **完整分享页阅读器** - 分享文档保留 LOGO、目录、排版控制、主题、字号、预览留白控制，以及在 workspace 中打开的入口。
- **沉浸式阅读** - 将 workspace 预览和分享文档打开为书本式阅读层，只保留正文、排版控制、导航和一条细进度条。
- **可安装 PWA** - 可从支持的浏览器安装 Markdownviewer，移动端提供安装提示；兼容的桌面 Chromium 浏览器还可以通过系统文件打开 `.md`。
- **导出能力** - 可以从预览工作区导出 HTML，或打印/保存 PDF。
- **中文界面** - 提供 `/zh-CN` 的本地化首页和工作区。
- **移动端工作区** - 优化移动端导航、tab 选择、自动隐藏顶栏和可收起的底部预览控制栏。
- **聚焦工作流页面** - 为 README 预览、GFM、Mermaid、Markdown math、AI Markdown、在线 Markdown 文件查看和文档转换提供独立页面。
- **开源可自托管** - MIT License，基于 Next.js、React 和 TypeScript。

### 近期更新

| 版本 | 日期 | 产品更新 |
| --- | --- | --- |
| **26.617** | 2026-06-17 | 新增分享页编辑副本、作为模板使用、本地 Recent/Continue、System / Light / Dark 控制、真实功能截图、可读深色配色、更高的移动端 live preview，并修复移动端 breadcrumbs 菜单，让 Workspace 紧挨触发按钮左侧。 |
| **26.612** | 2026-06-12 | 新增跟随系统色彩偏好的自动亮/暗站点主题，并为 workspace 分别记住最近使用的亮色模板和暗色模板。 |
| **26.611** | 2026-06-11 | 新增 `/pricing` 早期访问 waitlist、邮箱确认、Resend 发送，以及 Neon/Postgres 生产存储，并保留 D1 和本地开发 fallback。 |
| **26.610** | 2026-06-10 | 优化桌面端 workspace：每个 tab 记住自己的预览滚动位置，新建 tab 默认从顶部打开，左侧 tab 栏可拖拽调整宽度，新建 tab 弹窗改为 Paste / Blank / File / Folder 四个纵向按钮，编辑器工具栏图标统一，新增预览行距 L- / L+ 控制，普通状态提示 3 秒后自动消失，并让目录滚动条跟随深色主题。 |
| **26.609** | 2026-06-09 | 优化移动端 workspace 阅读器：顶栏自动隐藏、底部预览控制栏默认收起，并新增移动端 PWA 安装提示，支持原生安装和添加到主屏幕指引。 |
| **26.604** | 2026-06-04 | 新增服务端存储分享链接、规范 `/share/{id}` 页面、Vercel Blob 生产存储、本地开发 fallback 存储、分享页完整预览阅读控制、恢复分享页 LOGO，并修复 M- / M+ 预览留白控制。 |
| **26.603** | 2026-06-03 | 新增 Office、数据文件、HTML 和文本型 PDF 的文档转 Markdown，新增转换器 SEO 页面，更新首页/README/llms 发现文案，并调整预览留白档位。 |
| **26.602** | 2026-06-02 | 新增 6 个长尾 SEO 页面、首页 quick links、sitemap/llms 入口、FAQ structured data、默认宽预览留白、workspace 语言切换、分享链接 fallback 复制和本地 monospace 字体栈。 |
| **26.531** | 2026-05-31 | 修复移动端首页布局，新增满宽顶部导航，发布 live changelog 页面，放大移动端导入控制，选择/导入 tab 后自动收起 tab 栏，并优化移动端预览底栏。 |
| **26.530** | 2026-05-30 | 新增本地文件夹工作区、文件夹浏览、相对 Markdown link 跳转、保存到磁盘、文件夹重连状态、移动端 workspace 修复和 PWA tab 处理。 |

### 适合哪些场景

- 开发者在发布前打磨项目 README。
- 独立开发者把 Markdown preview 放进日常工作流。
- 技术写作者在不启动完整文档站的情况下检查文档。
- 学生阅读包含代码、图表和公式的笔记。
- AI 重度用户把模型输出变成可读文档。
- 团队把 Word、幻灯片、电子表格、HTML、JSON、XML、CSV 和文本型 PDF 转成 Markdown 草稿。
- 团队需要能公开访问、链接短、阅读页完整的 Markdown 分享链接。

### 适合外链引用的描述

如果你把项目放到目录站、工具合集、资源页或对比文章里，可以使用下面这段：

> [Markdown Viewer Online](https://markdownviewer.run/) 是一个免费的在线 Markdown 查看器和实时预览工作区，支持 README、GitHub Flavored Markdown、Mermaid 图表、KaTeX 数学公式、语法高亮代码块、AI 生成 Markdown、文档转 Markdown、正式分享链接、本地文件、GitHub URL、Gist 和 raw Markdown link。

推荐 anchor text：

- Markdown Viewer Online
- online Markdown viewer
- Markdown preview online
- README viewer online
- GitHub Flavored Markdown viewer
- Mermaid Markdown viewer
- AI Markdown viewer
- document to Markdown converter
- Word to Markdown converter
- PDF to Markdown converter

### 它和普通 Markdown 工具有何不同

| 普通 Markdown 工具 | Markdownviewer.run |
| --- | --- |
| 简单 textarea 和预览 | 有阅读质感的专注 workspace |
| 只支持基础 Markdown | 面向 README、GFM、代码、Mermaid 和 KaTeX |
| 只能粘贴 | 支持文件、文件夹、文档转换、粘贴、GitHub、Gist、raw URL 和示例导入 |
| 用超长 URL 承载分享状态 | 用存储记录生成独立 `/share/{id}` 阅读页 |
| 一次性小工具页面 | 有规范 GitHub 仓库的开源项目 |
| 通用预览体验 | 围绕开发者文档、AI 输出和技术写作打造 |

### 产品链接

- 网站：[https://markdownviewer.run/](https://markdownviewer.run/)
- 工作区：[https://markdownviewer.run/workspace](https://markdownviewer.run/workspace)
- README 查看器：[https://markdownviewer.run/use-cases/readme-viewer](https://markdownviewer.run/use-cases/readme-viewer)
- GitHub Flavored Markdown 查看器：[https://markdownviewer.run/features/github-flavored-markdown-viewer](https://markdownviewer.run/features/github-flavored-markdown-viewer)
- Mermaid Markdown 查看器：[https://markdownviewer.run/features/mermaid-markdown-viewer](https://markdownviewer.run/features/mermaid-markdown-viewer)
- Markdown 数学公式预览：[https://markdownviewer.run/features/markdown-math-preview](https://markdownviewer.run/features/markdown-math-preview)
- AI Markdown 查看器：[https://markdownviewer.run/use-cases/ai-markdown-viewer](https://markdownviewer.run/use-cases/ai-markdown-viewer)
- 在线 Markdown 文件查看：[https://markdownviewer.run/use-cases/markdown-file-viewer-online](https://markdownviewer.run/use-cases/markdown-file-viewer-online)
- 文档转 Markdown：[https://markdownviewer.run/use-cases/document-to-markdown-converter](https://markdownviewer.run/use-cases/document-to-markdown-converter)
- 源码：[https://github.com/stewart-lhc/markdownviewer](https://github.com/stewart-lhc/markdownviewer)
- Issues：[https://github.com/stewart-lhc/markdownviewer/issues](https://github.com/stewart-lhc/markdownviewer/issues)

### 技术栈

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [rehype-katex](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex)
- [Mermaid](https://mermaid.js.org/)
- [Prism.js](https://prismjs.com/)

### 本地开发

要求：

- Node.js 20 或更新版本
- npm

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

运行测试：

```bash
npm test
```

创建生产构建：

```bash
npm run build
```

### 本地文件夹工作区

Markdownviewer 的 `/workspace` 在 Chromium 桌面浏览器中支持本地文件夹模式。选择 docs 或 project 文件夹后，你可以浏览 `.md`、`.markdown`、`.mdx` 和 `.txt` 文件，打开文件进行预览和编辑，用 `Ctrl+S` 或 `Cmd+S` 保存回磁盘，新建 `Untitled.md`，并跳转 `docs/a.md`、`../guide.md`、`./intro.md#heading` 这类相对 Markdown links。

这个能力基于原生 File System Access API。桌面版 Chrome 和 Edge 支持本地文件夹读写。Safari、Firefox 和移动端浏览器会降级为普通在线 Markdown 查看器工作流：粘贴 Markdown、上传单个本地文件、打开 GitHub/raw URL、创建正式分享链接、导出 HTML/PDF，但不会请求持久文件夹写入权限。

### PWA 与文件打开

Markdownviewer 带有 web app manifest 和 service worker，因此生产构建可以安装为 PWA。manifest 声明了 `.md`、`.markdown`、`.mdx` 和相关 Markdown 扩展名的 file handlers。

在支持 PWA file handling 的 Chromium 桌面浏览器中，先从浏览器安装应用，然后在系统的“打开方式”里选择 Markdownviewer。通过这种方式打开的文件会在浏览器本地读取，并进入新的 workspace tab。

### 分享链接存储

新的分享链接通过 `/api/share` 创建，并在规范的 `/share/{id}` URL 打开。这能保持链接短小，避免大 Markdown 文件导致 URL 超长，也让分享文档拥有独立公开页面，便于链接和抓取。

分享页可以把文档打开到工作区，也可以打开一个可编辑的本地副本，或把分享内容作为模板使用。这些动作不会覆盖原分享。浏览器还会在本地保存最近创建的分享、分享副本/模板和转换后的文档，让回访用户无需账号也能继续。

生产部署应配置 `BLOB_READ_WRITE_TOKEN` 以使用 Vercel Blob 存储。本地开发会使用项目工作区里的文件存储 fallback，所以没有云端凭证也能测试分享行为。

旧的压缩 `md-...` 链接仍可读取，但新的分享默认使用存储记录。

### 项目结构

```text
app/                 Next.js 路由、metadata、sitemap 和 API routes
components/          首页、品牌组件、Markdown renderer、分享阅读器和 workspace UI
lib/                 Markdown 加载、来源解析、分享、导出和编辑器逻辑
public/              面向 AI 和爬虫的公开上下文文件
tests/               renderer、workspace、导入、分享页和首页测试
types/               本地类型声明
```

### SEO 与引用

这个仓库是 [markdownviewer.run](https://markdownviewer.run/) 的规范开源主页。如果你在目录、文章、对比或资源列表中提到本项目，请链接到线上工具，并使用 “Markdown Viewer Online”、“online Markdown viewer” 或 “Markdown preview online” 等描述性 anchor。

站点围绕这些使用场景定位：markdown viewer、markdown viewer online、online markdown viewer、markdown preview、markdown preview online、GitHub Flavored Markdown viewer、README viewer online、Mermaid Markdown viewer、Markdown viewer with math、AI Markdown viewer、ChatGPT Markdown viewer、Claude Markdown viewer、raw Markdown viewer、markdown file viewer online、document to Markdown converter、Word to Markdown converter、PDF to Markdown converter、DOCX to Markdown 和 Markdown share links。

### 贡献

欢迎提交 issues 和 pull requests。合适的贡献包括 renderer 修复、导入来源改进、分享页改进、可访问性改进、测试覆盖、性能优化和聚焦的 workspace UI 调整。

较大的改动建议先开 issue，明确范围后再实现。

### 许可证

MIT License。详见 [LICENSE](LICENSE)。
