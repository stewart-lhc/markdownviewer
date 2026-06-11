import { LandingTopbar } from "@/components/landing/topbar";
import { defaultLocale, localizePath, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import {
  contactEmail,
  getSiteInfoPage,
  githubRepositoryUrl,
  type SiteInfoPageSlug
} from "@/lib/site-info-pages";

type SiteInfoPageContentProps = {
  locale?: Locale;
  slug: SiteInfoPageSlug;
};

export function SiteInfoPageContent({ locale = defaultLocale, slug }: SiteInfoPageContentProps) {
  const page = getSiteInfoPage(slug);
  const copy = page.copy[locale];
  const messages = getMessages(locale);

  return (
    <main className="landing site-info-page" lang={locale}>
      <LandingTopbar currentPath={page.path} locale={locale} messages={messages.landing.nav} />
      <div className="page-shell site-info-shell">
        <section className="changelog-hero site-info-hero">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.h1}</h1>
          <p>{copy.intro}</p>
          <div className="hero-actions">
            <a className="button-primary" href={localizePath("/workspace", locale)}>
              {locale === "zh-CN" ? "打开工作区" : "Open workspace"}
            </a>
            <a className="button-secondary" href={`mailto:${contactEmail}`}>
              {locale === "zh-CN" ? "发送邮件" : "Email contact"}
            </a>
          </div>
        </section>

        <section className="section section--compact" aria-label={copy.h1}>
          <div className="site-info-grid">
            {copy.sections.map((section) => (
              <article className="surface-card site-info-card" key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <nav className="site-info-related" aria-label={locale === "zh-CN" ? "站点页面" : "Site pages"}>
          <a href={localizePath("/about", locale)}>{locale === "zh-CN" ? "关于" : "About"}</a>
          <a href={localizePath("/contact", locale)}>{locale === "zh-CN" ? "联系" : "Contact"}</a>
          <a href={localizePath("/privacy", locale)}>{locale === "zh-CN" ? "隐私政策" : "Privacy policy"}</a>
          <a href={localizePath("/terms", locale)}>{locale === "zh-CN" ? "服务条款" : "Terms of service"}</a>
          <a href={githubRepositoryUrl}>GitHub</a>
        </nav>
      </div>
    </main>
  );
}
