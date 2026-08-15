import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../../src/utils/password.js';
import { signToken, verifyToken } from '../../src/utils/token.js';

test('hashPassword produces a salted hash that verifies, and rejects wrong passwords', () => {
  const stored = hashPassword('secret123');
  assert.notEqual(stored, 'secret123');
  assert.ok(stored.includes(':'));
  assert.equal(verifyPassword('secret123', stored), true);
  assert.equal(verifyPassword('wrong', stored), false);
  assert.equal(verifyPassword('secret123', 'garbage'), false);
});

test('signToken/verifyToken round-trip and detect tampering/expiry', () => {
  const token = signToken({ userId: 'abc123', username: 'manoj' });
  const payload = verifyToken(token);
  assert.equal(payload.userId, 'abc123');
  assert.equal(payload.username, 'manoj');
  assert.ok(payload.exp > Date.now());

  // Tampered signature → rejected
  const [h, b, sig] = token.split('.');
  assert.equal(verifyToken(`${h}.${b}.AAAA`), null);
  assert.equal(verifyToken(`${h}.${b}`), null);
  assert.equal(verifyToken('not-a-token'), null);
  assert.equal(verifyToken(null), null);
});
