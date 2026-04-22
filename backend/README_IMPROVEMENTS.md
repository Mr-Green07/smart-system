# SmartSystem Backend - Enhanced System Design

## 📋 Overview

This backend has been enhanced with **enterprise-grade system design patterns** including load balancing, distributed caching, connection pooling, health checks, and comprehensive monitoring.

---

## ✨ Key Improvements Made

### 1. **Advanced Load Balancer**
- ✅ Weighted Round-Robin algorithm for intelligent load distribution
- ✅ Health checks with automatic server recovery
- ✅ Sticky sessions for client affinity
- ✅ Request retry logic with fallback
- ✅ Request forwarding with trace headers
- ✅ Real-time server status monitoring
- ✅ Graceful error handling

**File**: [load-balancer.js](load-balancer.js)

### 2. **Enhanced Configuration Management**
- ✅ Environment-based configuration (`.env`)
- ✅ Connection pooling for database (20 connections default)
- ✅ Redis with retry strategies
- ✅ Configurable rate limiting
- ✅ JWT secret management

**Files**: [config/db.js](config/db.js), [config/redis.js](config/redis.js), [.env.example](.env.example)

### 3. **Redis Integration**
- ✅ Robust connection management
- ✅ Automatic reconnection with backoff
- ✅ Rate limiting implementation
- ✅ Session caching (JWT tokens)
- ✅ Data caching layer
- ✅ Token blacklisting for logout
- ✅ Event-based monitoring

**File**: [config/redis.js](config/redis.js)

### 4. **Advanced Middleware**
- ✅ **Rate Limiter**: Sliding window algorithm with Redis
- ✅ **Auth Middleware**: Token validation with caching
- ✅ **Request Tracking**: Unique request IDs
- ✅ **Error Handling**: Global error middleware
- ✅ **Logging**: Structured request logging

**Files**: [middlewares/rateLimiter.js](middlewares/rateLimiter.js), [middlewares/authMiddleware.js](middlewares/authMiddleware.js)

### 5. **Utility Modules**

#### CacheManager (`utils/cacheManager.js`)
```javascript
- get/set operations
- getOrSet pattern
- Namespace management
- TTL support
- Set operations
- Statistics
```

#### Logger (`utils/logger.js`)
```javascript
- Structured logging
- Multiple log levels (ERROR, WARN, INFO, DEBUG)
- Color-coded output
- Metric tracking
- Error stack tracing
```

#### ResponseHandler (`utils/responseHandler.js`)
```javascript
- Consistent response format
- Success/Error responses
- Pagination support
- HTTP status helpers
- Validation responses
```

#### MetricsCollector (`utils/metricsCollector.js`)
```javascript
- Request counting
- Response time tracking
- Error rate calculation
- Endpoint statistics
- Historical metrics in Redis
```

#### AsyncHandler (`utils/asyncHandler.js`)
```javascript
- Wrapper for async route handlers
- Automatic error handling
```

### 6. **Server Improvements**
- ✅ Metrics collection middleware
- ✅ Logging system integration
- ✅ Graceful shutdown handling
- ✅ Uncaught exception handling
- ✅ Unhandled rejection handling
- ✅ Health check endpoints

**Files**: [server1.js](server1.js), [server2.js](server2.js)

### 7. **Express App Enhancement**
- ✅ CORS configuration
- ✅ Request size limits
- ✅ Morgan request logging
- ✅ Health endpoints
- ✅ Global error middleware
- ✅ Request ID injection

**File**: [app.js](app.js)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start Services

**Option A: Separate Terminals**
```bash
Terminal 1: npm run server1
Terminal 2: npm run server2
Terminal 3: npm run load-balancer
```

**Option B: Single Command (requires concurrently)
```bash
npm install -D concurrently
npm run start-all
```

### 4. Verify
```bash
# Check load balancer status
curl http://localhost:4000/status

# Check health
curl http://localhost:4000/health

# View server metrics
curl http://localhost:3001/metrics
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Port 3000)                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Load Balancer (4000)                         │
│  • Health Checks                                                │
│  • Weighted Round-Robin                                         │
│  • Sticky Sessions                                              │
│  • Request Retry Logic                                          │
│  • Status Monitoring                                            │
└──────────┬─────────────────────────────────────────┬────────────┘
           │                                         │
      ┌────▼────┐                              ┌─────▼────┐
      │         │                              │         │
      ▼         ▼                              ▼         ▼
 ┌─────────┐ ┌─────────┐  Cache        ┌─────────┐ ┌─────────┐
 │ Server1 │ │ Server2 │◄─────────────► │ Redis   │ │Database │
 │(3001)   │ │(3002)   │               │ Cache   │ │(PG)     │
 │         │ │         │               │(6379)   │ │(5432)   │
 └─────────┘ └─────────┘               └─────────┘ └─────────┘
     │           │
     │           │
     └─────┬─────┘
           │
    ┌──────▼─────────┐
    │  Utilities     │
    │  • Caching     │
    │  • Logging     │
    │  • Metrics     │
    │  • Responses   │
    └────────────────┘
```

---

## 🔧 System Design Patterns

### 1. **Load Balancing**
- **Pattern**: Weighted Round-Robin with Health Awareness
- **Benefit**: Distributes load evenly across healthy servers

### 2. **Caching**
- **Pattern**: Multi-tier (Token caching, Data caching)
- **Benefit**: Reduces database load, improves response time

### 3. **Circuit Breaker**
- **Pattern**: Server health monitoring + Auto-recovery
- **Benefit**: Prevents cascading failures

