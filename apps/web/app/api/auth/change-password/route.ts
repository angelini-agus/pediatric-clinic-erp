import { changePasswordSchema } from '@pediatric-erp/schemas';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/auth/change-password
 *
 * BFF para el cambio de contraseña del usuario autenticado. Reenvía el JWT
 * de la cookie httpOnly como `Authorization: Bearer` al endpoint NestJS
 * `POST /api/v1/auth/change-password`.
 *
 * La cookie NO se toca: el token actual sigue siendo válido hasta expirar
 * (el JWT es stateless y no se invalidan sesiones al cambiar la password).
 */

const API_BASE_URL =
  (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/+$/, '') + '/api/v1';

const TOKEN_COOKIE_NAME = 'token';

export async function POST(request: Request): Promise<NextResponse> {
  const token = cookies().get(TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { error: 'UNAUTHENTICATED', message: 'Necesitás iniciar sesión.' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'El cuerpo de la petición no es JSON válido.' },
      { status: 400 },
    );
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Datos inválidos.',
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('[change-password] upstream network error:', error);
    return NextResponse.json(
      { error: 'UPSTREAM_UNREACHABLE', message: 'No se pudo contactar al servicio.' },
      { status: 503 },
    );
  }

  const rawJson = (await upstreamResponse.json().catch(() => null)) as { message?: string } | null;
  const upstreamMessage =
    typeof rawJson?.message === 'string' ? rawJson.message : 'No se pudo cambiar la contraseña.';

  if (!upstreamResponse.ok) {
    // 401 del backend: contraseña actual incorrecta o sesión inválida.
    return NextResponse.json(
      { error: 'CHANGE_PASSWORD_FAILED', message: upstreamMessage },
      { status: upstreamResponse.status },
    );
  }

  return NextResponse.json({ message: upstreamMessage }, { status: 200 });
}
