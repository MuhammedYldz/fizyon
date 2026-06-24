/* App-shell cache. Network-first for app files (fresh during dev), cache fallback offline. */
const CACHE = 'fizyon-v7';
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

/* ---- Web Push: reminders sent by supabase/functions/send-reminders (VAPID) ---- */
self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { body: e.data ? e.data.text() : '' }; }
  const title = data.title || 'Fizyon';
  const options = {
    body: data.body || 'Egzersiz zamanı geldi 💪',
    icon: data.icon || './assets/logo.svg',
    badge: './assets/logo.svg',
    tag: data.tag || 'fizyon-reminder',
    data: { url: data.url || './' },
    vibrate: [80, 40, 80]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    if (clients.openWindow) return clients.openWindow(target);
  }));
});
