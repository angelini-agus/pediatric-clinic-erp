/**
 * Shared formatting utilities (single source of truth).
 *
 * These helpers where previously duplicated in feature services
 * (e.g. `analytics.service.ts`). Import them from here to keep
 * consistent output across the API.
 */

/**
 * Formats patient date of birth to a human-readable age string in Spanish (e.g. "3 años", "8 m").
 */
export function formatAge(dateOfBirth: Date): string {
  const now = new Date();
  const dob = new Date(dateOfBirth);
  let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (now.getDate() < dob.getDate()) {
    months--;
  }
  if (months < 0) months = 0;

  if (months < 24) {
    return `${String(months)} m`;
  }
  const years = Math.floor(months / 12);
  return `${String(years)} años`;
}

/**
 * Formats a Date object to a 12-hour formatted time string in Spanish (e.g. "10:30 AM").
 */
export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
