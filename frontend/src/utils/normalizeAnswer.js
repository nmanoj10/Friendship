/**
 * Mirrors the backend normalizer: trim, lowercase, collapse spaces.
 * "  Sinpers  " -> "sinpers"
 */
export function normalizeAnswer(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
