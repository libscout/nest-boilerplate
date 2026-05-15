/**
 * Pure string utility functions.
 * No business logic, no framework dependencies, no side effects.
 */

/**
 * Converts a string to a URL-friendly slug.
 * Example: "Hello World!" → "hello-world"
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Truncates a string to `maxLength` and appends `ellipsis` if truncated.
 */
export function truncate(
  value: string,
  maxLength: number,
  ellipsis = '…',
): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalizes the first character of a string.
 */
export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Masks parts of a string, leaving the last `visibleCount` characters visible.
 * Useful for masking emails, phone numbers, etc.
 */
export function maskEnd(
  value: string,
  visibleCount: number,
  maskChar = '*',
): string {
  if (value.length <= visibleCount) return value;
  const masked = maskChar.repeat(value.length - visibleCount);
  return masked + value.slice(-visibleCount);
}

/**
 * Extracts initials from a name (up to 2 characters).
 * Example: "John Doe" → "JD"
 */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}
