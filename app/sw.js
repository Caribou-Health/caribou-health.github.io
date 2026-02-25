/**
 * Caribou Health - Service Worker
 * Handles background push notifications and caching
 */

const CACHE_NAME = 'caribou-v1';
const OFFLINE_URLS = [
  '/app/',
  '/app/index.html',
  '/app/css/styles.css',
  '/app/js/app.js',
  '/app/js/backend-config.js',
  '/app/js/i18n.js',
  '/app/js/reminders.js',
  '/app/assets/logo.png',
  '/app/assets/logo-transparent.png',
  '/app/assets/app-icon-180.png'
];

// Install - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_URLS).catch(err => {
        console.warn('[SW] Some assets could not be cached:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - cache-first strategy for app assets
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return; // Don't cache API calls
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/app/index.html');
        }
      });
    })
  );
});

// Push notification handler
self.addEventListener('push', event => {
  let data = { title: 'Caribou Health', body: 'You have a care plan reminder' };
  
  try {
    data = event.data ? event.data.json() : data;
  } catch (e) {
    data.body = event.data?.text() || data.body;
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/app/assets/app-icon-180.png',
      badge: '/app/assets/app-icon-180.png',
      tag: data.tag || 'caribou-reminder',
      data: data,
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      requireInteraction: false
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/app/') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/app/');
    })
  );
});

// Message handler (from main app)
self.addEventListener('message', event => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: event.data.icon || '/app/assets/app-icon-180.png',
      tag: event.data.tag || 'caribou',
      badge: '/app/assets/app-icon-180.png'
    });
  }
});

// Periodic background sync for scheduled notifications
self.addEventListener('periodicsync', event => {
  if (event.tag === 'caribou-reminders') {
    event.waitUntil(checkAndSendScheduledNotifications());
  }
});

async function checkAndSendScheduledNotifications() {
  // Check stored scheduled notifications
  const clients_list = await clients.matchAll();
  if (clients_list.length > 0) return; // App is open, let it handle notifications
  
  // Would check scheduled notifications from IndexedDB here in production
  // For now, rely on app-side scheduling
}
