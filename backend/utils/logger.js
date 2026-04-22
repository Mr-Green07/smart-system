/**
 * Centralized Logging System
 * Supports different log levels and structured logging
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const LOG_COLORS = {
  ERROR: "\x1b[31m", // Red
  WARN: "\x1b[33m", // Yellow
  INFO: "\x1b[36m", // Cyan
  DEBUG: "\x1b[35m", // Magenta
  RESET: "\x1b[0m", // Reset
};

class Logger {
  constructor(name = "App") {
    this.name = name;
    this.level = LOG_LEVELS[process.env.LOG_LEVEL || "INFO"];
  }

  /**
   * Format log message with timestamp and context
   */
  _format(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[level] || "";
    const reset = LOG_COLORS.RESET;

    const context = Object.keys(data).length > 0 ? JSON.stringify(data) : "";

    return `${color}[${timestamp}] [${this.name}] ${level}:${reset} ${message}${
      context ? " " + context : ""
    }`;
  }

  error(message, data = {}) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(this._format("ERROR", message, data));
    }
  }

  warn(message, data = {}) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(this._format("WARN", message, data));
    }
  }

  info(message, data = {}) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(this._format("INFO", message, data));
    }
  }

  debug(message, data = {}) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.log(this._format("DEBUG", message, data));
    }
  }

  /**
   * Log performance metrics
   */
  metric(name, duration, data = {}) {
    const logData = { ...data, durationMs: duration };
    this.info(`[METRIC] ${name}`, logData);
  }

  /**
   * Log errors with stack trace
   */
  errorWithStack(message, error, data = {}) {
    const logData = {
      ...data,
      errorMessage: error.message,
      errorStack: error.stack,
    };
    this.error(message, logData);
  }
}

module.exports = Logger;
