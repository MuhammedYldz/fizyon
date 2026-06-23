/* App-shell cache. Network-first for app files (fresh during dev), cache fallback offline. */
const CACHE = 'fizyon-v4';
const ASSETS = ['./', './index.html', './css/styles.css', './js/config.js', './js/api.js', './js/data.js', './js/demos.js', './js/app.js', './assets/logo.svg', './manifest.webmanifest', './privacy.html', './terms.html'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  }
});
