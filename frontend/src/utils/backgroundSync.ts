interface SyncQueueItem {
  id: string;
  url: string;
  method: string;
  data: any;
  timestamp: number;
  retries: number;
}

class BackgroundSync {
  private readonly SYNC_TAG = 'grain-trading-sync';
  private readonly MAX_RETRIES = 5;
  private readonly DB_NAME = 'background-sync-store';
  private readonly STORE_NAME = 'sync-queue';

  async registerSync() {
    if ('serviceWorker' in navigator && 'sync' in window.registration) {
      try {
        await window.registration.sync.register(this.SYNC_TAG);
        console.log('Background sync registered');
      } catch (err) {
        console.error('Background sync registration failed:', err);
      }
    }
  }

  async addToSyncQueue(request: { url: string; method: string; data: any }) {
    const db = await this.openDB();
    const syncItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      ...request,
      timestamp: Date.now(),
      retries: 0
    };

    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    await tx.store.add(syncItem);
    await this.registerSync();
  }

  async processSyncQueue() {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.store;
    const items = await store.getAll();

    for (const item of items) {
      if (item.retries >= this.MAX_RETRIES) {
        await store.delete(item.id);
        continue;
      }

      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(item.data)
        });

        if (response.ok) {
          await store.delete(item.id);
        } else {
          item.retries++;
          await store.put(item);
        }
      } catch (error) {
        item.retries++;
        await store.put(item);
      }
    }
  }

  private async openDB() {
    return await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }
}

export const backgroundSync = new BackgroundSync(); 