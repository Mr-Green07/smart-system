const redis = require("redis");

// Redis configuration with retry strategy and connection pooling
const client = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

// Event handlers for connection management
client.on("connect", () => {
  console.log("✅ Redis client connected");
});

client.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

client.on("reconnecting", () => {
  console.log("🔄 Redis client reconnecting...");
});

client.on("ready", () => {
  console.log("✅ Redis client ready");
});

// Connect to Redis
(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to Redis successfully");
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Closing Redis connection...");
  await client.quit();
  process.exit(0);
});

module.exports = client;