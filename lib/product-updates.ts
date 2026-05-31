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
    version: "26.531",
    date: "2026-05-31",
    en: {
      title: "Mobile landing and navigation repair",
      summary: "The homepage now stays usable on small screens while keeping the workspace path, language switch, GitHub link, and changelog visible.",
      highlights: [
        "Fixed the mobile homepage scroll lock that leaked from workspace-only layout rules.",
        "Pinned the top navigation and kept the language, GitHub, Workspace, and Changelog controls on one row.",
        "Rebuilt the hero import controls around the same Paste, File, URL, and Open language used by the workspace.",
        "Constrained the live preview sample to one mobile viewport with its own internal scroll."
      ]
    },
    "zh-CN": {
      title: "移动端首页和导航修复",
      summary: "首页在小屏上保持可滚动，同时保留语言切换、GitHub、Workspace 和 Changelog 入口。",
      highlights: [
        "修复 workspace 专用布局规则误锁首页滚动的问题。",
        "固定顶部导航，并让语言、GitHub、Workspace、Changelog 控制保持单行。",
        "把 hero 导入控件统一到 workspace 里的 Paste、File、URL、Open 语义。",
        "把实时预览示例限制在一个移动端视口内，由预览卡片内部滚动。"
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
