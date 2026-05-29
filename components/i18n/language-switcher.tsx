import { getAlternateLocale, localeLabels, localizePath, type Locale } from "@/lib/i18n/locales";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  path: string;
};

export function LanguageSwitcher({ currentLocale, path }: LanguageSwitcherProps) {
  const nextLocale = getAlternateLocale(currentLocale);

  return (
    <a className="ghost-link" href={localizePath(path, nextLocale)} hrefLang={nextLocale}>
      {localeLabels[nextLocale]}
    </a>
  );
}
