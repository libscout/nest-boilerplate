/**
 * Pure date utility functions.
 * No business logic, no framework dependencies, no side effects.
 */

/** Standard ISO date string (e.g. "2025-01-15") */
export type ISODate = string;

/** ISO datetime string (e.g. "2025-01-15T10:30:00.000Z") */
export type ISODateTime = string;

/**
 * Returns the current date as an ISO date string (YYYY-MM-DD).
 */
export function today(): ISODate {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns the current datetime as an ISO 8601 string.
 */
export function now(): ISODateTime {
  return new Date().toISOString();
}

/**
 * Parses an ISO datetime string and returns a Date.
 */
export function parseISO(datetime: ISODateTime): Date {
  return new Date(datetime);
}

/**
 * Adds `days` to the given date and returns a new ISO date string.
 */
export function addDays(date: ISODate, days: number): ISODate {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns the difference in days between two ISO date strings.
 */
export function diffDays(a: ISODate, b: ISODate): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
}

/**
 * Returns a human-readable relative time string (e.g. "3 days ago").
 */
export function relativeTime(datetime: ISODateTime): string {
  const diff = Date.now() - new Date(datetime).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}
