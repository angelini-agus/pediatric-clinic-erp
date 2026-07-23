import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // h-screen + overflow-hidden: la página nunca hace scroll
    // p-12: el doble de distancia con los bordes de la pantalla (48px)
    <div className="h-screen overflow-hidden bg-shell p-12">
      {/* Gran Tarjeta: halo radial en esquina inferior-izquierda con grises un 30% más claros */}
      <div className="relative flex h-full rounded-[2.5rem] shadow-card-shell overflow-hidden bg-[radial-gradient(ellipse_at_bottom_left,_#FFFFFF_0%,_#F8FAFC_35%,_#EAEFF5_65%,_#DFE4EE_100%)]">
        {/* Blobs de luz suave ambiental (z-0) */}
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-white/70 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4 z-0" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none -translate-y-1/4 translate-x-1/4 z-0" />
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-white/50 rounded-full blur-3xl pointer-events-none -translate-y-1/3 -translate-x-1/4 z-0" />

        {/* Capa principal de UI (z-10) — sin bordes blancos rígidos */}
        <div className="relative z-10 flex h-full w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto no-scrollbar p-6 pt-0 bg-transparent">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
