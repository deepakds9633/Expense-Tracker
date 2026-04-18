/* ═══════════════════════════════════════════════
   SERVICE WORKER — Expense Tracker PWA
   Strategy: Cache-First for assets, Network-First for API
═══════════════════════════════════════════════ */

const CACHE_NAME = 'expense-tracker-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

/* ── Install: Cache static assets ──────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ── Activate: Clean old caches ────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: Smart caching strategy ─────────── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // API calls → Network First (always try live data)
  if (url.pathname.startsWith('/api') || url.hostname.includes('onrender.com')) {
    event.respondWith(
      fetch(request)
        .then((res) => res)
        .catch(() => new Response(JSON.stringify({ message: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }))
    );
    return;
  }

  // Google Fonts → Cache First
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // App Shell (JS/CSS/HTML) → Cache First, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return res;
      }).catch(() => {
        // Offline fallback → serve index.html for navigation
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
