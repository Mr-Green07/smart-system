const redis = require("../config/redis");

/**
 * Caching Utility for frequently accessed data
 * Implements cache invalidation patterns and TTL management
 */

class CacheManager {
  /**
   * Generate cache key with namespace
   */
  static generateKey(namespace, identifier) {
    return `${namespace}:${identifier}`;
  }

  /**
   * Get value from cache
   */
  static async get(namespace, identifier) {
    try {
      const key = this.generateKey(namespace, identifier);
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("❌ Cache get error:", error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set(namespace, identifier, value, ttlSeconds = 3600) {
    try {
      const key = this.generateKey(namespace, identifier);
      await redis.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("❌ Cache set error:", error);
      return false;
    }
  }

  /**
   * Delete specific cache entry
   */
  static async delete(namespace, identifier) {
    try {
      const key = this.generateKey(namespace, identifier);
      await redis.del(key);
      return true;
    } catch (error) {
      console.error("❌ Cache delete error:", error);
      return false;
    }
  }

  /**
   * Clear all cache entries with specific namespace
   */
  static async clearNamespace(namespace) {
    try {
      const pattern = `${namespace}:*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(keys);
      }

      return keys.length;
    } catch (error) {
      console.error("❌ Cache clear error:", error);
      return 0;
    }
  }

  /**
   * Get or set - fetches from cache, or executes function and caches result
   */
  static async getOrSet(namespace, identifier, fetcher, ttlSeconds = 3600) {
    try {
      // Try to get from cache
      let cached = await this.get(namespace, identifier);

      if (cached !== null) {
        console.log(`✅ Cache hit: ${namespace}:${identifier}`);
        return cached;
      }

      // Cache miss - execute fetcher function
      console.log(`📤 Cache miss: ${namespace}:${identifier}`);
      const value = await fetcher();

      // Store in cache
      await this.set(namespace, identifier, value, ttlSeconds);

      return value;
    } catch (error) {
      console.error("❌ Cache getOrSet error:", error);
      // On error, just return the value from fetcher
      return await fetcher();
    }
  }

  /**
   * Batch get multiple keys
   */
  static async mget(namespace, identifiers) {
    try {
      const keys = identifiers.map((id) => this.generateKey(namespace, id));
      const values = await redis.mget(keys);
      return values.map((v) => (v ? JSON.parse(v) : null));
    } catch (error) {
      console.error("❌ Cache mget error:", error);
      return identifiers.map(() => null);
    }
  }

  /**
   * Increment counter (useful for analytics, rate limiting)
   */
  static async increment(namespace, identifier, amount = 1, ttlSeconds = 3600) {
    try {
      const key = this.generateKey(namespace, identifier);
      const value = await redis.incr(key, amount);

      // Set TTL on first increment
      if (value === 1) {
        await redis.expire(key, ttlSeconds);
      }

      return value;
    } catch (error) {
      console.error("❌ Cache increment error:", error);
      return null;
    }
  }

  /**
   * Add item to set (useful for unique items, tags)
   */
  static async addToSet(namespace, identifier, ...items) {
    try {
      const key = this.generateKey(namespace, identifier);
      await redis.sAdd(key, items);
      return true;
    } catch (error) {
      console.error("❌ Cache addToSet error:", error);
      return false;
    }
  }

  /**
   * Get all items from set
   */
  static async getSet(namespace, identifier) {
    try {
      const key = this.generateKey(namespace, identifier);
      return await redis.sMembers(key);
    } catch (error) {
      console.error("❌ Cache getSet error:", error);
      return [];
    }
  }

  /**
   * Real-time cache statistics
   */
  static async getStats() {
    try {
      const info = await redis.info("stats");
      const dbSize = await redis.dbSize();

      return {
        connected: true,
        totalKeys: dbSize,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Cache stats error:", error);
      return { connected: false, error: error.message };
    }
  }
}

module.exports = CacheManager;
