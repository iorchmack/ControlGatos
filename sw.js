const CACHE_NAME = 'gastos-pwa-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna el cache o hace fetch a la red, ideal para GitHub Pages
      return response || fetch(event.request);
    })
  );
});
