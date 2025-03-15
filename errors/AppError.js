/**
 * Custom error class for application errors
 * This class extends the default Error class to include a statusCode
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Define common error factory methods
AppError.badRequest = (message) => new AppError(message || "Bad Request", 400);
AppError.unauthorized = (message) =>
  new AppError(message || "Unauthorized", 401);
AppError.forbidden = (message) => new AppError(message || "Forbidden", 403);
AppError.notFound = (message) => new AppError(message || "Not Found", 404);
AppError.internal = (message) =>
  new AppError(message || "Internal Server Error", 500);

module.exports = AppError;
