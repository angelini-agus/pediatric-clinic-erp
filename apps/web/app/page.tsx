import { redirect } from 'next/navigation';

/**
 * HomePage — the ERP moved to a private subdomain.
 *
 * The public landing page now lives in `apps/landing` (Astro, SEO-first).
 * `apps/web` is exclusively the private system, so the root path redirects
 * to the landing site. Override with NEXT_PUBLIC_LANDING_URL in production.
 */
export default function HomePage(): never {
  redirect(process.env['NEXT_PUBLIC_LANDING_URL'] ?? 'http://localhost:4321');
}
