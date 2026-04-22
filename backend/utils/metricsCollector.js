const redis = require("../config/redis");

/**
 * Application Metrics and Monitoring
 * Tracks performance metrics, request counts, and system health
 */

class MetricsCollector {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      startTime: Date.now(),
      endpoints: {},
    };
  }

  /**
   * Middleware to track metrics
   */
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Track original send
      const originalSend = res.send;
      res.send = function (data) {
        const duration = Date.now() - startTime;
        const endpoint = `${req.method} ${req.path}`;

        this.recordMetric(endpoint, res.statusCode, duration);

        res.send = originalSend;
        return res.send(data);
      }.bind(this);

      next();
    };
  }

  /**
   * Record metric for endpoint
   */
  recordMetric(endpoint, statusCode, duration) {
    this.metrics.totalRequests++;

    if (statusCode >= 400) {
      this.metrics.totalErrors++;
    }

    if (!this.metrics.endpoints[endpoint]) {
      this.metrics.endpoints[endpoint] = {
        count: 0,
        errors: 0,
        avgDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
      };
    }

    const endpointMetrics = this.metrics.endpoints[endpoint];
    endpointMetrics.count++;

    if (statusCode >= 400) {
      endpointMetrics.errors++;
    }

    // Update average duration
    endpointMetrics.avgDuration =
      (endpointMetrics.avgDuration * (endpointMetrics.count - 1) + duration) /
      endpointMetrics.count;

    endpointMetrics.minDuration = Math.min(endpointMetrics.minDuration, duration);
    endpointMetrics.maxDuration = Math.max(endpointMetrics.maxDuration, duration);

    // Store in Redis for persistence and analysis
    this.storeMetricToRedis(endpoint, statusCode, duration);
  }

  /**
   * Store metrics in Redis for analysis
   */
  async storeMetricToRedis(endpoint, statusCode, duration) {
    try {
      const key = `metrics:${endpoint}:${new Date().toISOString().split("T")[0]}`;
      const metric = {
        timestamp: new Date().toISOString(),
        statusCode,
        duration,
      };

      await redis.lPush(key, JSON.stringify(metric));
      await redis.expire(key, 86400 * 7); // Keep for 7 days
    } catch (error) {
      console.error("❌ Error storing metrics:", error);
    }
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const errorRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.totalErrors / this.metrics.totalRequests) * 100
        : 0;

    return {
      ...this.metrics,
      uptime: Math.floor(uptime / 1000),
      errorRate: errorRate.toFixed(2) + "%",
      avgResponseTime:
        Object.values(this.metrics.endpoints).length > 0
          ? (
              Object.values(this.metrics.endpoints).reduce(
                (sum, ep) => sum + ep.avgDuration,
                0
              ) / Object.values(this.metrics.endpoints).length
            ).toFixed(2) + "ms"
          : "N/A",
    };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      startTime: Date.now(),
      endpoints: {},
    };
  }
}

module.exports = MetricsCollector;
