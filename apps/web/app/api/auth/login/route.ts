import { loginResponseSchema } from '@pediatric-erp/schemas';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';


/**
 * POST /api/auth/login
 *
 * Route Handler que actúa como BFF (Backend-For-Frontend) para el login:
 *  1. Valida el payload con Zod (defensa en profundidad — el cliente ya valida).
 *  2. Reenvía las credenciales al endpoint real de NestJS POST /api/v1/auth/login.
 *  3. Si el backend responde 2xx, guarda el `accessToken` en una cookie
 *     **httpOnly + secure + sameSite=lax**, inaccesible desde `document.cookie`
 *     (mitiga XSS token theft).
 *  4. Devuelve únicamente el `user` (nunca el token) al cliente.
 *
 * La cookie dura 7 días (604 800 s) para coincidir con `JWT_EXPIRES_IN`
 * configurado en el backend NestJS.
 */
const loginBodySchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

const API_BASE_URL =
  (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/+$/, '') + '/api/v1';

const TOKEN_COOKIE_NAME = 'token';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'El cuerpo de la petición no es JSON válido.' },
      { status: 400 },
    );
  }

  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Email o contraseña con formato inválido.',
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
  } catch (error) {
    // ECONNREFUSED / DNS failure / timeout — el backend NestJS está caído
    // o el NEXT_PUBLIC_API_URL apunta a un host inalcanzable.
    console.error(
      `[auth/login] upstream unreachable at ${API_BASE_URL}/auth/login:`,
      error,
    );
    return NextResponse.json(
      {
        error: 'UPSTREAM_UNREACHABLE',
        message:
          'El servicio de autenticación no está disponible. ' +
          `Verificá que el backend esté corriendo en ${API_BASE_URL}.`,
      },
      { status: 503 },
    );
  }

  if (!upstreamResponse.ok) {
    const errorText = await upstreamResponse.text().catch(() => '');
    console.error(`[auth/login] upstream ${String(upstreamResponse.status)}:`, errorText);
    return NextResponse.json(
      {
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas. Verificá el correo y la contraseña.',
      },
      { status: 401 },
    );
  }

  const rawJson: unknown = await upstreamResponse.json();
  const validation = loginResponseSchema.safeParse(rawJson);

  if (!validation.success) {
    console.error('[auth/login] upstream response failed schema validation:', validation.error.flatten());
    return NextResponse.json(
      { error: 'UPSTREAM_INVALID_RESPONSE', message: 'Respuesta inesperada del servicio de autenticación.' },
      { status: 502 },
    );
  }

  const { accessToken, user } = validation.data;

  // Cookie httpOnly — INACCESIBLE desde JavaScript del navegador (XSS-safe).
  // `secure: true` exige HTTPS; en dev se respeta NODE_ENV para no romper localhost.
  const cookieStore = cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ user }, { status: 200 });
}
