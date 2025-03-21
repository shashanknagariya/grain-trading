const CACHE_NAME = 'grain-trading-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/css/main.chunk.css',
  '/static/js/main.chunk.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const API_CACHE_NAME = 'api-cache-v1';
const API_URLS = ['/api/grains', '/api/dashboard'];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch Event Handler
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

// Background Sync Handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'grain-trading-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  const db = await openDB();
  const tx = db.transaction('sync-queue', 'readwrite');
  const store = tx.objectStore('sync-queue');
  const items = await store.getAll();

  const syncPromises = items.map(async (item) => {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': item.headers?.Authorization
        },
        body: JSON.stringify(item.data)
      });

      if (response.ok) {
        await store.delete(item.id);
        // Notify the client about successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_COMPLETED',
              payload: {
                id: item.id,
                success: true
              }
            });
          });
        });
      }
    } catch (error) {
      console.error('Sync failed for item:', item.id, error);
    }
  });

  await Promise.all(syncPromises);
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data?.url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

// Periodic Background Sync
const PERIODIC_SYNC_TAG = 'grain-trading-periodic-sync';

self.addEventListener('periodicsync', async (event) => {
  if (event.tag === PERIODIC_SYNC_TAG) {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch('/api/updates/check');
    const updates = await response.json();

    if (updates.hasUpdates) {
      await self.registration.showNotification('New Updates Available', {
        body: updates.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'update-notification',
        actions: [
          { action: 'view', title: 'View Updates' }
        ]
      });
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
} 