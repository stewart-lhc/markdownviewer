import { HeroImportActions } from "@/components/landing/hero-import-actions";
import type { Locale } from "@/lib/i18n/locales";
import type { LandingMessages } from "@/lib/i18n/messages";

type HeroProps = {
  locale: Locale;
  messages: LandingMessages;
};

export function Hero({ locale, messages }: HeroProps) {
  return (
    <div className="hero-copy">
      <span className="eyebrow">{messages.hero.eyebrow}</span>
      <h1>{messages.hero.title}</h1>
      <p>{messages.hero.body}</p>
      <HeroImportActions locale={locale} />
    </div>
  );
}
