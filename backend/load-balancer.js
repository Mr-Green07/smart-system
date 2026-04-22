const http = require("http");
const httpProxy = require("http-proxy-agent");
const HTTPS = require("https");
require("dotenv").config();

/**
 * Advanced Load Balancer with Health Checks, Sticky Sessions, and Failure Recovery
 */

class LoadBalancer {
  constructor() {
    this.servers = [
      {
        url: process.env.SERVER_1 || "http://localhost:3001",
        healthy: true,
        weight: 1,
        requestCount: 0,
        errorCount: 0,
      },
      {
        url: process.env.SERVER_2 || "http://localhost:3002",
        healthy: true,
        weight: 1,
        requestCount: 0,
        errorCount: 0,
      },
    ];

    this.currentIndex = 0;
    this.sessionMap = new Map(); // For sticky sessions
    this.healthCheckInterval = 5000; // Check health every 5 seconds

    this.startHealthChecks();
  }

  /**
   * Weighted Round-Robin Load Balancing Algorithm
   */
  getNextServer() {
    const healthyServers = this.servers.filter((s) => s.healthy);

    if (healthyServers.length === 0) {
      console.error("❌ No healthy servers available!");
      // Fallback: use all servers even if unhealthy
      return this.servers[this.currentIndex % this.servers.length];
    }

    // Weighted round-robin
    let totalWeight = healthyServers.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;

    for (let server of healthyServers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }

    return healthyServers[0];
  }

  /**
   * Sticky Session - Route requests from same client to same server
   */
  getServerForSession(clientId) {
    if (this.sessionMap.has(clientId)) {
      const server = this.sessionMap.get(clientId);
      if (server.healthy) {
        return server;
      }
      this.sessionMap.delete(clientId);
    }

    const server = this.getNextServer();
    this.sessionMap.set(clientId, server);
    return server;
  }

  /**
   * Health Check for all servers
   */
  async startHealthChecks() {
    setInterval(async () => {
      for (let server of this.servers) {
        await this.checkServerHealth(server);
      }
    }, this.healthCheckInterval);
  }

  /**
   * Check individual server health
   */
  async checkServerHealth(server) {
    return new Promise((resolve) => {
      const request = http.request(
        `${server.url}/health`,
        { method: "GET", timeout: 3000 },
        (res) => {
          if (res.statusCode === 200) {
            if (!server.healthy) {
              console.log(`✅ Server recovered: ${server.url}`);
            }
            server.healthy = true;
            server.errorCount = 0;
          } else {
            server.healthy = false;
          }
          resolve();
        }
      );

      request.on("error", () => {
        server.errorCount++;
        if (server.errorCount > 2) {
          if (server.healthy) {
            console.warn(`⚠️ Server marked unhealthy: ${server.url}`);
          }
          server.healthy = false;
        }
        resolve();
      });

      request.on("timeout", () => {
        request.destroy();
        server.healthy = false;
        resolve();
      });

      request.end();
    });
  }

  /**
   * Handle proxy request with retry logic and error handling
   */
  handleRequest(req, res) {
    let retryCount = 0;
    const maxRetries = 2;

    const attemptRequest = () => {
      const server = this.getNextServer();
      if (!server) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: "All servers unavailable" }));
        return;
      }

      server.requestCount++;

      const proxyReq = http.request(
        server.url + req.url,
        {
          method: req.method,
          headers: {
            ...req.headers,
            "X-Forwarded-For": req.ip,
            "X-Forwarded-Proto": req.protocol,
            "X-Server": server.url,
          },
          timeout: 30000,
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        }
      );

      proxyReq.on("error", (err) => {
        console.error(`❌ Proxy error from ${server.url}:`, err.message);
        server.errorCount++;
        if (server.errorCount > 3) {
          server.healthy = false;
        }

        // Retry with different server
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`🔄 Retrying request (attempt ${retryCount}/${maxRetries})`);
          attemptRequest();
        } else {
          if (!res.headersSent) {
            res.writeHead(502, { "Content-Type": "application/json" });
          }
          res.end(
            JSON.stringify({
              error: "Backend server unavailable",
              message: err.message,
            })
          );
        }
      });

      proxyReq.on("timeout", () => {
        proxyReq.destroy();
        console.warn(`⏱️ Request timeout from ${server.url}`);

        if (retryCount < maxRetries) {
          retryCount++;
          attemptRequest();
        } else {
          if (!res.headersSent) {
            res.writeHead(504, { "Content-Type": "application/json" });
          }
          res.end(
            JSON.stringify({
              error: "Gateway timeout",
              message: "Request took too long to complete",
            })
          );
        }
      });

      req.pipe(proxyReq);
    };

    attemptRequest();
  }

  /**
   * Start the load balancer server
   */
  start(port = 4000) {
    const server = http.createServer((req, res) => {
      // CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      // Health check endpoint on load balancer
      if (req.url === "/health" && req.method === "GET") {
        return res.end(JSON.stringify({ status: "healthy" }));
      }

      // Status endpoint to check server health
      if (req.url === "/status" && req.method === "GET") {
        return res.end(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            servers: this.servers.map((s) => ({
              url: s.url,
              healthy: s.healthy,
              weight: s.weight,
              requestCount: s.requestCount,
              errorCount: s.errorCount,
            })),
          })
        );
      }

      this.handleRequest(req, res);
    });

    server.listen(port, () => {
      console.log(`\n🚀 Load Balancer started on port ${port}`);
      console.log(`📊 Backend servers:`);
      this.servers.forEach((s) => {
        console.log(`  - ${s.url} (weight: ${s.weight})`);
      });
      console.log(`\n📈 Status endpoint: http://localhost:${port}/status\n`);
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down load balancer...");
      server.close(() => {
        console.log("✅ Load balancer shut down");
        process.exit(0);
      });
    });
  }
}

// Initialize and start load balancer
const lb = new LoadBalancer();
lb.start(parseInt(process.env.LB_PORT) || 4000);

module.exports = LoadBalancer;
