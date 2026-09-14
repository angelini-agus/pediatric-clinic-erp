import { loginResponseSchema } from '@pediatric-erp/schemas';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * POST /api/auth/register
 *
 * BFF análogo a `/api/auth/login`: valida el payload con Zod, llama al
 * endpoint real de NestJS `POST /api/v1/auth/register`, y si el backend
 * responde con un `accessToken`, lo guarda en una cookie **httpOnly +
 * secure + sameSite=lax**. El cliente nunca ve el JWT.
 *
 * Diferencias con el login:
 *  - Devuelve 201 Created en éxito (NestJS usa HttpStatus.CREATED).
 *  - El email duplicado se traduce a 409 Conflict con mensaje local.
 */
const registerBodySchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  confirmPassword: z.string().min(1),
});

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

  const parsed = registerBodySchema.safeParse(body);
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

  const { confirmPassword: _ignored, ...registerPayload } = parsed.data;
  // `confirmPassword` es solo para validación client-side; el backend
  // no lo espera. Lo descartamos antes de enviar.

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload),
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
