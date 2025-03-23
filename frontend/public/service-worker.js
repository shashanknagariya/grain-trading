const CACHE_NAME = 'grain-trading-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Don't try to handle non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        // Return a fallback response for failed fetches
        return new Response('Offline content not available');
      });
    })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
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