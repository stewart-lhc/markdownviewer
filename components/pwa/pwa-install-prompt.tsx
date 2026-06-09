"use client";

import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { defaultLocale, type Locale } from "@/lib/i18n/locales";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const dismissedStorageKey = "markdownviewer.pwa.installPrompt.dismissed.v1";

function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith("/zh-CN") ? "zh-CN" : defaultLocale;
}

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 720px)").matches || window.matchMedia("(pointer: coarse)").matches;
}

function isIosDevice() {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();
  const touchMac = platform === "macintel" && navigator.maxTouchPoints > 1;
  return /iphone|ipad|ipod/.test(userAgent) || touchMac;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [secureContext, setSecureContext] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function dismissed() {
      return window.localStorage.getItem(dismissedStorageKey) === "true";
    }

    function syncVisibility() {
      const shouldShow = isMobileViewport() && !isStandaloneDisplay() && !dismissed();
      setVisible(shouldShow);
      setIos(isIosDevice());
      setLocale(getLocaleFromPathname(window.location.pathname));
      setSecureContext(window.isSecureContext !== false);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      syncVisibility();
    }

    function handleInstalled() {
      window.localStorage.setItem(dismissedStorageKey, "true");
      setVisible(false);
      setDeferredPrompt(null);
    }

    const mobileQuery = window.matchMedia("(max-width: 720px)");
    const pointerQuery = window.matchMedia("(pointer: coarse)");

    syncVisibility();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    mobileQuery.addEventListener("change", syncVisibility);
    pointerQuery.addEventListener("change", syncVisibility);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      mobileQuery.removeEventListener("change", syncVisibility);
      pointerQuery.removeEventListener("change", syncVisibility);
    };
  }, []);

  function dismissPrompt() {
    window.localStorage.setItem(dismissedStorageKey, "true");
    setVisible(false);
  }

  async function handleInstallClick() {
    if (!secureContext) {
      window.location.assign("https://markdownviewer.run/");
      return;
    }

    if (!deferredPrompt) {
      setInstructionsOpen(true);
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice.catch(() => undefined);
    setDeferredPrompt(null);

    if (!choice || choice.outcome === "accepted" || choice.outcome === "dismissed") {
      window.localStorage.setItem(dismissedStorageKey, "true");
      setVisible(false);
    }
  }

  if (!visible) {
    return null;
  }

  const isChinese = locale === "zh-CN";
  const title = isChinese ? "安装 Markdownviewer" : "Install Markdownviewer";
  const readyCopy = isChinese
    ? "添加到主屏幕后，可以像应用一样全屏打开工作区。"
    : "Add the workspace to your home screen and open it like a full-screen app.";
  const iosCopy = isChinese
    ? "在 iPhone 或 iPad 上，请用 Safari 打开本站，点击分享按钮，然后选择“添加到主屏幕”。"
    : "On iPhone or iPad, open this site in Safari, tap Share, then choose Add to Home Screen.";
  const manualCopy = isChinese
    ? "如果浏览器没有弹出安装窗口，请打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。"
    : "If your browser does not show an install dialog, open the browser menu and choose Install app or Add to Home Screen.";
  const insecureCopy = isChinese
    ? "本地 LAN 测试地址不能触发 PWA 安装。请在手机上打开正式 HTTPS 站点安装。"
    : "Local LAN test URLs cannot trigger PWA install. Open the live HTTPS site on your phone to install it.";
  const body = !secureContext ? insecureCopy : deferredPrompt ? readyCopy : ios ? iosCopy : manualCopy;
  const actionLabel = !secureContext
    ? isChinese
      ? "打开正式站"
      : "Open live site"
    : deferredPrompt
    ? isChinese
      ? "安装"
      : "Install"
    : instructionsOpen
      ? isChinese
        ? "知道了"
        : "Got it"
      : isChinese
        ? "查看步骤"
        : "How to install";

  return (
    <aside
      aria-label={title}
      className="pwa-install-prompt"
      data-instructions-open={instructionsOpen}
      role="complementary"
    >
      <div className="pwa-install-prompt__icon" aria-hidden="true">
        {ios || instructionsOpen ? <Share2 size={18} strokeWidth={2.2} /> : <Download size={18} strokeWidth={2.2} />}
      </div>
      <div className="pwa-install-prompt__copy">
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <button
        className="pwa-install-prompt__action"
        onClick={instructionsOpen && !deferredPrompt ? dismissPrompt : handleInstallClick}
        type="button"
      >
        {actionLabel}
      </button>
      <button
        aria-label={isChinese ? "关闭安装提示" : "Dismiss install prompt"}
        className="pwa-install-prompt__dismiss"
        onClick={dismissPrompt}
        type="button"
      >
        <X aria-hidden="true" size={16} strokeWidth={2.2} />
      </button>
    </aside>
  );
}
