import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer } from '../../src/utils/normalizeAnswer.js';

test('trims whitespace and lowercases', () => {
  assert.equal(normalizeAnswer('  Manoj  '), 'manoj');
  assert.equal(normalizeAnswer('MANOJ'), 'manoj');
  assert.equal(normalizeAnswer('MaNoJ'), 'manoj');
});

test('collapses multiple spaces', () => {
  assert.equal(normalizeAnswer('  Pizza   Palace '), 'pizza palace');
});

test('handles non-string input', () => {
  assert.equal(normalizeAnswer(null), '');
  assert.equal(normalizeAnswer(undefined), '');
  assert.equal(normalizeAnswer(42), '');
});
