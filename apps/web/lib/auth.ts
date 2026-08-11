import { cookies } from 'next/headers';

/**
 * Name of the browser cookie that stores the JWT access token.
 * Shared between the login page, the Next.js middleware and server fetchers.
 */
export const TOKEN_COOKIE_NAME = 'token';

/**
 * Reads the JWT access token from the request cookies.
 *
 * SERVER-ONLY: uses next/headers cookies(). Do NOT import this module
 * from Client Components (it would break the client bundle).
 */
export function getAuthToken(): string | undefined {
  return cookies().get(TOKEN_COOKIE_NAME)?.value;
}