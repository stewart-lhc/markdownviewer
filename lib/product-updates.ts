import type { Locale } from "@/lib/i18n/locales";

type LocalizedUpdate = {
  highlights: string[];
  summary: string;
  title: string;
};

export type ProductUpdate = {
  date: string;
  version: string;
  en: LocalizedUpdate;
  "zh-CN": LocalizedUpdate;
};

export const productUpdates: ProductUpdate[] = [
  {
    version: "26.617",
    date: "2026-06-17",
    en: {
      title: "Share growth, theme polish, screenshots, and mobile navigation",
      summary:
        "Markdownviewer shipped the share growth loop, local recent activity, public-site theme controls, real feature screenshots, and a cleaned-up mobile breadcrumbs menu in one June 17 update.",
      highlights: [
        "Share pages now offer Open in workspace, Edit a copy, and Use as template actions.",
        "The workspace and homepage now surface local Recent and Continue activity for shares, share copies/templates, and converted documents.",
        "Added System, Light, and Dark controls for the public site and fixed the washed-gray dark mode palette.",
        "Expanded the mobile and tablet live preview sample and replaced decorative feature cards with real product screenshots.",
        "Rebuilt the PWA file opening and stored sharing/export feature screenshots without the Next.js development overlay.",
        "Kept Workspace directly to the left of the mobile breadcrumbs trigger.",
        "Changed the breadcrumbs panel to an opaque full-width mobile sheet with equal-width controls.",
        "Reordered the menu to Pricing, Updates, and GitHub with visible GitHub text.",
        "Placed language and System/Light/Dark theme controls on one equal-width settings row.",
        "Added a book-style immersive reading overlay from workspace preview and share reader surfaces.",
        "Added tests for recent activity, feature screenshot assets, theme switching, and mobile breadcrumbs behavior."
      ]
    },
    "zh-CN": {
      title: "分享增长、主题修复、真实截图和移动端导航",
      summary: "Markdownviewer 将分享增长闭环、本地最近记录、公开站点主题控制、真实功能截图和移动端 breadcrumbs 菜单修复合并为 6 月 17 日的一次更新。",
      highlights: [
        "分享页新增在工作区打开、编辑副本、作为模板使用三个动作。",
        "workspace 和首页现在会显示本地 Recent / Continue 记录，覆盖分享、分享副本/模板和转换文档。",
        "公开站点新增 System、Light、Dark 控制，并修复灰蒙蒙的深色模式配色。",
        "放大移动端和平板首页 live preview sample，并用真实产品截图替换装饰性功能图。",
        "重新生成 PWA file opening 和 Stored sharing/export 功能截图，去掉 Next.js development overlay。",
        "Workspace 保持紧挨在移动端 breadcrumbs 触发按钮左边。",
        "breadcrumbs 面板改为移动端全宽实体背景，所有控制等宽铺满。",
        "菜单顺序调整为 Pricing、Updates、GitHub，并给 GitHub 加上可见文字。",
        "语言切换和 System/Light/Dark 主题控制放在同一行并等宽排列。",
        "workspace 预览和分享页新增书本式沉浸阅读层，只保留正文、排版、导航和细进度条。",
        "新增最近记录、功能截图资产、主题切换和移动端 breadcrumbs 行为测试。"
      ]
    }
  },
  {
    version: "26.612",
    date: "2026-06-12",
    en: {
      title: "System-aware site theming and workspace template memory",
      summary:
        "Markdownviewer now follows the user's system light/dark preference on public pages and remembers separate workspace templates for light and dark reading modes.",
      highlights: [
        "Added automatic light/dark site theming from the user's system color-scheme preference.",
        "Added separate workspace template memory for the most recent light template and the most recent dark template.",
        "Workspace startup now selects the saved light or dark template that matches the current system color scheme.",
        "Kept legacy workspace template storage keys compatible for returning users."
      ]
    },
    "zh-CN": {
      title: "跟随系统的站点主题和 workspace 模板记忆",
      summary: "Markdownviewer 现在会让公开页面跟随用户系统的亮/暗偏好，并为 workspace 的亮色和暗色阅读模式分别记住最近模板。",
      highlights: [
        "新增跟随系统 color-scheme 的自动亮/暗站点主题。",
        "为最近使用的亮色模板和暗色模板分别保存 workspace 模板记忆。",
        "workspace 启动时会选择与当前系统色彩偏好匹配的已保存模板。",
        "保留旧版 workspace 模板存储键，避免影响回访用户。"
      ]
    }
  },
  {
    version: "26.611",
    date: "2026-06-11",
    en: {
      title: "Early-access waitlist and verified email capture",
      summary:
        "Markdownviewer added a pricing waitlist for future Share Pro and Converter API workflows while keeping the free workspace open.",
      highlights: [
        "Added a /pricing early-access waitlist page for Share Pro and Converter API interest.",
        "Added waitlist email validation, Resend confirmation email delivery, and confirmation-link handling before verification.",
        "Added Neon/Postgres waitlist storage through DATABASE_URL or POSTGRES_URL in production.",
        "Kept Cloudflare D1 and local JSONL storage as compatibility and development fallbacks.",
        "Updated Share Pro intent links from the share workflow to route into the waitlist page."
      ]
    },
    "zh-CN": {
      title: "早期访问 waitlist 和邮箱确认",
      summary: "Markdownviewer 为未来的 Share Pro 和 Converter API 工作流加入定价页 waitlist，同时保持免费 workspace 开放。",
      highlights: [
        "新增 `/pricing` 早期访问 waitlist，用于收集 Share Pro 和 Converter API 兴趣。",
        "新增邮箱校验、Resend 确认邮件和确认链接处理，确认后才标记为 verified。",
        "生产环境新增通过 DATABASE_URL 或 POSTGRES_URL 使用 Neon/Postgres 存储 waitlist。",
        "保留 Cloudflare D1 和本地 JSONL 存储作为兼容和开发 fallback。",
        "分享工作流里的 Share Pro 意向入口现在会进入 waitlist 页面。"
      ]
    }
  },
  {
    version: "26.610",
    date: "2026-06-10",
    en: {
      title: "Desktop workspace reading controls",
      summary:
        "Markdownviewer now keeps long workspace sessions steadier with per-tab reading positions, cleaner import choices, and more precise reader typography.",
      highlights: [
        "Each workspace tab now remembers its own preview scroll position and restores it when you switch back.",
        "New tabs open at the top of the document instead of inheriting the previous tab's scroll position.",
        "The left tab sidebar can now be resized with the same drag-and-keyboard feel as the editor/preview split.",
        "The new-tab dialog now uses four equal vertical actions: Paste, Blank, File, and Folder.",
        "Editor toolbar actions now use consistent SVG icons, including a proper strikethrough icon.",
        "Preview typography controls now include L- and L+ line-height controls that persist with the reader settings.",
        "Idle workspace status messages now disappear automatically after three seconds, while loading statuses stay visible.",
        "The floating contents panel scrollbar now follows dark workspace theme colors."
      ]
    },
    "zh-CN": {
      title: "桌面端 workspace 阅读控制",
      summary: "Markdownviewer 现在让长文档 workspace 更稳定：每个 tab 保留自己的阅读位置，导入入口更干净，预览排版也能细调。",
      highlights: [
        "每个 workspace tab 都会记住自己的预览滚动位置，切回时自动恢复。",
        "新建 tab 默认从文档顶部打开，不再继承上一个 tab 的滚动位置。",
        "左侧 tab 栏现在可以拖拽调整宽度，交互与编辑器/预览分栏一致。",
        "新建 tab 弹窗改为 Paste、Blank、File、Folder 四个等宽纵向按钮。",
        "编辑器工具栏改用统一 SVG 图标，并替换为真正的删除线图标。",
        "预览排版控制新增 L- 和 L+ 行距调整，并随阅读器设置一起持久化。",
        "普通 workspace 状态提示会在 3 秒后自动消失，加载中提示仍保持可见。",
        "浮动目录面板滚动条现在会跟随深色 workspace 主题。"
      ]
    }
  },
  {
    version: "26.609",
    date: "2026-06-09",
    en: {
      title: "Mobile workspace reader chrome",
      summary:
        "Markdownviewer now gives mobile readers more vertical space and a clear path to install the app from the site.",
      highlights: [
        "The mobile workspace top bar now hides automatically while scrolling down and returns when scrolling up.",
        "The mobile preview bottom bar is hidden by default so the document gets the full screen for reading.",
        "A bottom-right floating control opens the preview controls when typography, theme, or sharing actions are needed.",
        "A mobile PWA install prompt now triggers the native install flow when the browser exposes it.",
        "iPhone, iPad, and browsers without a native prompt now get clear add-to-home-screen guidance.",
        "The mobile install prompt now keeps readable text and button contrast in dark workspace themes.",
        "Scrolling down closes the mobile preview controls again to keep the reader focused on the document.",
        "Added focused tests and CSS guards for the mobile header, bottom bar, and install prompt behavior."
      ]
    },
    "zh-CN": {
      title: "移动端 workspace 阅读 chrome",
      summary: "Markdownviewer 现在会在移动端把阅读空间留给正文，并在站内提供清晰的安装入口。",
      highlights: [
        "移动端 workspace 顶栏会在下滑阅读时自动隐藏，并在上滑时恢复显示。",
        "移动端预览底栏默认隐藏，让文档正文获得完整阅读空间。",
        "右下角浮动按钮可以在需要调整排版、主题或分享时展开预览控制。",
        "新增移动端 PWA 安装提示；浏览器支持时会触发原生安装流程。",
        "iPhone、iPad 或没有原生安装事件的浏览器会显示添加到主屏幕指引。",
        "移动端安装提示在深色 workspace 主题下保持文字和按钮对比度。",
        "继续下滑阅读会再次收起移动端预览控制，减少对正文的遮挡。",
        "新增针对移动端顶栏、底栏和安装提示行为的测试与 CSS guard。"
      ]
    }
  },
  {
    version: "26.604",
    date: "2026-06-04",
    en: {
      title: "Stored share links and full share-page reader",
      summary:
        "Markdownviewer now creates formal stored share links with independent share pages that keep the full preview reader experience.",
      highlights: [
        "Added server-stored share links through /api/share, backed by Vercel Blob in production and a local file-store fallback in development.",
        "New share links now point to canonical /share/{id} pages instead of carrying oversized Markdown payloads in the URL.",
        "Share pages now reuse the full preview reader controls for contents, typography, themes, font size, and preview margins.",
        "Restored the Markdownviewer logo on share pages and kept the open-in-workspace path visible.",
        "Fixed M- and M+ preview margin controls so shared documents respond exactly like workspace preview."
      ]
    },
    "zh-CN": {
      title: "正式分享链接和完整分享页阅读器",
      summary: "Markdownviewer 现在会生成正式存储的分享链接，独立分享页也保留完整预览阅读体验。",
      highlights: [
        "新增通过 /api/share 生成的服务端存储分享链接，生产环境使用 Vercel Blob，本地开发使用文件存储 fallback。",
        "新的分享链接指向规范的 /share/{id} 页面，不再把大型 Markdown 内容塞进 URL。",
        "分享页复用完整预览阅读器控制，包括目录、排版、主题、字号和预览留白。",
        "恢复分享页左上角 Markdownviewer LOGO，并保留在工作区打开的路径。",
        "修复 M- 和 M+ 预览留白控制，让分享文档和 workspace preview 的行为一致。"
      ]
    }
  },
  {
    version: "26.603",
    date: "2026-06-03",
    en: {
      title: "Document conversion and smoother preview margins",
      summary:
        "Markdownviewer can now convert common document formats into Markdown and opens converted results directly in workspace tabs.",
      highlights: [
        "Added document-to-Markdown conversion for DOCX, PPTX, XLSX, XLS, CSV, HTML, JSON, XML, and text-heavy PDF files.",
        "Converted documents open automatically in a new workspace tab, using the same local browser tab persistence as other imports.",
        "Added a focused document-to-Markdown converter SEO page with FAQ boundaries for temporary server files, local tab persistence, and no OCR.",
        "Updated homepage, README, llms.txt, sitemap, and structured data so users, search crawlers, and AI assistants can discover the new workflow.",
        "Changed preview margin controls to evenly spaced percent levels so the final margin step no longer jumps abruptly."
      ]
    },
    "zh-CN": {
      title: "文档转换和更平滑的预览留白",
      summary: "Markdownviewer 现在可以把常见文档格式转成 Markdown，并把转换结果直接打开到 workspace tab。",
      highlights: [
        "新增文档转 Markdown，支持 DOCX、PPTX、XLSX、XLS、CSV、HTML、JSON、XML 和文本型 PDF。",
        "转换后的文档会自动进入新的 workspace tab，并沿用现有浏览器本地 tab 持久化。",
        "新增面向 document-to-Markdown converter 的 SEO 页面，并在 FAQ 中明确临时服务器文件、本地 tab 持久化和不支持 OCR 的边界。",
        "更新首页、README、llms.txt、sitemap 和 structured data，让用户、搜索爬虫和 AI 助手都能发现新工作流。",
        "把预览留白控制改成等距百分比档位，最后一级不再突然跳到最大。"
      ]
    }
  },
  {
    version: "26.602",
    date: "2026-06-02",
    en: {
      title: "Long-tail SEO pages and build stability",
      summary: "Markdownviewer now has focused public pages for key Markdown workflows, plus a more reliable production build path.",
      highlights: [
        "Added six crawlable pages for README preview, GitHub Flavored Markdown, Mermaid diagrams, Markdown math, AI-generated Markdown, and online Markdown file viewing.",
        "Linked the new pages from a homepage quick-link bar, the sitemap, and llms.txt so visitors, search crawlers, and AI assistants can discover them.",
        "Added FAQ and breadcrumb structured data to the new workflow pages.",
        "Made preview mode default to the widest reading margin, with eight margin levels and a 1:2:1 desktop reading ratio at the maximum setting.",
        "Added preview margin controls, a workspace language switcher, and share-link fallback copying when the Clipboard API stalls.",
        "Removed the remote Google Fonts build dependency and switched to a local system monospace stack."
      ]
    },
    "zh-CN": {
      title: "长尾 SEO 页面和构建稳定性",
      summary: "Markdownviewer 增加一组面向具体 Markdown 工作流的公开页面，并让生产构建更稳定。",
      highlights: [
        "新增 6 个可抓取页面，覆盖 README 预览、GitHub Flavored Markdown、Mermaid 图表、Markdown 数学公式、AI 生成 Markdown 和在线 Markdown 文件查看。",
        "从首页 quick-link bar、sitemap 和 llms.txt 暴露这些新页面，方便用户、搜索爬虫和 AI 助手发现。",
        "为新的工作流页面增加 FAQ 和 breadcrumb structured data。",
        "preview 模式默认使用最大阅读留白，最大档位在桌面端接近 1:2:1 的左右留白和正文比例，并保留 8 个留白档位。",
        "增加预览留白控制、workspace 语言切换入口，以及 Clipboard API 卡住时的分享链接 fallback 复制。",
        "移除远程 Google Fonts 构建依赖，改用本地系统 monospace 字体栈。"
      ]
    }
  },
  {
    version: "26.531",
    date: "2026-05-31",
    en: {
      title: "Mobile landing and navigation repair",
      summary: "The homepage now stays usable on small screens while keeping the workspace path, language switch, GitHub link, and changelog visible.",
      highlights: [
        "Fixed the mobile homepage scroll lock that leaked from workspace-only layout rules.",
        "Pinned the full-width top navigation to the viewport edge and kept the language, GitHub, Workspace, and Changelog controls on one row.",
        "Rebuilt the hero import controls around the same Paste, File, URL, and Open language used by the workspace.",
        "Constrained the live preview sample to one mobile viewport with its own internal scroll.",
        "Made the mobile tab rail dismiss when a document is chosen or the blurred backdrop is tapped, and surfaced real generated share links."
      ]
    },
    "zh-CN": {
      title: "移动端首页和导航修复",
      summary: "首页在小屏上保持可滚动，同时保留语言切换、GitHub、Workspace 和 Changelog 入口。",
      highlights: [
        "修复 workspace 专用布局规则误锁首页滚动的问题。",
        "把满宽顶部导航固定到视口最顶，并让语言、GitHub、Workspace、Changelog 控制保持单行。",
        "把 hero 导入控件统一到 workspace 里的 Paste、File、URL、Open 语义。",
        "把实时预览示例限制在一个移动端视口内，由预览卡片内部滚动。",
        "移动端选择文档或点击模糊背景后会收起 tab 栏，并直接显示真实生成的分享链接。"
      ]
    }
  },
  {
    version: "26.530",
    date: "2026-05-30",
    en: {
      title: "Local folder workspace",
      summary: "Markdownviewer gained a local-first folder mode for longer docs projects, plus mobile workspace layout fixes.",
      highlights: [
        "Open a local docs folder in Chrome or Edge desktop through the File System Access API.",
        "Browse Markdown files, create new files, follow relative Markdown links, and save changes back to disk.",
        "Keep imported files and folder documents in dedicated workspace tabs.",
        "Refined the compact workspace chrome for narrow screens."
      ]
    },
    "zh-CN": {
      title: "本地文件夹工作区",
      summary: "Markdownviewer 增加本地优先的文件夹模式，并修复移动端 workspace 布局。",
      highlights: [
        "在 Chrome 或 Edge 桌面版中通过 File System Access API 打开本地 docs 文件夹。",
        "浏览 Markdown 文件、新建文件、跳转相对 Markdown links，并保存回磁盘。",
        "把导入文件和文件夹文档放进独立 workspace tabs。",
        "优化窄屏下的 workspace 顶栏和预览布局。"
      ]
    }
  },
  {
    version: "26.529",
    date: "2026-05-29",
    en: {
      title: "PWA file opening and Chinese UI",
      summary: "The app became installable, gained Markdown file handling, and shipped a Chinese interface.",
      highlights: [
        "Added installable PWA metadata, a service worker, and Markdown file handlers for supported Chromium browsers.",
        "Markdown files opened from the operating system now land in a new workspace tab.",
        "Added zh-CN routes, metadata, and localized landing/workspace copy.",
        "Verified the custom production domain after the localized deployment."
      ]
    },
    "zh-CN": {
      title: "PWA 文件打开和中文界面",
      summary: "应用支持安装、Markdown 文件处理，并上线中文界面。",
      highlights: [
        "增加 PWA manifest、service worker，以及 Chromium 支持的 Markdown file_handlers。",
        "从系统“打开方式”交给 Markdownviewer 的文件会进入新的 workspace tab。",
        "增加 zh-CN 路由、metadata，以及首页和 workspace 的中文文案。",
        "本地化部署后完成自定义生产域名验证。"
      ]
    }
  },
  {
    version: "26.524",
    date: "2026-05-24",
    en: {
      title: "Persistent tabs and open-source packaging",
      summary: "The workspace moved from a one-document tool to a multi-tab Markdown desk, while the repository became easier to share.",
      highlights: [
        "Added persistent workspace tabs with restore behavior across reloads.",
        "Kept each tab's Markdown, source label, and active document state separate.",
        "Expanded README positioning for backlinks, open-source directories, and product comparisons.",
        "Added release hygiene around changelog, metadata, and GitHub repository links."
      ]
    },
    "zh-CN": {
      title: "持久标签和开源包装",
      summary: "workspace 从单文档工具升级为多标签 Markdown 工作台，仓库也更适合传播。",
      highlights: [
        "增加可持久化的 workspace tabs，刷新后可恢复。",
        "每个 tab 独立保存 Markdown、来源标签和当前文档状态。",
        "扩展 README 的传播定位，方便目录站、外链和产品对比引用。",
        "补齐 changelog、metadata 和 GitHub 仓库链接等发布卫生。"
      ]
    }
  }
];

export function getProductUpdateText(update: ProductUpdate, locale: Locale) {
  return update[locale];
}
