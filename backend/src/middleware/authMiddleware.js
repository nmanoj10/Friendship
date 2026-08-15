import { User } from '../models/User.js';
import { verifyToken } from '../utils/token.js';
import { asyncHandler, createError } from './errorMiddleware.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload?.userId) throw createError(401, 'Please log in to continue.');

  const user = await User.findById(payload.userId);
  if (!user) throw createError(401, 'This account no longer exists.');

  req.userId = user._id;
  req.user = user;
  next();
});
