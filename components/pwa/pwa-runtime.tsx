"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PwaInstallPrompt = dynamic(
  () => import("@/components/pwa/pwa-install-prompt").then((module) => module.PwaInstallPrompt),
  {
    loading: () => null,
    ssr: false
  }
);

function scheduleIdleTask(callback: () => void) {
  const requestIdleCallback = window.requestIdleCallback;

  if (typeof requestIdleCallback === "function") {
    const idleId = requestIdleCallback(callback, { timeout: 3000 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = globalThis.setTimeout(callback, 1500);
  return () => globalThis.clearTimeout(timeoutId);
}

export function PwaRuntime() {
  const [installPromptReady, setInstallPromptReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      return;
    }

    const isLocalDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1" ||
      process.env.NODE_ENV !== "production";

    if (isLocalDevelopment) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });
      return;
    }

    const registerServiceWorker = () => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker, { once: true });

    return () => {
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  useEffect(() => scheduleIdleTask(() => setInstallPromptReady(true)), []);

  return installPromptReady ? <PwaInstallPrompt /> : null;
}
