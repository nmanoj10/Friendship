/**
 * Mirrors the backend normalizer: trim, lowercase, collapse spaces.
 * "  Manoj  " -> "manoj"
 */
export function normalizeAnswer(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
