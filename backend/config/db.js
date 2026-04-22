const { Pool } = require("pg");
require("dotenv").config();

// Connection pool configuration for better performance
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "salesDB",
  password: process.env.DB_PASSWORD || "Dora",
  port: process.env.DB_PORT || 5432,
  max: parseInt(process.env.DB_POOL_SIZE) || 20, // Connection pooling
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Error handling for the pool
pool.on("error", (err) => {
  console.error("🔥 Unexpected error on idle client", err);
});

pool.on("connect", () => {
  console.log("✅ New database connection established");
});

// Test connection
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful:", res.rows[0]);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
})();

module.exports = pool;