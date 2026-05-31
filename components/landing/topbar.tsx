import { BrandLink } from "@/components/brand/brand-link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
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

export function LandingTopbar({ currentPath, locale, messages }: LandingTopbarProps) {
  return (
    <header className="topbar">
      <BrandLink className="brand" label="Markdownviewer" title="Markdownviewer" />
      <nav className="topbar-actions" aria-label={messages.primary}>
        <LanguageSwitcher currentLocale={locale} path={currentPath} />
        <a aria-label={messages.github} className="ghost-link ghost-link--icon" href={githubRepositoryUrl}>
          <span aria-hidden="true" className="gh-mark">
            gh
          </span>
        </a>
        <a
          aria-current={isCurrentPath(currentPath, "/workspace") ? "page" : undefined}
          className="ghost-link"
          href={localizePath("/workspace", locale)}
        >
          {messages.workspace}
        </a>
        <a
          aria-current={isCurrentPath(currentPath, "/changelog") ? "page" : undefined}
          className="ghost-link"
          href={localizePath("/changelog", locale)}
        >
          {messages.changelog}
        </a>
      </nav>
    </header>
  );
}
