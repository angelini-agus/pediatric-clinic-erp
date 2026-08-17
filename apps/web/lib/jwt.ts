/**
 * lib/jwt.ts
 *
 * Helpers para extraer datos del JWT que se persiste en la cookie httpOnly.
 *
 * ⚠️ **Solo lectura, sin verificación de firma.** La firma se valida
 * server-side en cada request al backend (NestJS valida con `jsonwebtoken`).
 * Estos helpers son exclusivamente para RENDERIZAR el nombre/rol del usuario
 * en el shell sin necesidad de un fetch extra a `/users/me`.
 *
 * El payload del JWT sigue el schema `authUserSchema` (ver
 * `packages/schemas/src/auth.schema.ts`). Asumimos que el backend firma con
 * `payload: { sub, email, fullName, role }`; cualquier drift entre el backend
 * y este parser simplemente devolverá `null` en `decodeAuthPayload`.
 */

import { cookies } from 'next/headers';

import { TOKEN_COOKIE_NAME } from './api';

import type { AuthUser } from '@pediatric-erp/schemas';


/**
 * Decoded JWT payload as exported by the NestJS auth endpoint.
 * Fields are optional because we don't trust the runtime shape strictly —
 * `decodeAuthPayload` validates each field individually.
 */
export type JwtPayload = Partial<AuthUser> & {
  sub?: string;
  iat?: number;
  exp?: number;
};

/**
 * Returns the raw JWT string from the httpOnly cookie, or `undefined` if
 * the user is not authenticated.
 *
 * SERVER-ONLY: uses `next/headers` cookies(). Do NOT import from Client
 * Components — the cookie is httpOnly and not accessible from the browser.
 */
export function getJwtToken(): string | undefined {
  return cookies().get(TOKEN_COOKIE_NAME)?.value;
}

/**
 * Parses a JWT string and returns the decoded payload as a plain object.
 * Returns `null` if the token is malformed or has fewer than 3 segments.
 *
 * Note: JWTs use **base64url** encoding (RFC 7515 §3), which differs from
 * standard base64 by:
 *   - using `-` and `_` instead of `+` and `/`
 *   - omitting padding `=` characters
 *
 * Node.js `Buffer.from(..., 'base64url')` handles both correctly.
 */
export function parseJwtPayload(token: string): JwtPayload | null {
  const segments = token.split('.');
  if (segments.length !== 3) {
    return null;
  }

  const payloadSegment = segments[1];
  if (!payloadSegment) {
    return null;
  }

  try {
    const decoded = Buffer.from(payloadSegment, 'base64url').toString('utf8');
    const parsed: unknown = JSON.parse(decoded);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Decodes the JWT from the request cookie and returns a normalized
 * `AuthUser` object, or `null` if no valid token / payload is present.
 *
 * Each field is validated individually so a missing or malformed property
 * doesn't break the whole render — we fall back to `null` only when the
 * payload is completely unusable.
 */
export function decodeAuthPayload(): AuthUser | null {
  const token = getJwtToken();
  if (!token) {
    return null;
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    return null;
  }

  const id = payload.sub ?? payload.id;
  const email = payload.email;
  const fullName = payload.fullName;
  const role = payload.role;

  // Minimum viable identity: id + email + fullName + role are all required
  // by `authUserSchema`. If any is missing we return null so the UI can
  // render a safe fallback rather than partial data.
  if (
    typeof id !== 'string' ||
    typeof email !== 'string' ||
    typeof fullName !== 'string' ||
    typeof role !== 'string'
  ) {
    return null;
  }

  return { id, email, fullName, role };
}

