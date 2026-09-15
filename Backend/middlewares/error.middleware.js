const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || "Internal Server Error";

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors && err.errors.length > 0 ? err.errors : undefined
  });
};

module.exports = {
  notFound,
  errorHandler
};
