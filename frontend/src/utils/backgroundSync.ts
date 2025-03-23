// Add type declaration for sync property
interface SyncManager {
  register(tag: string): Promise<void>;
}

interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync: SyncManager;
}

interface SyncItem {
  id: string;
  url: string;
  method: string;
  data: any;
  timestamp: number;
}

class BackgroundSync {
  private readonly DB_NAME = 'background-sync-store';
  private readonly STORE_NAME = 'sync-items';
  private readonly SYNC_TAG = 'sync-items';

  constructor() {
    this.initDB();
  }

  private async initDB() {
    try {
      await this.openDB();
    } catch (error) {
      console.error('Failed to initialize background sync DB:', error);
    }
  }

  async registerSync() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready as ExtendedServiceWorkerRegistration;
        if ('sync' in registration) {
          await registration.sync.register(this.SYNC_TAG);
          console.log('Background sync registered');
        }
      } catch (err) {
        console.error('Background sync registration failed:', err);
      }
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
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

  async queueItem(syncItem: Omit<SyncItem, 'id' | 'timestamp'>) {
    const db = await this.openDB();
    const transaction = db.transaction(this.STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(this.STORE_NAME);

    const item: SyncItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...syncItem
    };

    await new Promise<void>((resolve, reject) => {
      const request = objectStore.add(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    await this.registerSync();
  }

  async processQueue() {
    const db = await this.openDB();
    const transaction = db.transaction(this.STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(this.STORE_NAME);

    const items: SyncItem[] = await new Promise((resolve, reject) => {
      const request = objectStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const item of items) {
      try {
        await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item.data)
        });

        // Remove processed item
        await new Promise<void>((resolve, reject) => {
          const request = objectStore.delete(item.id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('Failed to process sync item:', error);
      }
    }
  }
}

export const backgroundSync = new BackgroundSync(); 