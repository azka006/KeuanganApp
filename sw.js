const CACHE_NAME = 'keuangan-v1.0';
const urlsToCache = [
  '/',
  'index.html',
  'script.js',
  'style.css',
  'icon-192.png',
  'icon-512.png',
  'logo.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single+Ink:wght@100..900&family=Caprasimo&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'theme-macha-harmony.css',
  'theme-lemon-soda.css',
  'theme-coffee.css',
  'theme-twilightBloom.css',
  'theme-sweet-life-orange.css',
  'theme-workspace.css',
  'theme-princess.css',
  'theme-seaSza.css',
  'theme-berryGarden.css',
  'theme-china.css',
  'theme-nature.css',
  'theme-botanic.css',
  'theme-lavender.css',
  'theme-candy.css',
  'theme-playground.css',
  'theme-orange-tree.css',
  'theme-apple.css',
  'theme-hello-kitty.css',
  'theme-macha-strawberry.css',
  'theme-lanaDelRey.css',
  'theme-switzerland.css',
  'theme-daylight.css',
  'theme-sunset-copenhagen.css',
  'theme-macha-yuzu.css',
  'theme-green-lavender.css',
  'theme-fun-park.css',
  'theme-sunshine.css',
  'theme-sweet-candy.css'
  
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});