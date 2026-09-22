/* GarageBook service worker — app shell + OCR engine. Logs stay in IndexedDB. */
const CACHE = "garagebook-v5";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const files = [
        "./",
        "./manifest.webmanifest",
        "./favicon.svg",
        "./icon-192.png",
        "./icon-512.png",
        "./icon-512-maskable.png",
        "./apple-touch-icon.png",
      ].map((p) => new URL(p, self.registration.scope).href);
      await cache.addAll(files).catch(() => undefined);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

function shouldBypass(url) {
  const u = new URL(url);
  if (u.pathname.startsWith("/__grok/")) return true;
  if (u.pathname.startsWith("/api/")) return true;
  if (u.hostname === "grok.com" || u.hostname.endsWith(".grok.com")) return true;
  if (u.hostname.includes("fueleconomy.gov")) return true;
  if (u.hostname.includes("nhtsa.gov") || u.hostname.includes("api.nhtsa")) return true;
  return false;
}

function isOcrCdn(url) {
  const u = new URL(url);
  return u.hostname.includes("jsdelivr.net") && u.pathname.includes("tesseract");
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = req.url;
  if (shouldBypass(url)) return;

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  if (isOcrCdn(url)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  const dest = req.destination;
  if (["style", "script", "image", "font", "worker"].includes(dest) || url.includes("/assets/")) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  event.respondWith(networkFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    const copy = res.clone();
    const cache = await caches.open(CACHE);
    await cache.put(req, copy);
  }
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok) void cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req, { cache: "no-store" });
    if (res.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    if (req.mode === "navigate") {
      const home = await caches.match(new URL("./", self.registration.scope).href);
      if (home) return home;
    }
    return new Response("GarageBook is offline and this page is not cached yet.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
