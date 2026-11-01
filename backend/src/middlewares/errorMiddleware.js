const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'An unexpected error occurred on the server.';

  // Handle Multer upload limits (e.g., file count exceeded)
  if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 413;
    message = 'Upload limit exceeded. Maximum 10 files allowed per batch.';
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(statusCode).json({
      error: 'Validation failed',
      details
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field}. It must be unique.`;
  }

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};

