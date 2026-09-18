// ==========================================
// CENTRAL DATE UTILITY
// Dynamic user-local date system for Accountability Garden
// Tagline: "You cannot edit yesterday."
// ==========================================

/**
 * Returns the user's current local date in YYYY-MM-DD format.
 * Uses the local system clock and timezone (not UTC).
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the current ISO timestamp for "now".
 */
export function getNowTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parses a YYYY-MM-DD string into a local Date object safely,
 * preventing UTC shift issues.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Formats a date string (YYYY-MM-DD) or Date object into human-readable format.
 * Matches standard format: "Friday, 18 September 2026"
 */
export function formatDisplayDate(dateInput: string | Date = new Date()): string {
  const date = typeof dateInput === 'string' ? parseLocalDate(dateInput) : dateInput;
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Returns the current local year (e.g. 2026).
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Returns the current local month (0-11, where 0 = January, 8 = September).
 */
export function getCurrentMonth(): number {
  return new Date().getMonth();
}

/**
 * Returns the current local day of month (1-31).
 */
export function getCurrentDay(): number {
  return new Date().getDate();
}

/**
 * Checks if a given YYYY-MM-DD string is today in local time.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getLocalDateString();
}

/**
 * Checks if a given YYYY-MM-DD string is before today in local time.
 */
export function isPastDate(dateStr: string): boolean {
  return dateStr < getLocalDateString();
}

/**
 * Checks if a given YYYY-MM-DD string is after today in local time.
 */
export function isFutureDate(dateStr: string): boolean {
  return dateStr > getLocalDateString();
}

/**
 * Calculates whole days between two YYYY-MM-DD strings.
 */
export function getDaysDifference(fromDateStr: string, toDateStr: string): number {
  const from = parseLocalDate(fromDateStr);
  const to = parseLocalDate(toDateStr);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}
