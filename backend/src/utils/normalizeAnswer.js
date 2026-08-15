/**
 * Normalizes a text answer so comparisons are forgiving:
 * - trims whitespace
 * - lowercases
 * - collapses multiple spaces into one
 *
 * "  Manoj  " -> "manoj", "MaNoJ" -> "manoj", "Pizza   Palace" -> "pizza palace"
 */
export function normalizeAnswer(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
