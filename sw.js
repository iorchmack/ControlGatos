// Sube el número al publicar cambios
const V = 'finanzas-v4';
const CORE = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  // cache:'reload' evita que el caché HTTP de GitHub Pages (hasta 10 min) entregue archivos viejos
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' }))))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.hostname === 'api.github.com') return;
  if (u.origin === location.origin) {
    // Archivos de la app: primero red (siempre la última versión), caché solo sin conexión
    e.respondWith(
      fetch(u.href, { cache: 'no-cache' })
        .then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })
        .catch(() => caches.match(r, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')))
    );
  } else {
    // Librerías externas (SheetJS): primero caché
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })));
  }
});