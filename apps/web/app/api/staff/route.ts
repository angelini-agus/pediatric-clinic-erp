import { loginResponseSchema, staffCreateSchema } from '@pediatric-erp/schemas';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/staff
 *
 * BFF para el alta de profesionales. Reenvía el JWT del admin (cookie
 * httpOnly) como `Authorization: Bearer` al endpoint NestJS
 * `POST /api/v1/auth/staff`, que exige `@Roles('ADMIN', 'SUPER_ADMIN')`.
 *
 * Diferencias con los BFF de login/register:
 *  - NO toca la cookie de sesión: el admin conserva su propia sesión
 *    después de crear al profesional.
 *  - Sin cookie → 401 local, sin llamar al backend.
 *  - 401/403 del backend → 403 local ("solo un administrador...").
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
      { error: 'UNAUTHENTICATED', message: 'Necesitás iniciar sesión como administrador.' },
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

  const parsed = staffCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Datos del profesional inválidos.',
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${API_BASE_URL}/auth/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('[staff] upstream network error:', error);
    return NextResponse.json(
      { error: 'UPSTREAM_UNREACHABLE', message: 'No se pudo contactar al servicio.' },
      { status: 503 },
    );
  }

  // 401/403 del backend: token inválido o rol sin permiso.
  if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Solo un administrador puede crear profesionales.' },
      { status: 403 },
    );
  }

  // 409 Conflict: email duplicado (NestJS throws ConflictException).
  if (upstreamResponse.status === 409) {
    return NextResponse.json(
      { error: 'EMAIL_ALREADY_REGISTERED', message: 'El email ya está registrado.' },
      { status: 409 },
    );
  }

  if (!upstreamResponse.ok) {
    const errorText = await upstreamResponse.text().catch(() => '');
    console.error(`[staff] upstream ${String(upstreamResponse.status)}:`, errorText);
    return NextResponse.json(
      {
        error: 'STAFF_CREATE_FAILED',
        message: 'No se pudo crear el profesional. Verificá los datos.',
      },
      { status: 400 },
    );
  }

  const rawJson: unknown = await upstreamResponse.json();
  const validation = loginResponseSchema.safeParse(rawJson);

  if (!validation.success) {
    console.error('[staff] upstream response failed schema:', validation.error.flatten());
    return NextResponse.json(
      {
        error: 'UPSTREAM_INVALID_RESPONSE',
        message: 'Respuesta inesperada del servicio.',
      },
      { status: 502 },
    );
  }

  // El admin conserva su sesión: NO se escribe la cookie con el token del
  // usuario recién creado.
  return NextResponse.json({ user: validation.data.user }, { status: 201 });
}
