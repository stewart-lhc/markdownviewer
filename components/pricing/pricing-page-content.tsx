import type { Metadata } from "next";
import { LandingTopbar } from "@/components/landing/topbar";
import { PricingWaitlistForm } from "@/components/pricing/pricing-waitlist-form";
import { defaultLocale, localizePath, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import type { WaitlistInterest } from "@/lib/waitlist/waitlist-store";

const siteUrl = "https://markdownviewer.run";

type PricingPageContentProps = {
  locale?: Locale;
  waitlistStatus?: "confirmed" | "invalid";
};

type PricingCopy = {
  badge: string;
  title: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  plans: Array<{
    badge?: string;
    cta: string;
    description: string;
    interest?: WaitlistInterest;
    name: string;
    price: string;
    items: string[];
  }>;
  signalsTitle: string;
  signals: string[];
  confirmedMessage: string;
  invalidMessage: string;
};

const pricingCopy: Record<Locale, PricingCopy> = {
  en: {
    badge: "Early access waitlist",
    title: "We are growing the free Markdown workspace first.",
    body:
      "Markdownviewer is not moving into a paid wall yet. Join a waitlist only if you want early access when controlled sharing or conversion automation is ready.",
    primaryCta: "Open workspace",
    secondaryCta: "View waitlists",
    plans: [
      {
        cta: "Use for free",
        description: "For quick previews, AI Markdown cleanup, local files, and occasional public links.",
        name: "Free",
        price: "$0",
        items: [
          "Paste, edit, preview, and export Markdown",
          "Open local files, folders, GitHub, Gist, and raw URLs",
          "Convert supported documents to Markdown",
          "Create public /share links"
        ]
      },
      {
        badge: "Validating now",
        cta: "Join Share Pro waitlist",
        description: "For Markdown links that need access control, expiration, and a more formal delivery surface.",
        interest: "share_pro",
        name: "Share Pro",
        price: "Waitlist",
        items: [
          "Password-protected share links",
          "Expiration dates for temporary documents",
          "Noindex controls for private-ish pages",
          "Custom slugs and basic link management"
        ]
      },
      {
        cta: "Join API waitlist",
        description: "For teams and automations that need batch document-to-Markdown conversion later.",
        interest: "converter_api",
        name: "Converter API",
        price: "Later waitlist",
        items: [
          "Batch conversion queue",
          "Conversion history and ZIP export",
          "API keys and usage limits",
          "Quality reports for converted documents"
        ]
      }
    ],
    signalsTitle: "What we are measuring before building paid features",
    signals: [
      "How often share creators click password, expiration, noindex, or custom slug.",
      "Whether Pro intent comes from AI reports, README previews, converted documents, or client-facing pages.",
      "Whether public sharing and conversion usage stay healthy without forcing registration."
    ],
    confirmedMessage: "Email confirmed. You are on the verified waitlist.",
    invalidMessage: "This confirmation link is invalid or expired."
  },
  "zh-CN": {
    badge: "早期访问 waitlist",
    title: "当前先增长免费 Markdown 工作区。",
    body:
      "Markdownviewer 现在不会快速进入付费墙。只有当你想在受控分享或转换自动化开放时第一时间试用，才需要留下邮箱。",
    primaryCta: "打开工作区",
    secondaryCta: "查看 waitlist",
    plans: [
      {
        cta: "免费使用",
        description: "适合快速预览、AI Markdown 整理、本地文件和偶尔公开分享。",
        name: "Free",
        price: "$0",
        items: [
          "粘贴、编辑、预览和导出 Markdown",
          "打开本地文件、文件夹、GitHub、Gist 和 raw URL",
          "将支持的文档转换为 Markdown",
          "创建公开 /share 链接"
        ]
      },
      {
        badge: "正在验证",
        cta: "加入 Share Pro waitlist",
        description: "适合需要访问控制、过期时间和更正式交付页面的 Markdown 链接。",
        interest: "share_pro",
        name: "Share Pro",
        price: "Waitlist",
        items: [
          "带密码的分享链接",
          "临时文档过期时间",
          "用于 private-ish 页面控制的 noindex",
          "自定义 slug 和基础链接管理"
        ]
      },
      {
        cta: "加入 API waitlist",
        description: "后续服务需要批量文档转 Markdown 的团队和自动化场景。",
        interest: "converter_api",
        name: "Converter API",
        price: "后置 waitlist",
        items: [
          "批量转换队列",
          "转换历史和 ZIP 导出",
          "API key 和用量限制",
          "转换质量报告"
        ]
      }
    ],
    signalsTitle: "做付费功能前先观察什么",
    signals: [
      "创建 share 的用户是否点击 password、expiration、noindex 或 custom slug。",
      "Pro intent 来自 AI 报告、README 预览、文档转换还是客户交付页面。",
      "不强制注册时，公开分享和转换使用是否保持健康。"
    ],
    confirmedMessage: "邮箱已确认，你已经进入 verified waitlist。",
    invalidMessage: "这个确认链接无效或已过期。"
  }
};

export function buildPricingMetadata(locale: Locale): Metadata {
  const localePrefix = locale === defaultLocale ? "" : `/${locale}`;
  const canonical = `${siteUrl}${localePrefix}/pricing`;
  const copy = pricingCopy[locale];

  return {
    title: locale === "zh-CN" ? "Markdownviewer 早期访问 waitlist" : "Markdownviewer Early Access Waitlist",
    description: copy.body,
    alternates: {
      canonical,
      languages: {
        en: `${siteUrl}/pricing`,
        "zh-CN": `${siteUrl}/zh-CN/pricing`,
        "x-default": `${siteUrl}/pricing`
      }
    },
    openGraph: {
      title: locale === "zh-CN" ? "Markdownviewer 早期访问 waitlist" : "Markdownviewer Early Access Waitlist",
      description: copy.body,
      url: canonical,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      siteName: "markdownviewer.run",
      type: "website"
    }
  };
}

export function PricingPageContent({ locale = defaultLocale, waitlistStatus }: PricingPageContentProps) {
  const copy = pricingCopy[locale];
  const messages = getMessages(locale);

  return (
    <main className="landing pricing-page" lang={locale}>
      <LandingTopbar currentPath="/pricing" locale={locale} messages={messages.landing.nav} />
      <div className="page-shell pricing-shell">
        <section className="pricing-hero">
          <p className="eyebrow">{copy.badge}</p>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="pricing-actions">
            <a className="button-primary" href={localizePath("/workspace", locale)}>
              {copy.primaryCta}
            </a>
            <a className="button-secondary" href="#share-pro">
              {copy.secondaryCta}
            </a>
          </div>
          {waitlistStatus ? (
            <p className="pricing-status-message" data-state={waitlistStatus} role="status">
              {waitlistStatus === "confirmed" ? copy.confirmedMessage : copy.invalidMessage}
            </p>
          ) : null}
        </section>

        <section className="pricing-grid" aria-label={locale === "zh-CN" ? "套餐" : "Plans"}>
          {copy.plans.map((plan) => (
            <article
              className="surface-card pricing-card"
              data-featured={plan.name === "Share Pro"}
              id={plan.name === "Share Pro" ? "share-pro" : undefined}
              key={plan.name}
            >
              {plan.badge ? <span className="pricing-card__badge">{plan.badge}</span> : null}
              <h2>{plan.name}</h2>
              <p className="pricing-card__price">{plan.price}</p>
              <p>{plan.description}</p>
              <ul>
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {plan.interest ? (
                <PricingWaitlistForm buttonLabel={plan.cta} interest={plan.interest} locale={locale} />
              ) : (
                <a className="button-secondary" href={localizePath("/workspace", locale)}>
                  {plan.cta}
                </a>
              )}
            </article>
          ))}
        </section>

        <section className="pricing-signals">
          <h2>{copy.signalsTitle}</h2>
          <ul>
            {copy.signals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
