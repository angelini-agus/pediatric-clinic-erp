/** @type {import('next').NextConfig} */

// En dev Next necesita 'unsafe-eval' (HMR) y websockets para el hot reload.
// En producción se endurece: sin 'unsafe-eval' y sin ws:.
const isDev = process.env.NODE_ENV !== 'production';

// CSP pragmática: todo mismo origen. `'unsafe-inline'` en script-src y
// style-src es necesario porque Next inyecta bootstrap inline y Tailwind
// usa estilos inline; no se permite ningún origen externo.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // HSTS solo en producción: en localhost sobre HTTP rompería el acceso.
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode activa doble rendering en desarrollo para detectar side-effects
  reactStrictMode: true,

  // No exponer la versión de Next en la respuesta (X-Powered-By)
  poweredByHeader: false,

  // Seguridad: headers HTTP en todas las rutas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Variables de entorno públicas (accesibles en el browser)
  // NUNCA poner secrets aquí
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  },
};

export default nextConfig;
