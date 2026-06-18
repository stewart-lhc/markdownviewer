import { BrandLink } from "@/components/brand/brand-link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { MobileTopbarMenu } from "@/components/landing/mobile-topbar-menu";
import { SiteThemeSwitcher } from "@/components/landing/site-theme-switcher";
import { localizePath, type Locale } from "@/lib/i18n/locales";
import type { LandingMessages } from "@/lib/i18n/messages";

const githubRepositoryUrl = "https://github.com/stewart-lhc/markdownviewer";

type LandingTopbarProps = {
  currentPath: string;
  locale: Locale;
  messages: LandingMessages["nav"];
};

function isCurrentPath(currentPath: string, path: string) {
  return currentPath === path;
}

function GithubMark() {
  return (
    <svg aria-hidden="true" className="github-mark" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.5 1.8 4 .2.1-.7.4-1.2.7-1.5-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0C17.8 4.7 18.8 5 18.8 5c.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

export function LandingTopbar({ currentPath, locale, messages }: LandingTopbarProps) {
  return (
    <header className="topbar">
      <BrandLink className="brand" label="Markdownviewer" title="Markdownviewer" />
      <nav className="topbar-actions" aria-label={messages.primary}>
        <div className="topbar-actions__desktop">
          <SiteThemeSwitcher locale={locale} />
          <LanguageSwitcher currentLocale={locale} path={currentPath} />
          <a aria-label={messages.github} className="ghost-link ghost-link--icon" href={githubRepositoryUrl}>
            <GithubMark />
          </a>
          <a
            aria-current={isCurrentPath(currentPath, "/changelog") ? "page" : undefined}
            className="ghost-link"
            href={localizePath("/changelog", locale)}
          >
            {messages.changelog}
          </a>
          <a
            aria-current={isCurrentPath(currentPath, "/pricing") ? "page" : undefined}
            className="ghost-link"
            href={localizePath("/pricing", locale)}
          >
            {messages.pricing}
          </a>
        </div>
        <a
          aria-current={isCurrentPath(currentPath, "/workspace") ? "page" : undefined}
          className="ghost-link ghost-link--primary"
          href={localizePath("/workspace", locale)}
        >
          {messages.workspace}
        </a>
        <MobileTopbarMenu
          currentPath={currentPath}
          githubIcon={<GithubMark />}
          githubRepositoryUrl={githubRepositoryUrl}
          locale={locale}
          messages={messages}
        />
      </nav>
    </header>
  );
}
