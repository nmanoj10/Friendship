export function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export function notFound(req, res, next) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  if (status === 500) console.error('💥', err);
  res.status(status).json({ message: err.message || 'Internal server error' });
}

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