### 4. **Connection Pooling**
- **Pattern**: Database and Redis connection reuse
- **Benefit**: Resource efficiency, better performance

### 5. **Graceful Degradation**
- **Pattern**: Fallback to unhealthy servers if all down
- **Benefit**: Maximum availability

### 6. **Request Tracing**
- **Pattern**: Unique ID per request
- **Benefit**: End-to-end debugging and monitoring

---

## 📈 Monitoring & Debugging

### Load Balancer Status
```bash
GET http://localhost:4000/status
```

Response:
```json
{
  "timestamp": "2026-04-22T...",
  "servers": [
    {
      "url": "http://localhost:3001",
      "healthy": true,
      "weight": 1,
      "requestCount": 523,
      "errorCount": 2
    }
  ]
}
```

### Server Metrics
```bash
GET http://localhost:3001/metrics
```

Response:
```json
{
  "totalRequests": 523,
  "totalErrors": 2,
  "uptime": 1234,
  "errorRate": "0.38%",
  "avgResponseTime": "45.23ms",
  "endpoints": {
    "GET /api/products": {
      "count": 123,
      "avgDuration": 42.1,
      "minDuration": 10,
      "maxDuration": 250
    }
  }
}
```

### Request Tracing
All responses include:
```
X-Request-ID: 550e8400-e29b-4...
```

Use this ID to trace requests through logs and systems.

---

## 🔐 Security Features

1. **Rate Limiting**: Protects against DDoS and abuse
2. **JWT Authentication**: Secure token-based auth
3. **Token Caching**: Reduces auth overhead with security
4. **Token Blacklisting**: Supports logout functionality
5. **CORS Configuration**: Controlled cross-origin access
6. **Connection Pooling**: Prevents resource exhaustion

---

## 📝 Environment Variables

See [.env.example](.env.example) for complete list:

```env
# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=salesDB
DB_PASSWORD=Dora
DB_PORT=5432
DB_POOL_SIZE=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Servers
SERVER_1=http://localhost:3001
SERVER_2=http://localhost:3002
LB_PORT=4000

# Security
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT=100
RATE_LIMIT_WINDOW=60

# Logging
LOG_LEVEL=debug
```

---

## 💡 Usage Examples

### Using CacheManager
```javascript
const CacheManager = require('./utils/cacheManager');

// Get from cache or fetch if missing
const user = await CacheManager.getOrSet(
  'user', 
  userId, 
  () => fetchUserFromDB(userId),
  3600 // 1 hour TTL
);
```

### Using ResponseHandler
```javascript
const ResponseHandler = require('./utils/responseHandler');

// Success
ResponseHandler.success(res, { id: 1, name: 'Product' });

// Paginated
ResponseHandler.paginated(res, data, page, limit, total);

// Error
ResponseHandler.notFound(res, 'Product not found');
```

### Using Logger
```javascript
const Logger = require('./utils/logger');
const logger = new Logger('MyModule');

logger.info('Operation completed', { userId: 123 });
logger.error('Something went wrong', { error: err.message });
logger.metric('productFetch', 45, { productId: 123 });
```

### Using AsyncHandler
```javascript
const asyncHandler = require('./utils/asyncHandler');

app.get('/products', asyncHandler(async (req, res) => {
  const products = await getProducts();
  res.json(products);
}));
```

---

## 📂 Project Structure

```
backend/
├── config/
│   ├── db.js                 # PostgreSQL connection pool
│   └── redis.js              # Redis client with health checks
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── salesController.js
│   └── productController-EXAMPLE.js  # Best practices example
├── middlewares/
│   ├── authMiddleware.js     # Enhanced JWT validation
│   └── rateLimiter.js        # Redis-based rate limiting
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   └── salesRoutes.js
├── utils/
│   ├── asyncHandler.js       # Async error wrapper
│   ├── cacheManager.js       # Redis caching abstraction
│   ├── logger.js             # Structured logging
│   ├── metricsCollector.js   # Performance metrics
│   └── responseHandler.js    # Unified response format
├── app.js                     # Express app configuration
├── load-balancer.js          # Advanced load balancer
├── server1.js                # Server instance 1
├── server2.js                # Server instance 2
├── package.json              # Dependencies and scripts
├── .env.example              # Environment template
├── SYSTEM_DESIGN.md          # Detailed architecture docs
└── README.md                 # This file
```

---

## 🎯 Next Steps

1. **Update Controllers**: Use [productController-EXAMPLE.js](controllers/productController-EXAMPLE.js) as template
2. **Configure Environment**: Set up `.env` for your system
3. **Database Setup**: Create tables and initialize PostgreSQL
4. **Redis Setup**: Ensure Redis is running on configured port
5. **Test Endpoints**: Use provided curl examples
6. **Monitor Metrics**: Check `/metrics` endpoint regularly

---

## 🐛 Troubleshooting

### "All servers unavailable"
- Check if servers are running: `ps aux | grep node`
- Verify health endpoints: `curl http://localhost:3001/health`

### High latency
- Check `/metrics` for slow endpoints
- Review Redis connection: `redis-cli ping`
- Monitor database: Check PostgreSQL logs

### Rate limit errors (429)
- Increase `RATE_LIMIT` in `.env`
- Clear Redis cache: `redis-cli FLUSHDB`

---

## 📚 Additional Documentation

- [System Design Details](SYSTEM_DESIGN.md)
- [Example Controller](controllers/productController-EXAMPLE.js)
- [Environment Template](.env.example)

---

## 📞 Support

For issues or questions:
1. Check logs with request IDs
2. Review `/metrics` endpoint
3. Check `/status` endpoint on load balancer
4. Review [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) for architecture details
