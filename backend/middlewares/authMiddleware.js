const redis = require("../config/redis");
const jwt = require("jsonwebtoken");

const CACHE_EXPIRY = 3600; // 1 hour

/**
 * Enhanced Authentication Middleware with Redis Caching
 * - Validates JWT tokens
 * - Caches token verification results
 * - Supports token blacklisting for logout
 */

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const cacheKey = `auth:token:${token.substring(0, 20)}`;

    // Check cache first
    let cachedUser = await redis.get(cacheKey);

    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
      return next();
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

    // Check if token is blacklisted
    const blacklistKey = `auth:blacklist:${token}`;
    const isBlacklisted = await redis.get(blacklistKey);

    if (isBlacklisted) {
      return res.status(401).json({ error: "Token has been revoked" });
    }

    // Cache the token verification
    await redis.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(decoded));

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    res.status(401).json({ error: "Invalid token" });
  }
};