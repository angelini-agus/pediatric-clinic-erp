'use client';

import { useState } from 'react';

import { Header } from '@/components/layout/header';
import { MobileSidebarDrawer } from '@/components/layout/mobile-sidebar-drawer';
import { Sidebar } from '@/components/layout/sidebar';

import type { AuthUser } from '@pediatric-erp/schemas';
import type { ReactNode } from 'react';

type DashboardShellProps = {
  readonly children: ReactNode;
  readonly user: AuthUser | null;
};

/**
 * DashboardShell — Client Component que coordina el estado del Drawer móvil.
 *
 * El Server Component padre (`DashboardLayout`) decodifica el JWT una sola
 * vez con `cookies()` y pasa el `user` resultante como prop; este Client
 * Component lo propaga a Header, Sidebar y MobileSidebarDrawer.
 */
export function DashboardShell({ children, user }: DashboardShellProps): React.JSX.Element {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-shell p-3 md:p-12">
      {/* Gran Tarjeta: halo radial en esquina inferior-izquierda con grises un 30% más claros */}
      <div className="relative flex h-full rounded-[1.5rem] md:rounded-[2.5rem] shadow-card-shell overflow-hidden bg-[radial-gradient(ellipse_at_bottom_left,_#FFFFFF_0%,_#F8FAFC_35%,_#EAEFF5_65%,_#DFE4EE_100%)]">
        {/* Blobs de luz suave ambiental (z-0) */}
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-white/70 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4 z-0" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none -translate-y-1/4 translate-x-1/4 z-0" />
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-white/50 rounded-full blur-3xl pointer-events-none -translate-y-1/3 -translate-x-1/4 z-0" />

        {/* Capa principal de UI (z-10) — sin bordes blancos rígidos */}
        <div className="relative z-10 flex h-full w-full">
          {/* Sidebar nativo — solo desktop */}
          <Sidebar user={user} />

          {/* Drawer móvil (overlay) — solo mobile */}
          <MobileSidebarDrawer
            open={isMobileNavOpen}
            onClose={() => {
              setIsMobileNavOpen(false);
            }}
            user={user}
          />

          <div className="flex-1 flex flex-col h-full min-w-0">
            <Header
              onMenuClick={() => {
                setIsMobileNavOpen(true);
              }}
              user={user}
            />

            {/* Cap ultrawide + scroll interno */}
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 md:pt-0 bg-transparent">
              <div className="max-w-screen-2xl mx-auto w-full">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
