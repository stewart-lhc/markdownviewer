import type { Metadata } from "next";
import { LandingTopbar } from "@/components/landing/topbar";
import { defaultLocale, localizePath, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { getProductUpdateText, productUpdates } from "@/lib/product-updates";

const siteUrl = "https://markdownviewer.run";

export function buildChangelogMetadata(locale: Locale): Metadata {
  const title = locale === "zh-CN" ? "Markdownviewer 更新日志" : "Markdownviewer Changelog";
  const description =
    locale === "zh-CN"
      ? "按部署顺序记录 Markdownviewer 的最新功能、版本号和产品更新。"
      : "Latest Markdownviewer features, versioned by deploy date and listed in deployment order.";
  const canonical = `${siteUrl}${localizePath("/changelog", locale)}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${siteUrl}/changelog`,
        "zh-CN": `${siteUrl}/zh-CN/changelog`,
        "x-default": `${siteUrl}/changelog`
      }
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      siteName: "markdownviewer.run",
      type: "website"
    }
  };
}

export type ChangelogPageContentProps = {
  locale?: Locale;
};

export function ChangelogPageContent({ locale = defaultLocale }: ChangelogPageContentProps) {
  const t = getMessages(locale);
  const isChinese = locale === "zh-CN";

  return (
    <main className="landing changelog-page" lang={locale}>
      <LandingTopbar currentPath="/changelog" locale={locale} messages={t.landing.nav} />
      <div className="page-shell">
        <section className="changelog-hero">
          <p className="eyebrow">{isChinese ? "部署顺序" : "Deploy order"}</p>
          <h1>{isChinese ? "Markdownviewer 更新日志" : "Markdownviewer Changelog"}</h1>
          <p>
            {isChinese
              ? "这里按部署日期记录最近上线的能力。版本号使用日期命名，例如 26.530 表示 2026-05-30 的部署批次。"
              : "Recent feature batches are listed by deployment date. Versions use date-based names, so 26.530 means the 2026-05-30 deploy batch."}
          </p>
        </section>
        <section className="release-list" aria-label={isChinese ? "版本更新" : "Product updates"}>
          {productUpdates.map((update) => {
            const copy = getProductUpdateText(update, locale);

            return (
              <article className="surface-card release-card" key={update.version}>
                <div className="release-card__meta">
                  <span>{update.version}</span>
                  <time dateTime={update.date}>{update.date}</time>
                </div>
                <div className="release-card__body">
                  <h2>{copy.title}</h2>
                  <p>{copy.summary}</p>
                  <ul>
                    {copy.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
