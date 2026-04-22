// GITHUB: Day 2 - Commit 1 - "feat(backend): add Express server setup, MongoDB connection, and middleware"

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Something went wrong';

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `A record with that ${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Multer file size / count errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Maximum size is 10MB.';
    } else {
      message = 'File upload error. Please try again.';
    }
  }

  // File-type validation errors thrown by our upload middleware — these are user errors, not server errors
  const fileValidationMessages = [
    'Unsupported file type',
    'Image must be jpg, jpeg, png, or gif',
    'Document must be PDF, XLSX, or DOCX',
    'Invalid file type for upload',
  ];
  if (fileValidationMessages.includes(err.message)) {
    statusCode = 400;
  }

  // For server errors (500), log technical details for developers but return a generic message to the user
  if (statusCode === 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} —`, err.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
    message = 'Something went wrong. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

module.exports = errorHandler;
