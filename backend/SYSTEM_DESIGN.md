# SmartSystem Backend - System Design & Architecture

## Overview
This backend system implements enterprise-grade patterns with load balancing, caching, and monitoring for a scalable sales dashboard application.

---

## 🏗️ Architecture Components

### 1. **Load Balancer** (port 4000)
Advanced HTTP proxy with intelligent request routing

#### Features:
- **Health Checks**: Periodic health verification (5-second intervals)
- **Weighted Round-Robin**: Distribute load based on server weights
- **Sticky Sessions**: Route clients to same server for consistency
- **Automatic Failover**: Retry failed requests on healthy servers
- **Server Recovery**: Automatic detection and recovery of unhealthy servers
- **Request Tracing**: X-Request-ID headers for debugging

#### Key Endpoints:
```
GET /health          - Load balancer health check
GET /status          - View all backend servers status
POST/GET /api/*      - Forward to backend servers
```

#### Configuration:
```env
SERVER_1=http://localhost:3001
SERVER_2=http://localhost:3002
LB_PORT=4000
```

#### How It Works:
1. Receives request on port 4000
2. Selects healthy server using weighted algorithm
3. Forwards request with retry capability
4. Returns response to client
5. Continuously monitors server health

---

### 2. **Backend Servers** (ports 3001-3002)
Two Express.js instances for horizontal scaling

#### Features:
- Health check endpoints
- Metrics collection
- Structured logging
- Request tracking with unique IDs
- CORS support
- Error handling middleware

#### Server Structure:
```
Server 1/2
├── GET /health           - Health status
├── GET /metrics          - Performance metrics
└── /api/*                - Application endpoints
```

---

### 3. **Redis Cache Layer**
In-memory data store for performance optimization

#### Key Uses:
- **Rate Limiting**: Track requests per IP
- **Session Management**: Cache JWT token verification
- **Data Caching**: Store frequently accessed data
- **Token Blacklisting**: Logout token tracking
- **Metrics Storage**: Historical analytics

#### Configuration:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

#### Features:
- Connection pooling with retry strategy
- Event-based monitoring
- Graceful error handling
- Connection recovery

---

### 4. **Database (PostgreSQL)**
Persistent data storage with connection pooling

#### Features:
- **Connection Pool**: Max 20 connections by default
- **Idle Timeout**: 30 seconds
- **Connection Timeout**: 10 seconds
- **Status Monitoring**: Log connection events
- **Error Handling**: Catch and report pool errors

#### Configuration:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=salesDB
DB_PASSWORD=Dora
DB_PORT=5432
DB_POOL_SIZE=20
```

---

## 🔐 Security & Middleware

### Authentication Middleware
Enhanced JWT validation with Redis caching

```javascript
Features:
- Token verification with caching
- Token blacklisting support
- Expiration detection
- Error handling
```

### Rate Limiting Middleware
Redis-based sliding window algorithm

```javascript
- Configurable limits per time window
- IP-based tracking
- Rate limit headers in response
- Automatic window expiration
```

---

## 📊 Utilities & Tools

### 1. **CacheManager** (`utils/cacheManager.js`)
Abstraction layer for Redis operations

```javascript
Methods:
- get(namespace, identifier)
- set(namespace, identifier, value, ttl)
- getOrSet(namespace, identifier, fetcher, ttl)
- delete(namespace, identifier)
- clearNamespace(namespace)
- increment(namespace, identifier, amount)
- addToSet(namespace, identifier, items)
- getSet(namespace, identifier)
- getStats()
```

### 2. **Logger** (`utils/logger.js`)
Structured logging with levels and colors

```javascript
Methods:
- error(message, data)
- warn(message, data)
- info(message, data)
- debug(message, data)
- metric(name, duration, data)
- errorWithStack(message, error, data)
```

### 3. **ResponseHandler** (`utils/responseHandler.js`)
Consistent API response format

```javascript
Methods:
- success(res, data, statusCode, message)
- error(res, message, statusCode, errors)
- created(res, data, message)
- paginated(res, data, page, limit, total)
- notFound(res, message)
- unauthorized(res, message)
- validation(res, errors)
```

### 4. **MetricsCollector** (`utils/metricsCollector.js`)
Track request counts, errors, and response times

```javascript
Methods:
- middleware() - Express middleware
- recordMetric(endpoint, statusCode, duration)
- getMetrics() - Return all metrics
- reset() - Clear metrics
```

### 5. **AsyncHandler** (`utils/asyncHandler.js`)
Wrapper for async route handlers

```javascript
Usage:
app.get('/endpoint', asyncHandler(async (req, res) => {
  // Your async code
}));
```

---

## 🚀 Starting the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Services

**Terminal 1 - Server 1:**
```bash
npm run server1
# or node server1.js
```

**Terminal 2 - Server 2:**
```bash
npm run server2
# or node server2.js
```

**Terminal 3 - Load Balancer:**
```bash
npm run load-balancer
# or node load-balancer.js
```

### 4. Verify Installation
```bash
# Check load balancer status
curl http://localhost:4000/status

