const express = require("express");
const cors = require("cors");
const rateLimiter = require("./middlewares/rateLimiter");
const morgan = require("morgan");

const app = express();

// Security & CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging middleware
app.use(morgan("combined"));

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = require("crypto").randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
});

// Rate limiter
app.use(rateLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), requestId: req.id });
});

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${req.id}] Error:`, err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    requestId: req.id,
    environment: process.env.NODE_ENV,
  });
});

module.exports = app;