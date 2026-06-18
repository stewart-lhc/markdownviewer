"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { SiteThemeSwitcher } from "@/components/landing/site-theme-switcher";
import { localizePath, type Locale } from "@/lib/i18n/locales";
import type { LandingMessages } from "@/lib/i18n/messages";

type MobileTopbarMenuProps = {
  currentPath: string;
  githubIcon: ReactNode;
  githubRepositoryUrl: string;
  locale: Locale;
  messages: LandingMessages["nav"];
};

const menuLabels = {
  en: {
    close: "Close navigation breadcrumbs",
    open: "Open navigation breadcrumbs"
  },
  "zh-CN": {
    close: "关闭导航面包屑",
    open: "打开导航面包屑"
  }
} as const;

function isCurrentPath(currentPath: string, path: string) {
  return currentPath === path;
}

export function MobileTopbarMenu({ currentPath, githubIcon, githubRepositoryUrl, locale, messages }: MobileTopbarMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const labels = menuLabels[locale];

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="topbar-breadcrumbs" data-open={open} ref={containerRef}>
      <button
        aria-controls="topbar-breadcrumbs-panel"
        aria-expanded={open}
        aria-label={open ? labels.close : labels.open}
        className="topbar-breadcrumbs__trigger"
        onClick={() => setOpen((current) => !current)}
        title={open ? labels.close : labels.open}
        type="button"
      >
        {open ? <X aria-hidden="true" size={18} strokeWidth={2} /> : <Menu aria-hidden="true" size={18} strokeWidth={2} />}
      </button>
      <div className="topbar-breadcrumbs__panel" id="topbar-breadcrumbs-panel">
        <div className="topbar-breadcrumbs__links" onClickCapture={() => setOpen(false)}>
          <a
            aria-current={isCurrentPath(currentPath, "/pricing") ? "page" : undefined}
            className="ghost-link"
            href={localizePath("/pricing", locale)}
          >
            {messages.pricing}
          </a>
          <a
            aria-current={isCurrentPath(currentPath, "/changelog") ? "page" : undefined}
            className="ghost-link"
            href={localizePath("/changelog", locale)}
          >
            {messages.changelog}
          </a>
          <a aria-label={messages.github} className="ghost-link topbar-breadcrumbs__github" href={githubRepositoryUrl}>
            {githubIcon}
            <span>GitHub</span>
          </a>
        </div>
        <div className="topbar-breadcrumbs__settings-row">
          <LanguageSwitcher currentLocale={locale} path={currentPath} />
          <SiteThemeSwitcher locale={locale} />
        </div>
      </div>
    </div>
  );
}
