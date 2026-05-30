import type { Locale } from "@/lib/i18n/locales";
import type { MarkdownEditorAction } from "@/lib/workspace/editor-actions";
import type { WorkspaceTheme } from "@/lib/workspace/themes";

export type LandingLink = {
  href: string;
  label: string;
};

export type LandingCard = {
  description: string;
  title: string;
};

export type Messages = {
  common: {
    brand: string;
    siteName: string;
  };
  meta: {
    homeDescription: string;
    homeTitle: string;
    homeTitleShort: string;
    keywords: string[];
    workspaceDescription: string;
    workspaceTitle: string;
  };
  landing: {
    faq: {
      eyebrow: string;
      items: Array<{ answer: string; question: string }>;
      title: string;
    };
    features: {
      copy: string;
      eyebrow: string;
      items: LandingCard[];
      title: string;
    };
    footer: {
      ariaLabel: string;
      columns: Array<{ links: LandingLink[]; title: string }>;
      contactBody: string;
      contactTitle: string;
      copyright: string;
      description: string;
      privacyBody: string;
      privacyTitle: string;
      tagline: string;
      termsBody: string;
      termsTitle: string;
    };
    hero: {
      body: string;
      dropFile: string;
      eyebrow: string;
      loadedFile: (fileName: string) => string;
      openMarkdown: string;
      openSample: string;
      readFileError: string;
      sampleRibbon: string;
      sourceUrlLabel: string;
      sourceUrlPlaceholder: string;
      title: string;
      uploadLabel: string;
    };
    intents: {
      cards: LandingCard[];
      copy: string;
      eyebrow: string;
      title: string;
    };
    nav: {
      github: string;
      primary: string;
      workspace: string;
    };
    sources: {
      ariaLabel: string;
      items: string[];
    };
  };
  schema: {
    faq: Array<{ answer: string; question: string }>;
    featureList: string[];
    softwareDescription: string;
    softwareKeywords: string;
  };
  share: {
    metadataDescription: string;
    metadataTitle: string;
    metadataTitleWithDocument: (title: string) => string;
    openInWorkspace: string;
  };
  workspace: {
    document: {
      defaultExportTitle: string;
      localDraft: string;
      untitled: string;
    };
    editor: {
      actions: Record<MarkdownEditorAction, string>;
      formatting: string;
      markdownLabel: string;
      modeLabel: string;
      moreTools: string;
      placeholder: string;
      raw: string;
      rich: string;
    };
    folder: {
      browserUnsupported: string;
      closeSearch: string;
      conflict: string;
      discardBeforeSwitch: string;
      fileMissing: (path: string) => string;
      newFile: string;
      newFileIn: (directory: string) => string;
      noSearchResults: string;
      notFolderFile: string;
      openFolder: string;
      opened: (name: string) => string;
      partial: (skippedCount: number) => string;
      railLabel: string;
      reconnect: string;
      reconnectNeeded: string;
      saved: string;
      saveBeforeSwitch: string;
      saveFailed: string;
      saveToDisk: string;
      saving: string;
      search: string;
      searchInput: string;
      searchPlaceholder: string;
    };
    header: {
      home: string;
    };
    preview: {
      close: string;
      closeContents: string;
      contents: string;
      decreaseFont: string;
      font: string;
      fontOptions: Record<string, string>;
      fontSize: string;
      increaseFont: string;
      resizeLabel: string;
      resizeTitle: string;
      templateButton: (theme: string) => string;
      templatePalette: string;
      themes: Record<WorkspaceTheme, { description: string; label: string }>;
      typography: string;
    };
    status: {
      closedTab: string;
      exportedHtml: string;
      linkCopied: string;
      loadFailed: string;
      loadedFile: (fileName: string) => string;
      loadedSource: (label: string) => string;
      newTab: string;
      openedPrint: string;
      pastePermission: string;
      pasted: string;
      readFileFailed: string;
      sharedMissing: string;
      switchedTo: (title: string) => string;
    };
    tabs: {
      close: (title: string) => string;
      collapse: string;
      expand: string;
      newTab: string;
      railLabel: string;
      title: string;
    };
    toolbar: {
      exportHtml: string;
      exportPdf: string;
      file: string;
      importAction: string;
      importOptions: string;
      label: string;
      modes: Record<"preview" | "split" | "editor", string>;
      more: string;
      open: string;
      openFolder: string;
      paste: string;
      saveToDisk: string;
      shareLink: string;
      sourceUrlLabel: string;
      uploadLabel: string;
      url: string;
    };
  };
};

