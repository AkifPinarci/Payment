/**
 * Global error handling middleware
 * This middleware catches all errors thrown within the application
 * and returns a standardized error response
 */

const errorMiddleware = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error status and message
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Custom error object to send to client
  const errorResponse = {
    error: {
      message,
      // Include stack trace in development only
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  };

  // Send error response
  res.status(status).json(errorResponse);
};

module.exports = errorMiddleware;
