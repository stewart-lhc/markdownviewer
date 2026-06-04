const cacheName = "markdownviewer-pwa-v2";
const appShellUrls = [
  "/",
  "/workspace",
  "/zh-CN/workspace",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/markdownviewer-icon.svg",
  "/markdownviewer-icon-192.png",
  "/markdownviewer-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => cache.addAll(appShellUrls))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/workspace"));
    return;
  }

  if (isCacheableStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

function isCacheableStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|woff2?|png|jpg|jpeg|svg|ico|webmanifest)$/.test(pathname)
  );
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (await cache.match(request)) ?? (await cache.match(fallbackUrl)) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}
