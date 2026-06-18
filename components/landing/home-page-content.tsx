import type { Metadata } from "next";
import { BrandLink } from "@/components/brand/brand-link";
import { ContinuePanel } from "@/components/landing/continue-panel";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Hero } from "@/components/landing/hero";
import { LiveSample } from "@/components/landing/live-sample";
import { SourceStrip } from "@/components/landing/source-strip";
import { LandingTopbar } from "@/components/landing/topbar";
import { defaultLocale, localizePath, type Locale } from "@/lib/i18n/locales";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import { getProductUpdateText, productUpdates } from "@/lib/product-updates";
import { seoLandingPages } from "@/lib/seo/landing-pages";

const siteUrl = "https://markdownviewer.run";
const githubRepositoryUrl = "https://github.com/stewart-lhc/markdownviewer";

function localizeHref(href: string, locale: Locale) {
  if (href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) {
    return href;
  }

  const [path, query = ""] = href.split("?");
  const localizedPath = localizePath(path, locale);
  return query ? `${localizedPath}?${query}` : localizedPath;
}

export function buildHomeMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  const localePrefix = locale === defaultLocale ? "" : `/${locale}`;
  const canonical = `${siteUrl}${localePrefix || "/"}`;

  return {
    title: t.meta.homeTitleShort,
    description: t.meta.homeDescription,
    keywords: t.meta.keywords,
    alternates: {
      canonical,
      languages: {
        en: siteUrl,
        "zh-CN": `${siteUrl}/zh-CN`,
        "x-default": siteUrl
      }
    },
    openGraph: {
      title: t.meta.homeTitleShort,
      description: t.meta.homeDescription,
      url: canonical,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      siteName: t.common.siteName,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: t.meta.homeTitleShort,
      description: t.meta.homeDescription
    }
  };
}

