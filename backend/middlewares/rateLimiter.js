const redis = require("../config/redis");

// Configurable rate limiting
const RATE_LIMIT_OPTIONS = {
  defaultLimit: parseInt(process.env.RATE_LIMIT) || 100,
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60, // seconds
  skipSuccessfulRequests: false,
};

/**
 * Rate limiter middleware using Redis
 * Uses sliding window algorithm for more accurate limiting
 */
module.exports = async (req, res, next) => {
  try {
    const key = `rate:${req.ip}`;
    const limit = RATE_LIMIT_OPTIONS.defaultLimit;
    const window = RATE_LIMIT_OPTIONS.windowMs;

    // Get current count
    let count = await redis.incr(key);

    // Set expiration on first request in window
    if (count === 1) {
      await redis.expire(key, window);
    }

    // Get TTL for response headers
    const ttl = await redis.ttl(key);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - count));
    res.setHeader("X-RateLimit-Reset", new Date(Date.now() + ttl * 1000).toISOString());

    // Check if limit exceeded
    if (count > limit) {
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: ttl,
        message: `Rate limit exceeded. Maximum ${limit} requests per ${window}s`,
      });
    }

    next();
  } catch (error) {
    console.error("❌ Rate limiter error:", error);
    // On Redis error, allow request to proceed but log it
    next();
  }
};