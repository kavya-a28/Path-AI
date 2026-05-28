const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error("API error:", {
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
  });

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  return res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Server error"
        : err.message || "Server error",
  });
};

module.exports = { notFound, errorHandler };
