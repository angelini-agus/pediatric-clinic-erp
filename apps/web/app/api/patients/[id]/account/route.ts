import { linkPatientAccountSchema } from '@pediatric-erp/schemas';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST   /api/patients/:id/account — links a portal account (by email).
 * DELETE /api/patients/:id/account — unlinks the portal account.
 *
 * BFF: forwards the staff JWT (httpOnly cookie) to the NestJS endpoints
 * `POST/DELETE /api/v1/patients/:id/account`, which enforce
 * @Roles('SECRETARY', 'ADMIN', 'SUPER_ADMIN'). The session cookie is
 * never modified.
 */

const API_BASE_URL =
  (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/+$/, '') + '/api/v1';

const TOKEN_COOKIE_NAME = 'token';

type RouteContext = { params: { id: string } };

/** Maps an upstream error to a client-facing message. */
async function forwardError(upstream: Response): Promise<NextResponse> {
  const body = (await upstream.json().catch(() => null)) as { message?: string } | null;
  const message =
    typeof body?.message === 'string' ? body.message : 'No se pudo completar la operación.';
  return NextResponse.json({ error: 'LINK_FAILED', message }, { status: upstream.status });
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
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

  const parsed = linkPatientAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Email inválido.',
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${API_BASE_URL}/patients/${context.params.id}/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('[patients/account] upstream network error:', error);
    return NextResponse.json(
      { error: 'UPSTREAM_UNREACHABLE', message: 'No se pudo contactar al servicio.' },
      { status: 503 },
    );
  }

  if (!upstreamResponse.ok) {
    return forwardError(upstreamResponse);
  }

  const json: unknown = await upstreamResponse.json();
  return NextResponse.json(json, { status: 200 });
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const token = cookies().get(TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { error: 'UNAUTHENTICATED', message: 'Necesitás iniciar sesión.' },
      { status: 401 },
    );
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${API_BASE_URL}/patients/${context.params.id}/account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch (error) {
    console.error('[patients/account] upstream network error:', error);
    return NextResponse.json(
      { error: 'UPSTREAM_UNREACHABLE', message: 'No se pudo contactar al servicio.' },
      { status: 503 },
    );
  }

  if (!upstreamResponse.ok) {
    return forwardError(upstreamResponse);
  }

  return new NextResponse(null, { status: 204 });
}