# Check health
curl http://localhost:4000/health

# View server 1 metrics
curl http://localhost:3001/metrics
```

---

## 📈 Monitoring & Debugging

### Load Balancer Status
```bash
GET http://localhost:4000/status
```

Returns:
```json
{
  "timestamp": "2026-04-22T...",
  "servers": [
    {
      "url": "http://localhost:3001",
      "healthy": true,
      "weight": 1,
      "requestCount": 123,
      "errorCount": 0
    }
  ]
}
```

### Server Metrics
```bash
GET http://localhost:3001/metrics
```

Returns performance data for the server instance.

### Request Tracing
All responses include `X-Request-ID` header for tracing through the system.

---

## 🔧 System Design Patterns Implemented

### 1. **Load Balancing**
- Weighted Round-Robin algorithm
- Health-aware server selection
- Automatic failover with retries

### 2. **Caching Strategy**
- Multi-tier caching (Token verification, Data)
- Cache invalidation patterns
- TTL-based expiration

### 3. **Circuit Breaker Pattern**
- Server health monitoring
- Automatic isolation of unhealthy servers
- Recovery mechanism

### 4. **Graceful Degradation**
- Fallback to unhealthy servers if all down
- Request retry on failure
- Timeout handling

### 5. **Structured Logging**
- Contextual logging with IDs
- Error tracking with stack traces
- Performance metrics

### 6. **Connection Pooling**
- Database connection reuse
- Redis connection optimization
- Resource efficiency

---

## 🎯 Best Practices Implemented

1. **Environment Configuration**: 12-factor app principles
2. **Error Handling**: Comprehensive try-catch and error middleware
3. **Health Checks**: Regular service monitoring
4. **Request Tracking**: Unique ID per request
5. **Rate Limiting**: Protection against abuse
6. **Graceful Shutdown**: Clean process termination
7. **Connection Management**: Pool sizing and timeouts
8. **Monitoring**: Metrics collection and analysis

---

## 📝 Environment Variables

See `.env.example` for complete list. Key variables:

```env
# Servers
SERVER_1=http://localhost:3001
SERVER_2=http://localhost:3002
LB_PORT=4000

# Database
DB_POOL_SIZE=20
DB_POOL_TIMEOUT=10000

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your-secret

# Rate Limiting
RATE_LIMIT=100
RATE_LIMIT_WINDOW=60
```

---

## 🐛 Troubleshooting

### Load Balancer shows unhealthy servers
- Check if backend servers are running and responding to `/health`
- Verify network connectivity
- Check server logs for errors

### High error rate
- Review error logs with unique request IDs
- Check Redis connection status
- Verify database connectivity

### Slow responses
- Check `/metrics` endpoint for bottlenecks
- Monitor Redis performance
- Review database query performance

---

## 📚 Additional Resources

- Load Balancer Class: [load-balancer.js](load-balancer.js)
- Utilities: [utils/](utils/)
- Middleware: [middlewares/](middlewares/)
- Configuration: [config/](config/)
