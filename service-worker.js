const CACHE_NAME = 'magic-castle-__BUILD_ID__';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './styles/screens/adventure-map.css',
  './app.js',
  './features/map-route.js',
  './features/storage.js',
  './features/achievements.js',
  './features/theme-catalog.js',
  './features/content-catalog.js',
  './features/default-content.js',
  './manifest.webmanifest',
  './assets/icons/app-icon-192.png',
  './assets/icons/app-icon-512.png',
  './assets/icons/app-icon.svg',
  './assets/branding/magic-castle/magic-castle-logo.svg',
  './assets/scenes/adventure-map/castle-adventure-map.svg',
  './assets/scenes/adventure-map/magic-castle-adventure-map.jpeg',
  './assets/scenes/adventure-map/magic-castle-adventure-map-mobile.jpeg',
  './assets/ui/expedition-map-button.svg',
  './assets/ui/cloud-label.svg',
  './assets/audio/magic-house/background-loop.wav',
  './assets/characters/luna/character.js',
  './assets/characters/luna/wardrobe.js',
  './assets/characters/luna/wardrobe-data.js',
  './assets/learning/vocabulary/red.svg',
  './assets/learning/vocabulary/one.svg',
  './assets/learning/vocabulary/two.svg',
  './assets/learning/vocabulary/three.svg',
  './assets/learning/vocabulary/yellow.svg',
  './assets/learning/vocabulary/blue.svg',
  './assets/learning/vocabulary/cat.svg',
  './assets/learning/vocabulary/dog.svg',
  './assets/learning/vocabulary/rabbit.svg',
  './assets/learning/vocabulary/jump.svg',
  './assets/learning/vocabulary/clap.svg',
  './assets/learning/vocabulary/dance.svg'
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

  // CSS and JS use network-first so visual fixes are never held behind an old offline cache.
  if (url.pathname.endsWith('/style.css') || url.pathname.endsWith('/styles/screens/adventure-map.css') || url.pathname.endsWith('/app.js')) {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (!response.ok) return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    }))
  );
});
