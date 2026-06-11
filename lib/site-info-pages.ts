import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/locales";

const siteUrl = "https://markdownviewer.run";
export const contactEmail = "listewart751@gmail.com";
export const githubRepositoryUrl = "https://github.com/stewart-lhc/markdownviewer";

export type SiteInfoPageSlug = "about" | "contact" | "privacy" | "terms";

type SiteInfoSection = Readonly<{
  title: string;
  body: string;
}>;

type SiteInfoPageCopy = Readonly<{
  description: string;
  eyebrow: string;
  h1: string;
  title: string;
  intro: string;
  sections: readonly SiteInfoSection[];
}>;

type SiteInfoPage = Readonly<{
  slug: SiteInfoPageSlug;
  path: string;
  zhPath: string;
  copy: Record<Locale, SiteInfoPageCopy>;
}>;

export const siteInfoPages = [
  {
    slug: "about",
    path: "/about",
    zhPath: "/zh-CN/about",
    copy: {
      en: {
        title: "About markdownviewer.run",
        description:
          "Learn about markdownviewer.run, an independent online Markdown viewer for README files, technical notes, AI output, diagrams, math, and document conversion.",
        eyebrow: "About",
        h1: "About markdownviewer.run",
        intro:
          "markdownviewer.run is an independent Markdown viewing and editing workspace built for people who need to read, clean up, convert, and share Markdown without setting up a docs stack.",
        sections: [
          {
            title: "What the product is for",
            body:
              "The app focuses on practical Markdown workflows: opening local .md files, pasting AI-generated Markdown, loading raw URLs, previewing GitHub Flavored Markdown, rendering Mermaid diagrams and KaTeX math, and converting supported documents into Markdown for review."
          },
          {
            title: "Who maintains it",
            body:
              "markdownviewer.run is maintained by an independent developer. It is not presented as a large company or agency product, and the public source repository is linked from the site for transparency."
          },
          {
            title: "Product direction",
            body:
              "The current priority is keeping the core Markdown workspace useful, fast, and clear before adding paid collaboration or automation features."
          }
        ]
      },
      "zh-CN": {
        title: "关于 markdownviewer.run",
        description:
          "了解 markdownviewer.run：一个由个人开发者维护的在线 Markdown 查看器，适合 README、技术笔记、AI 输出、图表、数学公式和文档转换。",
        eyebrow: "关于",
        h1: "关于 markdownviewer.run",
        intro:
          "markdownviewer.run 是一个独立的 Markdown 阅读和编辑工作区，面向需要读取、整理、转换和分享 Markdown，但不想搭建文档系统的用户。",
        sections: [
          {
            title: "产品用途",
            body:
              "这个应用专注实际 Markdown 工作流：打开本地 .md 文件、粘贴 AI 生成的 Markdown、加载 raw URL、预览 GitHub Flavored Markdown、渲染 Mermaid 图表和 KaTeX 数学公式，并把支持的文档转换为 Markdown 以便检查。"
          },
          {
            title: "维护者",
            body:
              "markdownviewer.run 由个人开发者维护。站点不会把自己包装成大型公司或机构产品，并通过公开源码仓库保持透明。"
          },
          {
            title: "产品方向",
            body:
              "当前优先级是让核心 Markdown 工作区保持好用、快速、清楚，再考虑付费协作或自动化功能。"
          }
        ]
      }
    }
  },
  {
    slug: "contact",
    path: "/contact",
    zhPath: "/zh-CN/contact",
    copy: {
      en: {
        title: "Contact markdownviewer.run",
        description:
          "Contact the independent developer behind markdownviewer.run for product feedback, support questions, or legal requests.",
        eyebrow: "Contact",
        h1: "Contact markdownviewer.run",
        intro:
          "For product feedback, support questions, bug reports, or legal requests, contact the independent developer maintaining markdownviewer.run.",
        sections: [
          {
            title: "Email",
            body: `Use ${contactEmail} for support, product feedback, or legal requests.`
          },
          {
            title: "GitHub issues",
            body:
              "For public bug reports or feature requests, GitHub Issues are usually the best place because they keep technical context visible."
          },
          {
            title: "What to include",
            body:
              "If you are reporting a rendering, import, share, or conversion problem, include the browser, source type, and a minimal Markdown example when possible."
          }
        ]
      },
      "zh-CN": {
        title: "联系 markdownviewer.run",
        description:
          "联系 markdownviewer.run 的个人开发者，处理产品反馈、支持问题、bug 报告或法律请求。",
        eyebrow: "联系",
        h1: "联系 markdownviewer.run",
        intro:
          "如果你有产品反馈、支持问题、bug 报告或法律请求，可以联系维护 markdownviewer.run 的个人开发者。",
        sections: [
          {
            title: "邮箱",
            body: `支持、产品反馈或法律请求请使用 ${contactEmail}。`
          },
          {
            title: "GitHub Issues",
            body:
              "公开 bug 报告或功能请求通常适合放到 GitHub Issues，因为技术上下文可以保留下来。"
          },
          {
            title: "建议附带的信息",
            body:
              "如果是渲染、导入、分享或转换问题，请尽量附上浏览器、来源类型，以及一个最小 Markdown 示例。"
          }
        ]
      }
    }
  },
  {
    slug: "privacy",
    path: "/privacy",
    zhPath: "/zh-CN/privacy",
    copy: {
      en: {
        title: "Privacy Policy",
        description:
          "Read the markdownviewer.run privacy policy for local files, pasted Markdown, remote URL import, document conversion, analytics, and public share links.",
        eyebrow: "Privacy",
        h1: "Privacy Policy",
        intro:
          "This policy explains how markdownviewer.run handles Markdown content and basic product usage data. It is written for the current independent product, not a large enterprise service.",
        sections: [
          {
            title: "Local files and pasted Markdown",
            body:
              "Local files and pasted Markdown are handled in your browser unless you choose an action that needs a server, such as loading a remote URL, converting a document, or creating a public share link."
          },
          {
            title: "Remote URLs and document conversion",
            body:
              "When you load a remote Markdown URL or convert a supported document, the request is processed by the application server so the result can be returned to your browser. Document conversion is designed around temporary processing rather than long-term storage of the original upload."
          },
          {
            title: "Public share links",
            body:
              "Creating a public share link stores the Markdown content needed for that shared page to open from its own URL. Only create a share link for content you are comfortable making available through that link."
          },
          {
            title: "Analytics and contact",
            body:
              "The site may use basic analytics to understand product usage. If you contact the developer by email or GitHub, the information you send is used to respond to that request."
          }
        ]
      },
      "zh-CN": {
        title: "隐私政策",
        description:
          "阅读 markdownviewer.run 关于本地文件、粘贴 Markdown、远程 URL 导入、文档转换、analytics 和公开分享链接的隐私政策。",
        eyebrow: "隐私",
        h1: "隐私政策",
        intro:
          "本政策说明 markdownviewer.run 如何处理 Markdown 内容和基础产品使用数据。它面向当前这个个人开发者维护的产品，而不是大型企业服务。",
        sections: [
          {
            title: "本地文件和粘贴的 Markdown",
            body:
              "除非你选择需要服务器参与的操作，例如加载远程 URL、转换文档或创建公开分享链接，本地文件和粘贴的 Markdown 都在浏览器中处理。"
          },
          {
            title: "远程 URL 和文档转换",
            body:
              "当你加载远程 Markdown URL 或转换支持的文档时，请求会由应用服务器处理，以便把结果返回到你的浏览器。文档转换的设计目标是临时处理，而不是长期保存原始上传文件。"
          },
          {
            title: "公开分享链接",
            body:
              "创建公开分享链接会存储该分享页打开所需的 Markdown 内容。请只为你愿意通过该链接访问的内容创建分享链接。"
          },
          {
            title: "Analytics 和联系",
            body:
              "站点可能使用基础 analytics 来了解产品使用情况。如果你通过邮箱或 GitHub 联系开发者，你发送的信息会用于回复该请求。"
          }
        ]
      }
    }
  },
  {
    slug: "terms",
    path: "/terms",
    zhPath: "/zh-CN/terms",
    copy: {
      en: {
        title: "Terms of Service",
        description:
          "Read the markdownviewer.run terms of service for responsible Markdown viewing, importing, conversion, sharing, and acceptable use.",
        eyebrow: "Terms",
        h1: "Terms of Service",
        intro:
          "These terms describe the basic rules for using markdownviewer.run responsibly. The product is provided by an independent developer as a Markdown viewing and editing tool.",
        sections: [
          {
            title: "Use content you have rights to process",
            body:
              "Only open, import, convert, or share Markdown and documents that you have the right to access and process. Do not use the service to expose private, confidential, illegal, abusive, or infringing material."
          },
          {
            title: "Public share links",
            body:
              "Share links are intended for documents you are allowed to publish through a URL. You are responsible for the content you choose to share and for removing sensitive information before creating a link."
          },
          {
            title: "Service availability",
            body:
              "The service is provided as an independent web tool and may change over time. Features such as imports, conversion, analytics, and public links may be updated, limited, or removed as the product evolves."
          },
          {
            title: "Contact",
            body: `For support, product feedback, or legal requests, email ${contactEmail}.`
          }
        ]
      },
      "zh-CN": {
        title: "服务条款",
        description:
          "阅读 markdownviewer.run 关于负责任地查看、导入、转换、分享 Markdown 以及可接受使用范围的服务条款。",
        eyebrow: "条款",
        h1: "服务条款",
        intro:
          "这些条款说明使用 markdownviewer.run 的基本规则。该产品由个人开发者作为 Markdown 阅读和编辑工具提供。",
        sections: [
          {
            title: "只处理你有权处理的内容",
            body:
              "请只打开、导入、转换或分享你有权访问和处理的 Markdown 与文档。不要使用该服务暴露私人、机密、违法、滥用或侵权内容。"
          },
          {
            title: "公开分享链接",
            body:
              "分享链接适用于你有权通过 URL 发布的文档。你需要对自己选择分享的内容负责，并在创建链接前移除敏感信息。"
          },
          {
            title: "服务可用性",
            body:
              "该服务作为独立 Web 工具提供，后续可能变化。导入、转换、analytics 和公开链接等功能可能随着产品演进而更新、限制或移除。"
          },
          {
            title: "联系",
            body: `支持、产品反馈或法律请求请发送邮件到 ${contactEmail}。`
          }
        ]
      }
    }
  }
] as const satisfies readonly SiteInfoPage[];

export function getSiteInfoPage(slug: SiteInfoPageSlug): SiteInfoPage {
  const page = siteInfoPages.find((item) => item.slug === slug);

  if (!page) {
    throw new Error(`Unknown site info page: ${slug}`);
  }

  return page;
}

export function buildSiteInfoMetadata(slug: SiteInfoPageSlug, locale: Locale): Metadata {
  const page = getSiteInfoPage(slug);
  const copy = page.copy[locale];
  const canonicalPath = locale === "zh-CN" ? page.zhPath : page.path;
  const canonical = `${siteUrl}${canonicalPath}`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        en: `${siteUrl}${page.path}`,
        "zh-CN": `${siteUrl}${page.zhPath}`,
        "x-default": `${siteUrl}${page.path}`
      }
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonical,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      siteName: "markdownviewer.run",
      type: "website"
    },
    twitter: {
      card: "summary",
      title: copy.title,
      description: copy.description
    }
  };
}
