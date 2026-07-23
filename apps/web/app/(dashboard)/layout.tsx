import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // h-screen + overflow-hidden: la página nunca hace scroll
    // p-6 en todos los lados: espacio uniforme con los bordes del viewport
    <div className="h-screen overflow-hidden bg-shell p-6">
      {/* Gran Tarjeta: difuminado de gris claro a gris oscuro con efecto de luces difusas */}
      {/* Halo radial: origen en esquina inferior-izquierda → se difumina hacia las otras tres esquinas */}
      <div className="relative flex h-full rounded-[2.5rem] shadow-card-shell overflow-hidden border border-white/60 bg-[radial-gradient(ellipse_at_bottom_left,_#FFFFFF_0%,_#F0F3FA_35%,_#D8DCE9_65%,_#C8CEDF_100%)]">
        {/* Blob principal: fuente del halo en esquina inferior-izquierda */}
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-white/60 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4 z-0" />
        {/* Blob secundario: se proyecta hacia esquina superior-derecha */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-400/15 rounded-full blur-3xl pointer-events-none -translate-y-1/4 translate-x-1/4 z-0" />
        {/* Esquina superior-izquierda: fría y oscura */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-slate-300/20 rounded-full blur-3xl pointer-events-none -translate-y-1/3 -translate-x-1/4 z-0" />

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
