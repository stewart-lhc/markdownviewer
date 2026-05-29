export const defaultLocale = "en";
export const locales = ["en", "zh-CN"] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  "zh-CN": "中文"
};

export function getLocalePrefix(locale: Locale) {
  return locale === defaultLocale ? "" : `/${locale}`;
}

export function localizePath(path: string, locale: Locale) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getLocalePrefix(locale)}${normalizedPath}`;
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "zh-CN" ? "en" : "zh-CN";
}
