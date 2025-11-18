/**
 * Rate Limiting Middleware
 * Uses Upstash Redis for distributed rate limiting
 */

const { redis } = require('../config/redis');
const { RateLimitError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.keyPrefix - Redis key prefix
 * @returns {Function} Express middleware
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute default
    max = 60, // 60 requests per minute default
    keyPrefix = 'ratelimit',
  } = options;

  return async (req, res, next) => {
    try {
      // Generate key based on IP address or user ID
      const identifier = req.user?.id || req.ip;
      const key = `${keyPrefix}:${identifier}`;

      // Get current count
      const current = await redis.incr(key);

      // Set expiry on first request
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      // Check if limit exceeded
      if (current > max) {
        logger.warn('Rate limit exceeded', { identifier, key, current, max });
        throw new RateLimitError('Too many requests. Please try again later.');
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));

      next();
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      // If Redis fails, allow request but log error
      logger.error('Rate limiter error', { error: error.message });
      next();
    }
  };
}

/**
 * Strict rate limiter for auth endpoints
 * 5 requests per 15 minutes
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyPrefix: 'ratelimit:auth',
});

/**
 * Standard rate limiter for API endpoints
 * 100 requests per minute
 */
const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyPrefix: 'ratelimit:api',
});

/**
 * Aggressive rate limiter for expensive operations
 * 10 requests per minute
 */
const expensiveRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  keyPrefix: 'ratelimit:expensive',
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  expensiveRateLimiter,
};