function buildSoftwareJsonLd(t: Messages) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t.common.siteName,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/`,
    description: t.schema.softwareDescription,
    keywords: t.schema.softwareKeywords,
    sameAs: [githubRepositoryUrl],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    featureList: t.schema.featureList
  };
}

function buildFaqJsonLd(t: Messages) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.schema.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

type HomePageContentProps = {
  locale?: Locale;
};

export function HomePageContent({ locale = defaultLocale }: HomePageContentProps) {
  const t = getMessages(locale);

  return (
    <main className="landing" lang={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSoftwareJsonLd(t)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(t)) }}
      />
      <LandingTopbar currentPath="/" locale={locale} messages={t.landing.nav} />
      <div className="page-shell">
        <div className="hero">
          <Hero locale={locale} messages={t.landing} />
          <LiveSample ribbon={t.landing.hero.sampleRibbon} />
        </div>
        <ContinuePanel messages={t.workspace.recent} />
        <section className="source-band" aria-label={t.landing.sources.ariaLabel}>
          <p>{locale === defaultLocale ? "Bring the source you already have." : "把你已有的来源直接带进来。"}</p>
          <SourceStrip ariaLabel={t.landing.sources.ariaLabel} sources={t.landing.sources.items} />
        </section>

        <section className="section section--updates">
          <div className="section-head">
            <p className="eyebrow">{t.landing.updates.eyebrow}</p>
            <h2 className="section-title">{t.landing.updates.title}</h2>
            <p className="section-copy">{t.landing.updates.copy}</p>
          </div>
          <div className="update-grid">
            {productUpdates.slice(0, 3).map((update, index) => {
              const copy = getProductUpdateText(update, locale);

              return (
                <article className={`surface-card update-card${index === 0 ? " update-card--lead" : ""}`} key={update.version}>
                  <span>{update.version}</span>
                  <h3>{copy.title}</h3>
                  <p>{copy.summary}</p>
                </article>
              );
            })}
          </div>
          <a className="button-secondary section-link" href={localizePath("/changelog", locale)}>
            {t.landing.updates.link}
          </a>
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">{t.landing.features.title}</h2>
            <p className="section-copy">{t.landing.features.copy}</p>
          </div>
          <FeatureGrid features={t.landing.features.items} />
        </section>

        <section className="section section--workflows">
          <div className="section-head">
            <h2 className="section-title">{t.landing.intents.title}</h2>
            <p className="section-copy">{t.landing.intents.copy}</p>
          </div>
          <div className="intent-grid">
            {t.landing.intents.cards.map((card) => (
              <article className="surface-card intent-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        {locale === defaultLocale ? (
          <section className="section">
            <div className="section-head">
              <h2 className="section-title">More focused ways to preview Markdown online.</h2>
              <p className="section-copy">
                Start from the Markdown task you searched for, then open the same live workspace with the right context.
              </p>
            </div>
            <div className="intent-grid">
              {seoLandingPages.map((page) => (
                <article className="surface-card intent-card" key={page.slug}>
                  <h3>
                    <a href={page.path}>{page.h1}</a>
                  </h3>
                  <p>{page.summary}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section section--compact" aria-labelledby="markdown-viewer-faq">
          <div className="section-head">
            <h2 className="section-title" id="markdown-viewer-faq">
              {t.landing.faq.title}
            </h2>
          </div>
          <div className="faq-grid">
            {t.landing.faq.items.map((faq) => (
              <article className="surface-card faq-card" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          <div className="site-footer__brand" id="about">
            <BrandLink className="brand" label={t.common.brand} title={t.common.brand} />
            <p>{t.landing.footer.description}</p>
          </div>
          <nav className="site-footer__nav" aria-label={t.landing.footer.ariaLabel}>
            {t.landing.footer.columns.map((column) => (
              <div className="site-footer__column" key={column.title}>
                <h2>{column.title}</h2>
                {column.links.map((link) => (
                  <a href={localizeHref(link.href, locale)} key={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </nav>
          {locale === defaultLocale ? (
            <nav className="site-footer__workflows" aria-label="Markdown workflow pages">
              <h2>Workflow pages</h2>
              <div>
                {seoLandingPages.map((page) => (
                  <a href={page.path} key={page.slug}>
                    {page.h1}
                  </a>
                ))}
              </div>
            </nav>
          ) : null}
          <div className="site-footer__friends-card">
            <div className="site-footer__friends" aria-label="Friendly links">
              <h2>{locale === defaultLocale ? "Friendly links" : "友情链接"}</h2>
              <div className="site-footer__launch-badges">
                <a
                  className="site-footer__launch-badge"
                  href="https://www.tinystartups.com/startup/markdown-viewer"
                  target="_blank"
                  rel="noopener"
                  aria-label="Launched on Tiny Startups"
                >
                  <svg aria-hidden="true" focusable="false" width="56" height="56" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="tiny-startups-gradient" x1=".1" y1="0" x2=".9" y2="1">
                        <stop offset="0%" stopColor="#3525E6" />
                        <stop offset="55%" stopColor="#D81FE0" />
                        <stop offset="100%" stopColor="#22B8F0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M50 6C52 32 68 48 94 50C68 52 52 68 50 94C48 68 32 52 6 50C32 48 48 32 50 6Z"
                      fill="url(#tiny-startups-gradient)"
                    />
                  </svg>
                  <span className="site-footer__launch-text">
                    <span className="site-footer__launch-kicker">Launched on</span>
                    <span className="site-footer__launch-name">Tiny Startups</span>
                    <span className="site-footer__launch-domain">tinystartups.com</span>
                  </span>
                </a>
                <a
                  className="site-footer__uneed-badge"
                  href="https://www.uneed.best/tool/markdown-viewer"
                  target="_blank"
                  rel="noopener"
                >
                  <img
                    src="https://www.uneed.best/EMBED3B.png"
                    alt="Launching Soon on Uneed"
                    width="250"
                    height="65"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="site-footer__bottom">
            <div className="site-footer__bottom-copy">
              <span>{t.landing.footer.copyright}</span>
              <span>{t.landing.footer.tagline}</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
