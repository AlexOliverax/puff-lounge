/* Service Worker inteligente do Puff & Lounge (v3).
 * - Network-First para HTML, JS e manifesto (garante que todo deploy entre no ar na hora).
 * - Fallback em cache para funcionamento offline (Enciclopédia, Harmonização, Umidor e último estado).
 * - Cache leve para ícones, fontes e blocos do mapa OpenStreetMap visitados. */

const SHELL_CACHE = 'pl-shell-v3';
const ASSET_CACHE = 'pl-assets-v3';
const TILE_CACHE = 'pl-tiles-v3';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json?v=3',
  '/icon-192.png?v=3',
  '/icon-512.png?v=3',
  '/apple-touch-icon.png?v=3',
  '/leaflet.css',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![SHELL_CACHE, ASSET_CACHE, TILE_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1) Blocos de mapa OpenStreetMap: Stale-While-Revalidate para navegação fluida
  if (url.hostname === 'tile.openstreetmap.org') {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const networkPromise = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              cache.put(req, res.clone());
            }
            return res;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  // Ignora chamadas de API externas dinâmicas (Overpass / Nominatim) para vir sempre ao vivo
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2) Navegação SPA / HTML / Bundles JS: Network-First com fallback offline
  const isNavigation =
    req.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.json');

  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 3) Fontes, imagens e CSS estáticos: Cache-First com atualização em background
  event.respondWith(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const fetched = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
