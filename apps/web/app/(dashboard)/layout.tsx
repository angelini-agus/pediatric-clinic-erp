import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // h-screen + overflow-hidden: la página nunca hace scroll
    // p-6 en todos los lados: espacio uniforme con los bordes del viewport
    <div className="h-screen overflow-hidden bg-shell p-6">
      {/* Gran Tarjeta: difuminado de gris claro a gris oscuro con efecto de luces difusas */}
      <div className="relative flex h-full rounded-[2.5rem] shadow-card-shell overflow-hidden border border-white/80 bg-gradient-to-br from-[#FAFBFD] via-[#EFF2F8] to-[#D5DAE6]">
        {/* Efectos de luces y resplandores ambient de fondo (z-0) — detrás de toda la UI */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-white/50 rounded-full blur-3xl pointer-events-none -translate-y-1/3 z-0" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none translate-x-1/4 z-0" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-slate-300/25 rounded-full blur-3xl pointer-events-none translate-y-1/3 z-0" />

        {/* Capa principal de UI (z-10) — por encima de todas las luces de fondo */}
        <div className="relative z-10 flex h-full w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 pt-0 bg-transparent">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
