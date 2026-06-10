"use client";

import { useEffect } from "react";

type GoogleAnalyticsProps = {
  measurementId?: string;
};

const analyticsDelayMs = 12000;
const interactionEvents = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    if (!measurementId) {
      return;
    }

    const analyticsId = measurementId;

    type GoogleAnalyticsWindow = Window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };

    const analyticsWindow = window as GoogleAnalyticsWindow;
    let loaded = false;

    function removeInteractionListeners() {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, loadAnalytics);
      });
    }

    function loadAnalytics() {
      if (loaded) {
        return;
      }

      loaded = true;
      removeInteractionListeners();

      analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
      analyticsWindow.gtag = (...args: unknown[]) => {
        analyticsWindow.dataLayer?.push(args);
      };
      analyticsWindow.gtag("js", new Date());
      analyticsWindow.gtag("config", analyticsId);

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;
      document.head.appendChild(script);
    }

    const timeoutId = window.setTimeout(loadAnalytics, analyticsDelayMs);

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, loadAnalytics, { once: true, passive: true });
    });

    return () => {
      window.clearTimeout(timeoutId);
      removeInteractionListeners();
    };
  }, [measurementId]);

  return null;
}
