import { User } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/token.js';
import { asyncHandler, createError } from '../middleware/errorMiddleware.js';

const USERNAME_RE = /^[a-z0-9_.]+$/;

function publicUser(user) {
  return { id: user._id, username: user.username, createdAt: user.createdAt };
}

export const register = asyncHandler(async (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (username.length < 2 || username.length > 30 || !USERNAME_RE.test(username)) {
    throw createError(400, 'Username must be 2–30 characters using letters, numbers, . or _.');
  }
  if (password.length < 6) throw createError(400, 'Password must be at least 6 characters.');

  const existing = await User.findOne({ username });
  if (existing) throw createError(409, 'That username is already taken.');

  const user = await User.create({ username, passwordHash: hashPassword(password) });
  res.status(201).json({ user: publicUser(user), token: signToken({ userId: user._id, username: user.username }) });
});

export const login = asyncHandler(async (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const user = await User.findOne({ username });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError(401, 'Wrong username or password.');
  }

  res.json({ user: publicUser(user), token: signToken({ userId: user._id, username: user.username }) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
