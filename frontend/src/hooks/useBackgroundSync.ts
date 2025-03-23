import { useCallback } from 'react';

interface SyncItem {
  id: string;
  url: string;
  method: string;
  data: any;
}

interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync: SyncManager;
}

export const useBackgroundSync = () => {
  const queueSync = useCallback(async (item: Omit<SyncItem, 'id'>) => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready as ExtendedServiceWorkerRegistration;
      if ('sync' in registration) {
        const db = await openSyncDB();
        const syncItem: SyncItem = {
          id: crypto.randomUUID(),
          ...item
        };

        await addToSyncStore(db, syncItem);
        await registration.sync.register('sync-items');
      }
    } catch (error) {
      console.error('Failed to queue sync:', error);
    }
  }, []);

  return { queueSync };
};

async function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sync-store', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('sync-items')) {
        db.createObjectStore('sync-items', { keyPath: 'id' });
      }
    };
  });
}

async function addToSyncStore(db: IDBDatabase, item: SyncItem): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('sync-items', 'readwrite');
    const store = transaction.objectStore('sync-items');
    const request = store.add(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
} 