import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingTopbar } from "@/components/landing/topbar";
import { getMessages } from "@/lib/i18n/messages";
import {
  getSeoLandingPage,
  type SeoLandingPage,
  type SeoLandingSlug
} from "@/lib/seo/landing-pages";

const siteUrl = "https://markdownviewer.run";

function requireSeoLandingPage(slug: SeoLandingSlug) {
  const page = getSeoLandingPage(slug);

  if (!page) {
    throw new Error(`Unknown SEO landing page slug: ${slug}`);
  }

  return page;
}

function isSeoLandingPage(page: SeoLandingPage | undefined): page is SeoLandingPage {
  return Boolean(page);
}

function buildFaqJsonLd(page: SeoLandingPage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function buildBreadcrumbJsonLd(page: SeoLandingPage) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Markdownviewer",
        item: `${siteUrl}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.h1,
        item: `${siteUrl}${page.path}`
      }
    ]
  };
}

export function buildSeoLandingMetadata(slug: SeoLandingSlug): Metadata {
  const page = requireSeoLandingPage(slug);
  const canonical = `${siteUrl}${page.path}`;

  return {
    title: page.title,
    description: page.description,
    keywords: [...page.primaryKeywords],
    alternates: {
      canonical
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: "markdownviewer.run",
      type: "website",
      locale: "en_US"
    },
    twitter: {
      card: "summary",
      title: page.title,
      description: page.description
    }
  };
}

type SeoLandingPageContentProps = {
  slug: SeoLandingSlug;
};

export function SeoLandingPageContent({ slug }: SeoLandingPageContentProps) {
  const page = getSeoLandingPage(slug);
  const t = getMessages("en");

  if (!page) {
    notFound();
  }

  const relatedPages = page.relatedSlugs.map(getSeoLandingPage).filter(isSeoLandingPage);

  return (
    <main className="landing seo-landing-page" lang="en">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(page)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(page)) }}
      />
      <LandingTopbar currentPath={page.path} locale="en" messages={t.landing.nav} />
      <div className="page-shell">
        <section className="changelog-hero">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.h1}</h1>
          <p>{page.intro}</p>
          <div className="hero-actions">
            <a className="button-primary" href="/workspace">
              {page.ctaLabel}
            </a>
            <a className="button-secondary" href="/workspace?sample=starter">
              Open sample
            </a>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Why use it</p>
              <h2 className="section-title">A focused workflow for {page.h1.toLowerCase()}.</h2>
            </div>
            <p className="section-copy">{page.summary}</p>
          </div>
          <div className="intent-grid">
            {page.benefits.map((benefit) => (
              <article className="surface-card intent-card" key={benefit}>
                <h3>{benefit}</h3>
                <p>Open the workspace, review the rendered Markdown, and keep source edits close to the preview.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="section-title">From Markdown source to readable preview.</h2>
            </div>
          </div>
          <div className="intent-grid">
            {page.workflow.map((step, index) => (
              <article className="surface-card intent-card" key={step}>
                <h3>{`Step ${index + 1}`}</h3>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Details</p>
              <h2 className="section-title">What this page is best for.</h2>
            </div>
          </div>
          <div className="intent-grid">
            {page.sections.map((section) => (
              <article className="surface-card intent-card" key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--compact" aria-labelledby={`${page.slug}-faq`}>
          <div className="section-head">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 className="section-title" id={`${page.slug}-faq`}>
                {page.h1} questions.
              </h2>
            </div>
          </div>
          <div className="faq-grid">
            {page.faq.map((item) => (
              <article className="surface-card faq-card" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--compact">
          <div className="section-head">
            <div>
              <p className="eyebrow">Related Markdown tools</p>
              <h2 className="section-title">More ways to preview Markdown online.</h2>
            </div>
          </div>
          <div className="intent-grid">
            {relatedPages.map((relatedPage) => (
              <article className="surface-card intent-card" key={relatedPage.slug}>
                <h3>
                  <a href={relatedPage.path}>{relatedPage.h1}</a>
                </h3>
                <p>{relatedPage.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
