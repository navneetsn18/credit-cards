// Browser cache utility for credit card data
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class BrowserCache {
  private static instance: BrowserCache;
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private readonly DEFAULT_TTL = 1 * 60 * 1000; // 1 minutes

  static getInstance(): BrowserCache {
    if (!BrowserCache.instance) {
      BrowserCache.instance = new BrowserCache();
    }
    return BrowserCache.instance;
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };

    this.cache.set(key, item);

    // Also store in localStorage for persistence across sessions
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn("Failed to store in localStorage:", error);
    }
  }

  get<T>(key: string): T | null {
    const now = Date.now();

    // Check memory cache first
    let item = this.cache.get(key);

    // If not in memory, try localStorage
    if (!item) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          // Restore to memory cache
          if (item) {
            this.cache.set(key, item);
          }
        }
      } catch (error) {
        console.warn("Failed to read from localStorage:", error);
      }
    }

    if (!item) {
      return null;
    }

    // Check if expired
    if (now > item.expiresAt) {
      this.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error);
    }
  }

  clear(): void {
    this.cache.clear();
    try {
      // Clear all cache items from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("cache_")) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const items = Array.from(this.cache.entries());
    const valid = items.filter(([, item]) => now <= item.expiresAt);
    const expired = items.filter(([, item]) => now > item.expiresAt);

    return {
      total: items.length,
      valid: valid.length,
      expired: expired.length,
      keys: valid.map(([key]) => key),
    };
  }
}

export const browserCache = BrowserCache.getInstance();

// Cache keys
export const CACHE_KEYS = {
  CARDS: "cards",
  CARD_NAMES: "card_names",
  PERMISSIONS: "permissions",
  VISITORS: "visitors",
} as const;

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  CARDS: 1 * 60 * 1000, // 1 minute - faster updates for multi-user scenarios
  CARD_NAMES: 5 * 60 * 1000, // 5 minutes - rarely changes but faster than before
  PERMISSIONS: 30 * 1000, // 30 seconds - reasonable refresh
  VISITORS: 1 * 60 * 1000, // 1 minute - frequently updated
} as const;
