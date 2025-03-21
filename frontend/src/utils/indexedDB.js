const DB_NAME = 'GrainTradingDB';
const DB_VERSION = 1;

const STORES = {
  GRAINS: 'grains',
  PURCHASES: 'purchases',
  SALES: 'sales',
  INVENTORY: 'inventory',
  PENDING_TRANSACTIONS: 'pendingTransactions'
};

class IndexedDBService {
  constructor() {
    this.db = null;
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create stores with indexes
        if (!db.objectStoreNames.contains(STORES.GRAINS)) {
          db.createObjectStore(STORES.GRAINS, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(STORES.PURCHASES)) {
          const purchaseStore = db.createObjectStore(STORES.PURCHASES, { keyPath: 'id' });
          purchaseStore.createIndex('date', 'date');
          purchaseStore.createIndex('grainId', 'grainId');
        }

        if (!db.objectStoreNames.contains(STORES.SALES)) {
          const salesStore = db.createObjectStore(STORES.SALES, { keyPath: 'id' });
          salesStore.createIndex('date', 'date');
          salesStore.createIndex('grainId', 'grainId');
        }

        if (!db.objectStoreNames.contains(STORES.INVENTORY)) {
          const inventoryStore = db.createObjectStore(STORES.INVENTORY, { keyPath: 'id' });
          inventoryStore.createIndex('grainId', 'grainId');
        }

        if (!db.objectStoreNames.contains(STORES.PENDING_TRANSACTIONS)) {
          const pendingStore = db.createObjectStore(STORES.PENDING_TRANSACTIONS, { 
            keyPath: 'id',
            autoIncrement: true 
          });
          pendingStore.createIndex('type', 'type');
          pendingStore.createIndex('status', 'status');
        }
      };
    });
  }

  // Generic CRUD operations
  async add(storeName, data) {
    const store = this.db
      .transaction(storeName, 'readwrite')
      .objectStore(storeName);
    return store.add(data);
  }

  async get(storeName, id) {
    const store = this.db
      .transaction(storeName, 'readonly')
      .objectStore(storeName);
    return store.get(id);
  }

  async getAll(storeName) {
    const store = this.db
      .transaction(storeName, 'readonly')
      .objectStore(storeName);
    return store.getAll();
  }

  async update(storeName, data) {
    const store = this.db
      .transaction(storeName, 'readwrite')
      .objectStore(storeName);
    return store.put(data);
  }

  async delete(storeName, id) {
    const store = this.db
      .transaction(storeName, 'readwrite')
      .objectStore(storeName);
    return store.delete(id);
  }

  // Specific business operations
  async addPendingTransaction(transaction) {
    return this.add(STORES.PENDING_TRANSACTIONS, {
      ...transaction,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
  }

  async syncPendingTransactions() {
    const pendingStore = this.db
      .transaction(STORES.PENDING_TRANSACTIONS, 'readwrite')
      .objectStore(STORES.PENDING_TRANSACTIONS);
    
    const pending = await pendingStore.index('status').getAll('pending');
    
    for (const transaction of pending) {
      try {
        // Attempt to sync with server
        const response = await fetch(`/api/${transaction.type}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transaction.data)
        });

        if (response.ok) {
          await pendingStore.put({
            ...transaction,
            status: 'completed',
            syncedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Sync failed for transaction:', transaction.id);
      }
    }
  }
}

export const dbService = new IndexedDBService(); 