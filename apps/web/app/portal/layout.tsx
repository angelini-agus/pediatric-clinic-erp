import { Activity } from 'lucide-react';
import Link from 'next/link';

import { PortalLogoutButton } from '@/components/portal/portal-logout-button';
import { PortalNav } from '@/components/portal/portal-nav';
import { decodeAuthPayload } from '@/lib/jwt';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Mi portal',
  description: 'Portal del paciente — turnos, perfil y contacto del consultorio.',
};

/**
 * PortalLayout — patient-facing shell (role PATIENT).
 *
 * Separate from the staff dashboard shell: patients never see the clinical
 * navigation. The middleware enforces authentication and role separation.
 */
export default function PortalLayout({ children }: { children: ReactNode }): React.JSX.Element {
  const user = decodeAuthPayload();

  return (
    <div className="min-h-screen bg-shell">
      <header className="border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/portal" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-700 text-white shadow-sm">
              <Activity className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div className="text-base font-bold leading-none tracking-tight text-slate-900">
              <span className="text-brand">Mi</span>radas
              <span className="ml-2 text-xs font-medium text-slate-400">Portal del paciente</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user !== null && (
              <span className="hidden text-xs font-medium text-slate-500 sm:block">
                {user.fullName}
              </span>
            )}
            <PortalLogoutButton />
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-2">
          <PortalNav />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
