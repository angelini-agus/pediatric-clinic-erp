import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the user initials (uppercase) used in avatar circles.
 * Falls back to '?' if the name is empty.
 *
 * @example
 *   getUserInitials('Ricardo Silva') // "RS"
 */
export function getUserInitials(fullName: string): string {
  if (!fullName.trim()) {
    return '?';
  }
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return `${first}${last}`.toUpperCase();
}
