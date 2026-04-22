const app = require("./app");
const Logger = require("./utils/logger");
const MetricsCollector = require("./utils/metricsCollector");

const logger = new Logger("Server2");
const metrics = new MetricsCollector();

// Add metrics middleware
app.use(metrics.middleware());

// Metrics endpoint
app.get("/metrics", (req, res) => {
  res.json(metrics.getMetrics());
});

const PORT = process.env.PORT_2 || 3002;

const server = app.listen(PORT, () => {
  logger.info(`Server started successfully on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.warn("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server shutdown complete");
    process.exit(0);
  });
});

process.on("uncaughtException", (error) => {
  logger.errorWithStack("Uncaught Exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise: promise.toString() });
});