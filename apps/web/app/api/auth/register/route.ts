import { loginResponseSchema, registerSchema } from '@pediatric-erp/schemas';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/auth/register
 *
 * BFF análogo a `/api/auth/login`: valida el payload con Zod, llama al
 * endpoint real de NestJS `POST /api/v1/auth/register`, y si el backend
 * responde con un `accessToken`, lo guarda en una cookie **httpOnly +
 * secure + sameSite=lax**. El cliente nunca ve el JWT.
 *
 * Validación: usa el MISMO `registerSchema` compartido que el backend
 * (single source of truth) — incluido `confirmPassword`, que el backend
 * exige y verifica server-side.
 *
 * Diferencias con el login:
 *  - Devuelve 201 Created en éxito (NestJS usa HttpStatus.CREATED).
 *  - El email duplicado se traduce a 409 Conflict con mensaje local.
 */

const API_BASE_URL =
  (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/+$/, '') + '/api/v1';

const TOKEN_COOKIE_NAME = 'token';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días — coincide con JWT_EXPIRES_IN

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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Datos de registro inválidos.',
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // El backend NestJS valida el MISMO `registerSchema` compartido: exige
  // `confirmPassword` y verifica que coincida con `password`. Reenviamos
  // el payload completo ya normalizado (email en lowercase, trims, etc.).
  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('[auth/register] upstream network error:', error);
    return NextResponse.json(
      {
        error: 'UPSTREAM_UNREACHABLE',
        message: 'No se pudo contactar al servicio de registro.',
      },
      { status: 503 },
    );
  }

  // 409 Conflict: email duplicado (NestJS throws ConflictException).
  if (upstreamResponse.status === 409) {
    return NextResponse.json(
      {
        error: 'EMAIL_ALREADY_REGISTERED',
        message: 'El email ya está registrado. Probá iniciar sesión.',
      },
      { status: 409 },
    );
  }

  if (!upstreamResponse.ok) {
    const errorText = await upstreamResponse.text().catch(() => '');
    console.error(`[auth/register] upstream ${String(upstreamResponse.status)}:`, errorText);
    return NextResponse.json(
      {
        error: 'REGISTRATION_FAILED',
        message: 'No se pudo completar el registro. Verificá los datos.',
      },
      { status: 400 },
    );
  }

  const rawJson: unknown = await upstreamResponse.json();
  const validation = loginResponseSchema.safeParse(rawJson);

  if (!validation.success) {
    console.error('[auth/register] upstream response failed schema:', validation.error.flatten());
    return NextResponse.json(
      {
        error: 'UPSTREAM_INVALID_RESPONSE',
        message: 'Respuesta inesperada del servicio de registro.',
      },
      { status: 502 },
    );
  }

  const { accessToken, user } = validation.data;

  // Cookie httpOnly — XSS-safe. El cliente solo recibe `user`.
  const cookieStore = cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ user }, { status: 201 });
}
