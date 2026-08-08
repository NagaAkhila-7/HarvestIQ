const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);
  if (err.stack) console.error(err.stack);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const errorCode = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected internal server error occurred',
      details: err.details || []
    }
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `API Route not found: ${req.method} ${req.originalUrl}`
    }
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
