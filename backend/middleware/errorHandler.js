const mongoose = require('mongoose');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      statusCode: 400,
      message: 'Validation Error',
      details: message
    };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = {
      statusCode: 400,
      message: 'Duplicate Field Error',
      details: `${field} '${value}' already exists`
    };
  }

  if (err.name === 'CastError') {
    error = {
      statusCode: 400,
      message: 'Invalid ID',
      details: 'Resource not found with this ID'
    };
  }

  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Invalid Token',
      details: 'Please provide a valid token'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token Expired',
      details: 'Please login again'
    };
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = {
        statusCode: 400,
        message: 'File Too Large',
        details: 'File size exceeds the maximum limit (5MB)'
      };
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = {
        statusCode: 400,
        message: 'Too Many Files',
        details: 'Maximum number of files exceeded'
      };
    } else {
      error = {
        statusCode: 400,
        message: 'File Upload Error',
        details: err.message
      };
    }
  }

  if (err.message && err.message.includes('Only image files')) {
    error = {
      statusCode: 400,
      message: 'Invalid File Type',
      details: 'Only image files (jpeg, jpg, png, gif, webp) are allowed'
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: error.details
    })
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
