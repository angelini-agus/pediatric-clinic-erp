import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 *
 * Route Handler que invalida la sesión del usuario borrando la cookie httpOnly.
 * Responde 200 incluso si la cookie no existía (operación idempotente — no
 * filtra información sobre el estado de la sesión).
 *
 * Acepta POST y DELETE para soportar tanto el flujo del dropdown de UI
 * (`fetch(..., { method: 'POST' })`) como una eventual integración REST.
 */

const TOKEN_COOKIE_NAME = 'token';

export async function POST(): Promise<NextResponse> {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(): Promise<NextResponse> {
  return POST();
}
