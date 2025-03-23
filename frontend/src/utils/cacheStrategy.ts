interface CacheConfig {
  name: string;
  maxAge: number;
  maxItems?: number;
}

class CacheManager {
  private caches: Map<string, Cache> = new Map();

  async initCache(config: CacheConfig) {
    const cache = await caches.open(config.name);
    this.caches.set(config.name, cache);
    return cache;
  }

  async get(cacheName: string, key: string) {
    const cache = this.caches.get(cacheName);
    if (!cache) return null;

    const response = await cache.match(key);
    if (!response) return null;

    const data = await response.json();
    if (this.isExpired(data)) {
      await cache.delete(key);
      return null;
    }

    return data.value;
  }

  async set(cacheName: string, key: string, value: any, maxAge: number) {
    const cache = this.caches.get(cacheName);
    if (!cache) return;

    const data = {
      value,
      timestamp: Date.now(),
      maxAge
    };

    await cache.put(
      key,
      new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
  }

  private isExpired(data: { timestamp: number; maxAge: number }) {
    return Date.now() - data.timestamp > data.maxAge;
  }

  async clearCache(cacheName: string) {
    const cache = this.caches.get(cacheName);
    if (cache) {
      await cache.keys().then(keys => {
        keys.forEach(key => cache.delete(key));
      });
    }
  }
}

export const cacheManager = new CacheManager();

// Initialize caches
export const initializeCaches = async () => {
  await cacheManager.initCache({
    name: 'api-cache',
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxItems: 100
  });

  await cacheManager.initCache({
    name: 'static-cache',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxItems: 50
  });
}; 