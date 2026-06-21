/* ============================================================
   WordPop — Service Worker (offline support)
   Caches the whole app so it works with NO internet after the
   first visit. Bump VERSION whenever files change (keep it in
   step with the ?v=… in index.html).
   ============================================================ */

const VERSION = "wordpop-v1.0";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css?v=1.0",
  "./js/words-all.js?v=1.0",
  "./js/data.js?v=1.0",
  "./js/art.js?v=1.0",
  "./js/themes.js?v=1.0",
  "./js/audio.js?v=1.0",
  "./js/store.js?v=1.0",
  "./js/quiz.js?v=1.0",
  "./js/app.js?v=1.0",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/apple-touch-icon.png",
  "./manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // page loads: try network, fall back to cached app shell when offline
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  // everything else: cache-first, then network (and runtime-cache it, incl. fonts)
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