const githubRepositoryUrl = "https://github.com/stewart-lhc/markdownviewer";

export const messages: Record<Locale, Messages> = {
  en: {
    common: {
      brand: "Markdownviewer",
      siteName: "markdownviewer.run"
    },
    meta: {
      homeDescription:
        "Free online Markdown viewer with live preview for README.md, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, code blocks, and raw URLs.",
      homeTitle: "Markdown Viewer Online - Live Preview | markdownviewer.run",
      homeTitleShort: "Markdown Viewer Online - Live Preview",
      keywords: [
        "markdown viewer",
        "markdown viewer online",
        "online markdown viewer",
        "markdown preview",
        "markdown previewer",
        "GitHub Flavored Markdown viewer",
        "README viewer",
        "Mermaid markdown viewer",
        "Markdown viewer with math",
        "AI markdown viewer"
      ],
      workspaceDescription:
        "Paste, edit, or load Markdown from files, GitHub, Gists, and raw URLs in a live online Markdown preview workspace.",
      workspaceTitle: "Online Markdown Viewer Workspace - Live Preview"
    },
    landing: {
      nav: {
        github: "GitHub",
        primary: "Primary",
        workspace: "Enter workspace"
      },
      hero: {
        body:
          "Open Markdown like it deserves. `markdownviewer.run` turns project notes, READMEs, AI output, and technical writing into a polished live preview. Start with a file, paste raw Markdown, or send a GitHub, Gist, or remote URL straight into the workspace.",
        dropFile: "Drop a file",
        eyebrow: "Markdown without the utility-site look",
        loadedFile: (fileName) => `Loaded ${fileName}.`,
        openMarkdown: "Open Markdown Now",
        openSample: "Open sample",
        readFileError: "Could not read the selected Markdown file.",
        sampleRibbon: "Live preview sample",
        sourceUrlLabel: "Markdown source URL",
        sourceUrlPlaceholder: "Paste a GitHub, Gist, or Markdown URL",
        title: "Markdown Viewer Online",
        uploadLabel: "Upload markdown file from homepage"
      },
      sources: {
        ariaLabel: "Supported sources",
        items: ["Local files", "GitHub", "Gist", "Raw URLs", "Pasted Markdown", "AI output"]
      },
      features: {
        copy:
          "The first-use path stays obvious, while the rendering surface treats code, diagrams, math, README files, and reading rhythm like first-class material.",
        eyebrow: "Why this wins",
        title: "An online Markdown viewer with editorial standards.",
        items: [
          {
            title: "Live preview",
            description: "Edit or paste Markdown and watch the rendered document update in the workspace."
          },
          {
            title: "Technical-ready",
            description:
              "Code fences, tables, KaTeX math, and Mermaid diagrams stay readable instead of collapsing into plain text."
          },
          {
            title: "Fast import",
            description: "Open local files, pasted Markdown, GitHub content, Gists, and raw URLs from the same surface."
          },
          {
            title: "README friendly",
            description:
              "Preview README.md files, changelogs, API docs, and AI-generated Markdown without a docs-site setup."
          }
        ]
      },
      intents: {
        copy:
          "Use markdownviewer.run when you need a fast Markdown preview online, a GitHub Flavored Markdown viewer, or a clean reader for AI-generated Markdown.",
        eyebrow: "Search-ready workflows",
        title: "Built around the Markdown jobs people actually search for.",
        cards: [
          {
            title: "Markdown preview online",
            description:
              "Paste Markdown and check the rendered document in a live preview before publishing notes, docs, or blog drafts."
          },
          {
            title: "GitHub Flavored Markdown viewer",
            description:
              "Review README.md files, tables, task lists, fenced code blocks, and technical documentation with GitHub-style expectations."
          },
          {
            title: "Markdown viewer with Mermaid and math",
            description:
              "Render Mermaid diagrams, KaTeX equations, and syntax-highlighted code without setting up a docs site."
          },
          {
            title: "AI Markdown output reader",
            description:
              "Turn Markdown from ChatGPT, Claude, Cursor, or coding agents into a clean reading view for review and sharing."
          }
        ]
      },
      faq: {
        eyebrow: "FAQ",
        title: "Markdown viewer questions.",
        items: [
          {
            question: "What can I open in this Markdown viewer?",
            answer:
              "Use a local .md file, pasted Markdown, GitHub content, Gists, raw URLs, or the built-in sample document."
          },
          {
            question: "Is it only a viewer, or can I edit Markdown too?",
            answer:
              "The workspace gives you a source pane and live preview, so you can edit raw Markdown while checking the rendered output."
          },
          {
            question: "Which long documents benefit most?",
            answer:
              "README files, API docs, changelogs, specs, AI-generated reports, lecture notes, and documents with code, tables, diagrams, or math."
          }
        ]
      },
      footer: {
        ariaLabel: "Footer",
        description:
          "markdownviewer.run is a focused Markdown reading and editing workspace for README files, technical notes, AI output, Mermaid diagrams, math, and code.",
        columns: [
          {
            title: "Product",
            links: [
              { label: "Workspace", href: "/workspace" },
              { label: "Sample document", href: "/workspace?sample=starter" },
              { label: "GitHub repository", href: githubRepositoryUrl },
              { label: "FAQ", href: "#markdown-viewer-faq" }
            ]
          },
          {
            title: "Company",
            links: [
              { label: "About us", href: "#about" },
              { label: "Contact", href: "#contact" }
            ]
          },
          {
            title: "Legal",
            links: [
              { label: "Terms of service", href: "#terms" },
              { label: "Privacy policy", href: "#privacy" }
            ]
          }
        ],
        contactBody: "For product feedback, support, or legal requests, email",
        contactTitle: "Contact.",
        copyright: "© 2026 markdownviewer.run",
        privacyBody:
          "Local files and pasted Markdown are handled in your browser unless you choose to load a remote URL or create a share link.",
        privacyTitle: "Privacy policy.",
        tagline: "Online Markdown viewer for polished technical documents.",
        termsBody: "Use the viewer responsibly and only open Markdown you have the right to access or process.",
        termsTitle: "Terms of service."
      }
    },
    workspace: {
      document: {
        defaultExportTitle: "Markdown Document",
        localDraft: "Local draft",
        untitled: "Untitled document"
      },
      status: {
        closedTab: "Closed tab.",
        exportedHtml: "Exported HTML.",
        linkCopied: "Link copied.",
        loadFailed: "Failed to load Markdown.",
        loadedFile: (fileName) => `Loaded ${fileName}.`,
        loadedSource: (label) => `Loaded ${label}.`,
        newTab: "Opened a new tab.",
        openedPrint: "Opened print dialog.",
        pastePermission: "Clipboard paste requires browser permission.",
        pasted: "Pasted Markdown.",
        readFileFailed: "Failed to read the selected file.",
        sharedMissing: "Shared document not found.",
        switchedTo: (title) => `Switched to ${title}.`
      },
      tabs: {
        close: (title) => `Close ${title}`,
        collapse: "Collapse tabs sidebar",
        expand: "Expand tabs sidebar",
        newTab: "New tab",
        railLabel: "Open tabs",
        title: "Tabs"
      },
      header: {
        home: "Markdownviewer home"
      },
      toolbar: {
        exportHtml: "Export HTML",
        exportPdf: "Export PDF",
        file: "File",
        importAction: "Import",
        importOptions: "Import options",
        label: "Workspace controls",
        modes: {
          editor: "Editor",
          preview: "Preview",
          split: "Split"
        },
        more: "More",
        open: "Open",
        openFolder: "Folder",
        paste: "Paste",
        saveToDisk: "Save to disk",
        shareLink: "Share Link",
        sourceUrlLabel: "Markdown source URL",
        uploadLabel: "Upload markdown file",
        url: "URL"
      },
      editor: {
        actions: {
          bold: "Bold",
          bulletList: "Bulleted list",
          code: "Code",
          heading: "Heading",
          image: "Image",
          italic: "Italic",
          link: "Link",
          orderedList: "Numbered list",
          quote: "Quote",
          strike: "Strikethrough",
          table: "Table",
          taskList: "Task list"
        },
        formatting: "Markdown formatting",
        markdownLabel: "Markdown editor",
        modeLabel: "Editor mode",
        moreTools: "More formatting tools",
        placeholder: "# Start writing",
        raw: "Raw",
        rich: "Rich"
      },
      folder: {
        browserUnsupported: "Folder editing is available in Chrome/Edge desktop. You can still open individual files here.",
        closeSearch: "Close file search",
        conflict: "This file changed outside Markdownviewer. Save again only if you want to overwrite it.",
        discardBeforeSwitch: "Discard unsaved local folder changes and switch files?",
        fileMissing: (path) => `Could not find ${path} in this folder.`,
        newFile: "New file",
        newFileIn: (directory) => `New file in ${directory}`,
        noSearchResults: "No matching files.",
        notFolderFile: "This document is not a local folder file.",
        openFolder: "Open folder",
        opened: (name) => `Opened folder ${name}.`,
        partial: (skippedCount) => `Showing partial results. ${skippedCount} entries were skipped.`,
        railLabel: "Local folder files",
        reconnect: "Reconnect folder",
        reconnectNeeded: "Reconnect the local folder to continue folder editing.",
        saved: "Saved to disk.",
        saveBeforeSwitch: "Save changes before switching files?",
        saveFailed: "Could not save to disk. Your draft is still preserved in the browser.",
        saveToDisk: "Save to disk",
        saving: "Saving to disk...",
        search: "Search folder files",
        searchInput: "Search local folder files",
        searchPlaceholder: "Search files by name or path"
      },
      preview: {
        close: "Close",
        closeContents: "Close contents",
        contents: "Contents",
        decreaseFont: "Decrease preview font size",
        font: "Preview font",
        fontOptions: {
          athelas: "Athelas",
          baskerville: "Baskerville",
          charter: "Charter",
          georgia: "Georgia",
          kaiti: "KaiTi",
          "lxgw-wenkai": "LXGW WenKai",
          mono: "Mono",
          palatino: "Palatino",
          pingfang: "PingFang",
          serif: "Serif",
          "source-han-sans": "Source Han Sans",
          "source-han-serif": "Source Han Serif",
          system: "System"
        },
        fontSize: "Preview font size",
        increaseFont: "Increase preview font size",
        resizeLabel: "Resize editor and preview panes",
        resizeTitle: "Drag to resize editor and preview",
        templateButton: (theme) => `Template: ${theme}`,
        templatePalette: "Template palette",
        themes: {
          paper: { label: "Paper", description: "Warm editorial daylight" },
          primer: { label: "Primer", description: "Clean README documentation" },
          manuscript: { label: "Manuscript", description: "Academic serif typesetting" },
          sepia: { label: "Sepia", description: "Soft amber e-reader calm" },
          porcelain: { label: "Porcelain", description: "Cool magazine clarity" },
          aurora: { label: "Aurora", description: "Polished color-forward notes" },
          night: { label: "Night", description: "Balanced dark reading" },
          graphite: { label: "Graphite", description: "Blue-black studio contrast" },
          evergreen: { label: "Evergreen", description: "Forest low-glare focus" },
          terminal: { label: "Terminal", description: "Mono hacker logbook" }
        },
        typography: "Preview typography"
      }
    },
    share: {
      metadataDescription: "A shared Markdown preview rendered by markdownviewer.run.",
      metadataTitle: "Shared Markdown",
      metadataTitleWithDocument: (title) => `${title} - Shared Markdown`,
      openInWorkspace: "Open in workspace"
    },
    schema: {
      softwareDescription:
        "A free online Markdown viewer and live preview workspace for README files, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, code blocks, local files, pasted Markdown, and raw URLs.",
      softwareKeywords:
        "markdown viewer, online markdown viewer, markdown preview, GitHub Flavored Markdown viewer, README viewer, Mermaid markdown viewer, markdown viewer with math",
      featureList: [
        "Live Markdown preview",
        "GitHub Flavored Markdown",
        "Mermaid diagram rendering",
        "KaTeX math rendering",
        "Syntax highlighted code blocks",
        "Local file, paste, GitHub, Gist, and raw URL import"
      ],
      faq: [
        {
          question: "Can I use markdownviewer.run as an online Markdown viewer?",
          answer:
            "Yes. Open the workspace to paste Markdown, load a local .md file, or preview Markdown from GitHub, Gist, and raw URLs."
        },
        {
          question: "Does the Markdown viewer support GitHub Flavored Markdown?",
          answer:
            "Yes. The renderer supports common GitHub Flavored Markdown patterns including tables, task lists, fenced code blocks, links, and README-style documents."
        },
        {
          question: "Can I preview Mermaid diagrams and math in Markdown?",
          answer:
            "Yes. markdownviewer.run renders Mermaid diagrams, syntax-highlighted code blocks, and KaTeX math so technical documents stay readable."
        }
      ]
    }
  },
  "zh-CN": {
    common: {
      brand: "Markdownviewer",
      siteName: "markdownviewer.run"
    },
    meta: {
      homeDescription:
        "免费的在线 Markdown 查看器，支持 README.md、GitHub Flavored Markdown、Mermaid 图表、KaTeX 数学公式、代码块和原始 URL 的实时预览。",
      homeTitle: "在线 Markdown 查看器 - 实时预览 | markdownviewer.run",
      homeTitleShort: "在线 Markdown 查看器 - 实时预览",
      keywords: [
        "Markdown 查看器",
        "在线 Markdown 查看器",
        "Markdown 预览",
        "Markdown 预览器",
        "GitHub Flavored Markdown 查看器",
        "README 查看器",
        "Mermaid Markdown 查看器",
        "支持数学公式的 Markdown 查看器",
        "AI Markdown 查看器"
      ],
      workspaceDescription:
        "在实时在线 Markdown 预览工作区中粘贴、编辑，或从文件、GitHub、Gist 和原始 URL 加载 Markdown。",
      workspaceTitle: "在线 Markdown 查看器工作区 - 实时预览"
    },
    landing: {
      nav: {
        github: "GitHub",
        primary: "主导航",
        workspace: "进入工作区"
      },
      hero: {
        body:
          "用更体面的方式打开 Markdown。`markdownviewer.run` 能把项目笔记、README、AI 输出和技术写作转换成精致的实时预览。你可以从文件开始，粘贴原始 Markdown，或把 GitHub、Gist、远程 URL 直接送进工作区。",
        dropFile: "选择文件",
        eyebrow: "不止是工具站的 Markdown 体验",
        loadedFile: (fileName) => `已加载 ${fileName}。`,
        openMarkdown: "立即打开 Markdown",
        openSample: "打开示例",
        readFileError: "无法读取所选 Markdown 文件。",
        sampleRibbon: "实时预览示例",
        sourceUrlLabel: "Markdown 来源 URL",
        sourceUrlPlaceholder: "粘贴 GitHub、Gist 或 Markdown URL",
        title: "在线 Markdown 查看器",
        uploadLabel: "从首页上传 Markdown 文件"
      },
      sources: {
        ariaLabel: "支持的来源",
        items: ["本地文件", "GitHub", "Gist", "原始 URL", "粘贴 Markdown", "AI 输出"]
      },
      features: {
        copy: "首次使用路径足够清楚，渲染界面也认真对待代码、图表、数学公式、README 文件和阅读节奏。",
        eyebrow: "为什么好用",
        title: "一个有编辑质感的在线 Markdown 查看器。",
        items: [
          { title: "实时预览", description: "编辑或粘贴 Markdown，在工作区中即时查看渲染后的文档。" },
          {
            title: "面向技术文档",
            description: "代码围栏、表格、KaTeX 公式和 Mermaid 图表都能保持清晰，而不是退化成纯文本。"
          },
          { title: "快速导入", description: "在同一个界面打开本地文件、粘贴内容、GitHub 内容、Gist 和原始 URL。" },
          {
            title: "适合 README",
            description: "无需搭建文档站，也能预览 README.md、更新日志、API 文档和 AI 生成的 Markdown。"
          }
        ]
      },
      intents: {
        copy:
          "当你需要快速在线预览 Markdown、查看 GitHub Flavored Markdown，或阅读 AI 生成的 Markdown 时，可以直接使用 markdownviewer.run。",
        eyebrow: "覆盖常见搜索场景",
        title: "围绕大家真正会搜索的 Markdown 任务打造。",
        cards: [
          { title: "在线 Markdown 预览", description: "发布笔记、文档或博客草稿前，粘贴 Markdown 并检查实时渲染效果。" },
          {
            title: "GitHub Flavored Markdown 查看器",
            description: "按 GitHub 风格审阅 README.md、表格、任务列表、代码围栏和技术文档。"
          },
          { title: "支持 Mermaid 和数学公式", description: "不用搭建文档站，也能渲染 Mermaid 图表、KaTeX 方程和高亮代码。" },
          {
            title: "AI Markdown 输出阅读器",
            description: "把 ChatGPT、Claude、Cursor 或编码助手生成的 Markdown 变成干净的阅读视图，便于审阅和分享。"
          }
        ]
      },
      faq: {
        eyebrow: "常见问题",
        title: "Markdown 查看器问题。",
        items: [
          {
            question: "这个 Markdown 查看器能打开什么？",
            answer: "你可以使用本地 .md 文件、粘贴的 Markdown、GitHub 内容、Gist、原始 URL 或内置示例文档。"
          },
          {
            question: "它只是查看器，还是也能编辑 Markdown？",
            answer: "工作区提供源码面板和实时预览，所以你可以一边编辑原始 Markdown，一边检查渲染效果。"
          },
          {
            question: "哪些长文档最适合使用？",
            answer: "README 文件、API 文档、更新日志、规格说明、AI 生成报告、课堂笔记，以及包含代码、表格、图表或数学公式的文档。"
          }
        ]
      },
      footer: {
        ariaLabel: "页脚",
        description:
          "markdownviewer.run 是一个专注的 Markdown 阅读和编辑工作区，适合 README、技术笔记、AI 输出、Mermaid 图表、数学公式和代码。",
        columns: [
          {
            title: "产品",
            links: [
              { label: "工作区", href: "/workspace" },
              { label: "示例文档", href: "/workspace?sample=starter" },
              { label: "GitHub 仓库", href: githubRepositoryUrl },
              { label: "常见问题", href: "#markdown-viewer-faq" }
            ]
          },
          {
            title: "公司",
            links: [
              { label: "关于我们", href: "#about" },
              { label: "联系", href: "#contact" }
            ]
          },
          {
            title: "法律",
            links: [
              { label: "服务条款", href: "#terms" },
              { label: "隐私政策", href: "#privacy" }
            ]
          }
        ],
        contactBody: "产品反馈、支持或法律请求，请发送邮件至",
        contactTitle: "联系。",
        copyright: "© 2026 markdownviewer.run",
        privacyBody: "除非你选择加载远程 URL 或创建分享链接，本地文件和粘贴的 Markdown 都会在浏览器中处理。",
        privacyTitle: "隐私政策。",
        tagline: "为精致技术文档打造的在线 Markdown 查看器。",
        termsBody: "请负责任地使用查看器，并只打开你有权访问或处理的 Markdown。",
        termsTitle: "服务条款。"
      }
    },
    workspace: {
      document: {
        defaultExportTitle: "Markdown 文档",
        localDraft: "本地草稿",
        untitled: "未命名文档"
      },
      status: {
        closedTab: "已关闭标签。",
        exportedHtml: "已导出 HTML。",
        linkCopied: "链接已复制。",
        loadFailed: "加载 Markdown 失败。",
        loadedFile: (fileName) => `已加载 ${fileName}。`,
        loadedSource: (label) => `已加载 ${label}。`,
        newTab: "已打开新标签。",
        openedPrint: "已打开打印对话框。",
        pastePermission: "从剪贴板粘贴需要浏览器权限。",
        pasted: "已粘贴 Markdown。",
        readFileFailed: "读取所选文件失败。",
        sharedMissing: "未找到分享文档。",
        switchedTo: (title) => `已切换到 ${title}。`
      },
      tabs: {
        close: (title) => `关闭 ${title}`,
        collapse: "收起标签侧栏",
        expand: "展开标签侧栏",
        newTab: "新建标签",
        railLabel: "打开的标签",
        title: "标签"
      },
      header: {
        home: "Markdownviewer 首页"
      },
      toolbar: {
        exportHtml: "导出 HTML",
        exportPdf: "导出 PDF",
        file: "文件",
        importAction: "导入",
        importOptions: "导入选项",
        label: "工作区控制",
        modes: {
          editor: "编辑器",
          preview: "预览",
          split: "分屏"
        },
        more: "更多",
        open: "打开",
        openFolder: "打开文件夹",
        paste: "粘贴",
        saveToDisk: "保存到磁盘",
        shareLink: "分享链接",
        sourceUrlLabel: "Markdown 来源 URL",
        uploadLabel: "上传 Markdown 文件",
        url: "URL"
      },
      editor: {
        actions: {
          bold: "加粗",
          bulletList: "无序列表",
          code: "代码",
          heading: "标题",
          image: "图片",
          italic: "斜体",
          link: "链接",
          orderedList: "有序列表",
          quote: "引用",
          strike: "删除线",
          table: "表格",
          taskList: "任务列表"
        },
        formatting: "Markdown 格式工具",
        markdownLabel: "Markdown 编辑器",
        modeLabel: "编辑器模式",
        moreTools: "更多格式工具",
        placeholder: "# 开始写作",
        raw: "源码",
        rich: "富文本"
      },
      folder: {
        browserUnsupported: "文件夹编辑需要 Chrome/Edge 桌面浏览器。你仍然可以在这里打开单个文件。",
        closeSearch: "关闭文件搜索",
        conflict: "这个文件已在 Markdownviewer 外部变更。只有确认要覆盖时才再次保存。",
        discardBeforeSwitch: "放弃未保存的本地文件夹更改并切换文件？",
        fileMissing: (path) => `在当前文件夹中找不到 ${path}。`,
        newFile: "新建文件",
        newFileIn: (directory) => `在 ${directory} 中新建文件`,
        noSearchResults: "没有匹配的文件。",
        notFolderFile: "当前文档不是本地文件夹文件。",
        openFolder: "打开文件夹",
        opened: (name) => `已打开文件夹 ${name}。`,
        partial: (skippedCount) => `当前只显示部分结果，已跳过 ${skippedCount} 个条目。`,
        railLabel: "本地文件夹文件",
        reconnect: "重新连接文件夹",
        reconnectNeeded: "请重新连接本地文件夹以继续文件夹编辑。",
        saved: "已保存到磁盘。",
        saveBeforeSwitch: "切换文件前是否保存更改？",
        saveFailed: "无法保存到磁盘。你的草稿仍已保存在浏览器中。",
        saveToDisk: "保存到磁盘",
        saving: "正在保存到磁盘...",
        search: "搜索文件夹文件",
        searchInput: "搜索本地文件夹文件",
        searchPlaceholder: "按文件名或路径搜索"
      },
      preview: {
        close: "关闭",
        closeContents: "关闭目录",
        contents: "目录",
        decreaseFont: "减小预览字体",
        font: "预览字体",
        fontOptions: {
          athelas: "Athelas",
          baskerville: "Baskerville",
          charter: "Charter",
          georgia: "Georgia",
          kaiti: "楷体",
          "lxgw-wenkai": "霞鹜文楷",
          mono: "等宽",
          palatino: "Palatino",
          pingfang: "苹方",
          serif: "衬线",
          "source-han-sans": "思源黑体",
          "source-han-serif": "思源宋体",
          system: "系统"
        },
        fontSize: "预览字号",
        increaseFont: "增大预览字体",
        resizeLabel: "调整编辑器和预览窗格大小",
        resizeTitle: "拖动以调整编辑器和预览大小",
        templateButton: (theme) => `模板：${theme}`,
        templatePalette: "模板配色",
        themes: {
          paper: { label: "纸张", description: "温暖的编辑日光" },
          primer: { label: "Primer", description: "清爽的 README 文档风格" },
          manuscript: { label: "手稿", description: "学术感衬线排版" },
          sepia: { label: "棕褐", description: "柔和的电子书阅读感" },
          porcelain: { label: "瓷白", description: "冷调杂志式清晰感" },
          aurora: { label: "极光", description: "色彩更突出的精致笔记" },
          night: { label: "夜间", description: "均衡的深色阅读" },
          graphite: { label: "石墨", description: "蓝黑工作室对比度" },
          evergreen: { label: "常青", description: "低眩光森林专注感" },
          terminal: { label: "终端", description: "等宽黑客日志风格" }
        },
        typography: "预览排版"
      }
    },
    share: {
      metadataDescription: "由 markdownviewer.run 渲染的分享 Markdown 预览。",
      metadataTitle: "分享的 Markdown",
      metadataTitleWithDocument: (title) => `${title} - 分享的 Markdown`,
      openInWorkspace: "在工作区打开"
    },
    schema: {
      softwareDescription:
        "免费的在线 Markdown 查看器和实时预览工作区，适合 README 文件、GitHub Flavored Markdown、Mermaid 图表、KaTeX 数学公式、代码块、本地文件、粘贴的 Markdown 和原始 URL。",
      softwareKeywords:
        "Markdown 查看器,在线 Markdown 查看器,Markdown 预览,GitHub Flavored Markdown 查看器,README 查看器,Mermaid Markdown 查看器,支持数学公式的 Markdown 查看器",
      featureList: [
        "实时 Markdown 预览",
        "GitHub Flavored Markdown",
        "Mermaid 图表渲染",
        "KaTeX 数学公式渲染",
        "语法高亮代码块",
        "本地文件、粘贴、GitHub、Gist 和原始 URL 导入"
      ],
      faq: [
        {
          question: "我可以把 markdownviewer.run 当作在线 Markdown 查看器使用吗？",
          answer: "可以。打开工作区即可粘贴 Markdown、加载本地 .md 文件，或预览来自 GitHub、Gist 和原始 URL 的 Markdown。"
        },
        {
          question: "这个 Markdown 查看器支持 GitHub Flavored Markdown 吗？",
          answer: "支持。渲染器支持常见的 GitHub Flavored Markdown 模式，包括表格、任务列表、代码围栏、链接和 README 风格文档。"
        },
        {
          question: "可以预览 Markdown 里的 Mermaid 图表和数学公式吗？",
          answer: "可以。markdownviewer.run 会渲染 Mermaid 图表、语法高亮代码块和 KaTeX 数学公式，让技术文档保持易读。"
        }
      ]
    }
  }
};

export function getMessages(locale: Locale) {
  return messages[locale];
}

export type LandingMessages = Messages["landing"];
export type WorkspaceMessages = Messages["workspace"];
