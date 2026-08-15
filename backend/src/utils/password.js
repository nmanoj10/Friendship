import crypto from 'crypto';

// scrypt params — OWASP-recommended starting point (fast enough for a quiz app)
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_OPTS).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored ?? '').split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_OPTS).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(candidate, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
