"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";

type SiteThemeMode = "system" | "light" | "dark";

const siteThemeModeStorageKey = "markdownviewer.site.colorMode";

const modeLabels = {
  en: {
    dark: "Dark",
    group: "Color mode",
    light: "Light",
    system: "System"
  },
  "zh-CN": {
    dark: "暗色",
    group: "颜色模式",
    light: "亮色",
    system: "系统"
  }
} as const;

function isSiteThemeMode(value: string | null): value is SiteThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function applySiteThemeMode(mode: SiteThemeMode) {
  document.documentElement.dataset.siteThemeMode = mode;

  if (mode === "dark") {
    document.documentElement.dataset.theme = "night";
    return;
  }

  if (mode === "light") {
    document.documentElement.dataset.theme = "paper";
    return;
  }

  delete document.documentElement.dataset.theme;
}

type SiteThemeSwitcherProps = {
  locale: Locale;
};

export function SiteThemeSwitcher({ locale }: SiteThemeSwitcherProps) {
  const [mode, setMode] = useState<SiteThemeMode>("system");
  const labels = modeLabels[locale];

  useEffect(() => {
    const storedMode = window.localStorage.getItem(siteThemeModeStorageKey);
    const nextMode = isSiteThemeMode(storedMode) ? storedMode : "system";

    setMode(nextMode);
    applySiteThemeMode(nextMode);
  }, []);

  function selectMode(nextMode: SiteThemeMode) {
    setMode(nextMode);
    applySiteThemeMode(nextMode);
    window.localStorage.setItem(siteThemeModeStorageKey, nextMode);
  }

  const options: Array<{ icon: typeof Monitor; mode: SiteThemeMode }> = [
    { icon: Monitor, mode: "system" },
    { icon: Sun, mode: "light" },
    { icon: Moon, mode: "dark" }
  ];

  return (
    <div aria-label={labels.group} className="site-theme-switcher" role="group">
      {options.map(({ icon: Icon, mode: optionMode }) => (
        <button
          aria-label={labels[optionMode]}
          aria-pressed={mode === optionMode}
          className="site-theme-switcher__button"
          data-active={mode === optionMode}
          key={optionMode}
          onClick={() => selectMode(optionMode)}
          title={labels[optionMode]}
          type="button"
        >
          <Icon aria-hidden="true" size={16} strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}
