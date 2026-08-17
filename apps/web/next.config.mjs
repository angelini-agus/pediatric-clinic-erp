/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode activa doble rendering en desarrollo para detectar side-effects
  reactStrictMode: true,


  // Seguridad: headers HTTP en todas las rutas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
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
