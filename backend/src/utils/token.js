import crypto from 'crypto';

// Simple HMAC-SHA256 signed token (JWT-style: header.payload.signature).
// Kept dependency-free using Node's built-in crypto.
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function enc(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function dec(str) {
  return JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
}

export function signToken(payload, expiresInMs = DEFAULT_TTL_MS) {
  const data = `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc({ ...payload, iat: Date.now(), exp: Date.now() + expiresInMs })}`;
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  const parts = String(token ?? '').split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;

  const expected = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = dec(body);
    if (!payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
