/**
 * Unified Response Handler
 * Provides consistent API response format across all endpoints
 */

class ResponseHandler {
  /**
   * Success response
   */
  static success(res, data, statusCode = 200, message = "Success") {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Error response
   */
  static error(res, message, statusCode = 400, errors = {}) {
    res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Paginated response
   */
  static paginated(
    res,
    data,
    page,
    limit,
    total,
    statusCode = 200,
    message = "Success"
  ) {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Created response
   */
  static created(res, data, message = "Resource created successfully") {
    this.success(res, data, 201, message);
  }

  /**
   * No content response
   */
  static noContent(res, message = "No content") {
    res.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validation error response
   */
  static validation(res, errors) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Unauthorized response
   */
  static unauthorized(res, message = "Unauthorized") {
    this.error(res, message, 401);
  }

  /**
   * Forbidden response
   */
  static forbidden(res, message = "Forbidden") {
    this.error(res, message, 403);
  }

  /**
   * Not found response
   */
  static notFound(res, message = "Resource not found") {
    this.error(res, message, 404);
  }

  /**
   * Internal server error response
   */
  static serverError(res, message = "Internal server error") {
    this.error(res, message, 500);
  }
}

module.exports = ResponseHandler;
