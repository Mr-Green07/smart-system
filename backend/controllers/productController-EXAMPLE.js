/**
 * Example Enhanced Product Controller
 * Demonstrates system design best practices:
 * - Response handler usage
 * - Cache management
 * - Error handling
 * - Structured logging
 */

const pool = require("../config/db");
const CacheManager = require("../utils/cacheManager");
const ResponseHandler = require("../utils/responseHandler");
const Logger = require("../utils/logger");
const asyncHandler = require("../utils/asyncHandler");

const logger = new Logger("ProductController");
const CACHE_TTL = 1800; // 30 minutes

/**
 * Get all products with caching
 */
exports.getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Try to get from cache
  const cacheKey = `products:page:${page}:limit:${limit}`;
  const cached = await CacheManager.get("products", cacheKey);

  if (cached) {
    logger.debug("Returning cached products");
    return ResponseHandler.paginated(
      res,
      cached.data,
      page,
      limit,
      cached.total
    );
  }

  logger.debug("Fetching products from database");

  // Get total count
  const countResult = await pool.query("SELECT COUNT(*) FROM products");
  const total = parseInt(countResult.rows[0].count);

  // Get paginated data
  const result = await pool.query(
    "SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );

  const data = result.rows;

  // Cache the result
  await CacheManager.set(
    "products",
    cacheKey,
    { data, total },
    CACHE_TTL
  );

  logger.metric("getAllProducts", Date.now(), { count: data.length });

  ResponseHandler.paginated(res, data, page, limit, total);
});

/**
 * Get single product by ID
 */
exports.getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate input
  if (!id) {
    return ResponseHandler.validation(res, { id: "Product ID is required" });
  }

  // Try cache first
  const cached = await CacheManager.get("product", id);
  if (cached) {
    logger.debug(`Product ${id} found in cache`);
    return ResponseHandler.success(res, cached);
  }

  // Fetch from database
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    return ResponseHandler.notFound(res, `Product ${id} not found`);
  }

  const product = result.rows[0];

  // Cache it
  await CacheManager.set("product", id, product, CACHE_TTL);

  ResponseHandler.success(res, product);
});

/**
 * Create new product
 */
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category } = req.body;

  // Validation
  if (!name || !price) {
    return ResponseHandler.validation(res, {
      name: name ? undefined : "Name is required",
      price: price ? undefined : "Price is required",
    });
  }

  logger.debug("Creating new product", { name, price });

  const result = await pool.query(
    "INSERT INTO products (name, price, description, category, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
    [name, price, description || null, category || null]
  );

  const product = result.rows[0];

  // Clear cache for products list
  await CacheManager.clearNamespace("products");

  logger.info(`Product created: ${product.id}`, { name });

  ResponseHandler.created(res, product, "Product created successfully");
});

/**
 * Update product
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, price, description, category } = req.body;

  if (!id) {
    return ResponseHandler.validation(res, { id: "Product ID is required" });
  }

  // Check if product exists
  const existResult = await pool.query("SELECT * FROM products WHERE id = $1", [
    id,
  ]);

  if (existResult.rows.length === 0) {
    return ResponseHandler.notFound(res, `Product ${id} not found`);
  }

  logger.debug(`Updating product ${id}`);

  const result = await pool.query(
    "UPDATE products SET name = COALESCE($1, name), price = COALESCE($2, price), description = COALESCE($3, description), category = COALESCE($4, category), updated_at = NOW() WHERE id = $5 RETURNING *",
    [name, price, description, category, id]
  );

  const product = result.rows[0];

  // Invalidate caches
  await CacheManager.delete("product", id);
  await CacheManager.clearNamespace("products");

  logger.info(`Product updated: ${id}`, { name });

  ResponseHandler.success(res, product, "Product updated successfully");
});

/**
 * Delete product
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return ResponseHandler.validation(res, { id: "Product ID is required" });
  }

  logger.debug(`Deleting product ${id}`);

  const result = await pool.query(
    "DELETE FROM products WHERE id = $1 RETURNING id",
    [id]
  );

  if (result.rows.length === 0) {
    return ResponseHandler.notFound(res, `Product ${id} not found`);
  }

  // Invalidate caches
  await CacheManager.delete("product", id);
  await CacheManager.clearNamespace("products");

  logger.info(`Product deleted: ${id}`);

  ResponseHandler.success(res, { id }, "Product deleted successfully");
});

/**
 * Search products
 */
exports.searchProducts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  if (!query) {
    return ResponseHandler.validation(res, { query: "Search query is required" });
  }

  logger.debug(`Searching for products: "${query}"`);

  const countResult = await pool.query(
    "SELECT COUNT(*) FROM products WHERE name ILIKE $1 OR description ILIKE $1",
    [`%${query}%`]
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(
    "SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $1 LIMIT $2 OFFSET $3",
    [`%${query}%`, limit, offset]
  );

  ResponseHandler.paginated(res, result.rows, page, limit, total);
});

/**
 * Get product statistics
 */
exports.getProductStats = asyncHandler(async (req, res) => {
  const cacheKey = "stats";
  const cached = await CacheManager.get("product", cacheKey);

  if (cached) {
    return ResponseHandler.success(res, cached);
  }

  const stats = await pool.query(
    `SELECT 
      COUNT(*) as total_products,
      AVG(price) as avg_price,
      MIN(price) as min_price,
      MAX(price) as max_price,
      COUNT(DISTINCT category) as total_categories
    FROM products`
  );

  const result = stats.rows[0];

  // Cache stats for 1 hour
  await CacheManager.set("product", cacheKey, result, 3600);

  ResponseHandler.success(res, result, "Product statistics retrieved successfully");
});
