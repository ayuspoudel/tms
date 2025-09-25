function errorHandler(err, req, res, next) {
  // Use statusCode if available, otherwise default to 500
  const status = err.statusCode || 500;

  res.status(status).json({
    error: err.message || "Internal Server Error",
  });

  if (status === 500) {
    console.error("Unexpected error:", err);
  }
}

module.exports = { errorHandler };
