const CACHE_NAME = 'magic-castle-v18';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './assets/icons/app-icon-192.png',
  './assets/icons/app-icon-512.png',
  './assets/icons/app-icon.svg',
  './assets/brand/magic-castle-logo.svg',
  './assets/maps/castle-adventure-map.svg',
  './assets/oc-english/character.js',
  './assets/oc-english/wardrobe.js',
  './assets/oc-english/wardrobe-data.js',
  './assets/vocabulary/red.svg',
  './assets/vocabulary/one.svg',
  './assets/vocabulary/two.svg',
  './assets/vocabulary/three.svg',
  './assets/vocabulary/yellow.svg',
  './assets/vocabulary/blue.svg',
  './assets/vocabulary/cat.svg',
  './assets/vocabulary/dog.svg',
  './assets/vocabulary/rabbit.svg',
  './assets/vocabulary/jump.svg',
  './assets/vocabulary/clap.svg',
  './assets/vocabulary/dance.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (!response.ok) return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    }))
  );
});
