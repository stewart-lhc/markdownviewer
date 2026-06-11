type ProductEventProperties = Record<string, string | number | boolean | undefined>;

type ProductAnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function trackProductEvent(eventName: string, properties: ProductEventProperties = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const analyticsWindow = window as ProductAnalyticsWindow;
  const payload = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );

  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.dataLayer.push({
    event: eventName,
    ...payload
  });

  analyticsWindow.gtag?.("event", eventName, payload);
}
