/**
 * Redis Configuration
 * Uses ioredis to connect to Upstash Redis
 * Used for caching, sessions, and rate limiting
 */

const Redis = require('ioredis');
const config = require('./env');
const logger = require('../utils/logger');

// Create Redis client
const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    logger.error('Redis reconnecting due to error', { error: err.message });
    return true;
  },
});

// Event handlers
redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

redis.on('error', (err) => {
  logger.error('Redis client error', { error: err.message });
});

redis.on('close', () => {
  logger.warn('Redis client connection closed');
});

/**
 * Cache helper functions
 */
const cache = {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value (parsed from JSON)
   */
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  },

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be stringified)
   * @param {number} ttl - Time to live in seconds (default: 60)
   */
  async set(key, value, ttl = 60) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
    }
  },

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
    }
  },

  /**
   * Delete all keys matching pattern
   * @param {string} pattern - Key pattern (e.g., 'user:*')
   */
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error: error.message });
    }
  },

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error: error.message });
      return false;
    }
  },
};

/**
 * Session helper functions
 */
const session = {
  /**
   * Save user session (JWT mapping to user data)
   * @param {string} userId - User ID
   * @param {Object} data - Session data
   * @param {number} ttl - Time to live in seconds (default: 7 days)
   */
  async save(userId, data, ttl = 7 * 24 * 60 * 60) {
    await cache.set(`session:${userId}`, data, ttl);
  },

  /**
   * Get user session
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Session data
   */
  async get(userId) {
    return await cache.get(`session:${userId}`);
  },

  /**
   * Delete user session
   * @param {string} userId - User ID
   */
  async delete(userId) {
    await cache.del(`session:${userId}`);
  },
};

/**
 * Test Redis connection
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection() {
  try {
    await redis.ping();
    logger.info('Redis connection successful');
    return true;
  } catch (error) {
    logger.error('Redis connection failed', { error: error.message });
    return false;
  }
}

/**
 * Close Redis connection
 */
async function close() {
  await redis.quit();
  logger.info('Redis connection closed');
}

module.exports = {
  redis,
  cache,
  session,
  testConnection,
  close,
};
