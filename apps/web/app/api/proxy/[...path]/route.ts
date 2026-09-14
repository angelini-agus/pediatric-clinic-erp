import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * API Proxy — `/api/proxy/[...path]`
 *
 * Catch-all Route Handler que actúa como pasarela entre el navegador y el
 * backend NestJS. Resuelve el problema de las cookies httpOnly: el cliente
 * no puede leer el JWT desde `document.cookie` ni enviarlo en headers, así
 * que **toda llamada autenticada desde el cliente debe pasar por acá**.
 *
 * Flujo:
 *   1. Recibe la request del cliente (mismo origen → cookie httpOnly viaja
 *      automáticamente en headers, pero la **eliminamos** explícitamente
 *      para no reenviarla al backend).
 *   2. Lee el JWT desde `cookies()` server-side (única fuente válida).
 *   3. Reenvía la petición al backend NestJS inyectando
 *      `Authorization: Bearer <token>`.
 *   4. Devuelve la respuesta (status + headers + body) de forma
 *      **transparente** — sin buffering para soportar PDF blobs y respuestas
 *      grandes.
 *
 * URL mapping:
 *   GET /api/proxy/v1/patients/abc → GET http://localhost:3001/api/v1/patients/abc
 *   POST /api/proxy/v1/appointments → POST http://localhost:3001/api/v1/appointments
 *
 * Seguridad:
 *   - Filtra headers hop-by-hop y `cookie` (no se reenvía la sesión al backend).
 *   - Requiere token válido; sin él responde 401 sin tocar el upstream.
 *   - Runtime forzado a Node.js para soportar streaming body (`duplex: 'half'`).
 */

// El runtime Edge NO soporta ReadableStream en el body de fetch; forzamos Node.
export const runtime = 'nodejs';

const TOKEN_COOKIE_NAME = 'token';

const BACKEND_BASE_URL = (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001').replace(
  /\/+$/,
  '',
);

/**
 * Headers que NO deben reenviarse al upstream ni al cliente.
 * - Hop-by-hop (RFC 7230 §6.1) son específicos de la conexión actual.
 * - `cookie`: se elimina por seguridad — la autenticación viaja SOLO vía
 *   `Authorization: Bearer`, no queremos exponer la cookie al backend.
 * - `host`/`content-length`: los reescribe automáticamente `fetch`.
 */
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'cookie',
  'host',
  'content-length',
]);

function copyHeadersExcept(source: Headers, exclude: ReadonlySet<string>): Headers {
  const out = new Headers();
  source.forEach((value, key) => {
    if (!exclude.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  return out;
}

type RouteContext = {
  params: { path: string[] };
};

async function handle(request: Request, context: RouteContext): Promise<Response> {
  const targetPath = context.params.path.join('/');
  if (!targetPath) {
    return NextResponse.json(
      { error: 'INVALID_PATH', message: 'Proxy path is required.' },
      { status: 400 },
    );
  }

  // Preservamos querystring del cliente (ej: ?status=SCHEDULED&limit=20)
  const search = new URL(request.url).search;
  const targetUrl = `${BACKEND_BASE_URL}/api/${targetPath}${search}`;

  const token = cookies().get(TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { error: 'UNAUTHENTICATED', message: 'No hay sesión activa.' },
      { status: 401 },
    );
  }

  const method = request.method.toUpperCase();
  const headers = copyHeadersExcept(request.headers, HOP_BY_HOP_HEADERS);
  headers.set('Authorization', `Bearer ${token}`);

  // `RequestInit & { duplex }` — `duplex: 'half'` es requerido por undici
  // (fetch de Node) cuando el body es un ReadableStream. TypeScript no lo
  // incluye en el tipo estándar todavía.
  const init: RequestInit & { duplex?: 'half' } = {
    method,
    headers,
    cache: 'no-store',
  };

  const canHaveBody = method !== 'GET' && method !== 'HEAD';
  if (canHaveBody && request.body !== null) {
    init.body = request.body;
    init.duplex = 'half';
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, init);
  } catch (error) {
    console.error(`[proxy] ${method} ${targetUrl} upstream error:`, error);
    return NextResponse.json(
      { error: 'UPSTREAM_UNREACHABLE', message: 'No se pudo contactar al servicio.' },
      { status: 503 },
    );
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: copyHeadersExcept(upstream.headers, HOP_BY_HOP_HEADERS),
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
