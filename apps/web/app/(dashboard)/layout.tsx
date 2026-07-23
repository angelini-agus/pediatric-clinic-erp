import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // h-screen + overflow-hidden: la página nunca hace scroll
    // p-6 en todos los lados: espacio uniforme con los bordes del viewport
    <div className="h-screen overflow-hidden bg-shell p-6">
      {/* Gran Tarjeta: fondo con patrón de sombras suaves diagonales estilo ola/humo en escala de grises-azulados */}
      <div className="relative flex h-full rounded-[2.5rem] shadow-card-shell overflow-hidden bg-[linear-gradient(125deg,#E8EDF5_0%,#CFD6E4_22%,#6B7A8F_48%,#526073_56%,#8E9CAE_78%,#CAD3E1_100%)]">
        {/* Banda diagonal de sombra sutil ambiental */}
        <div className="absolute top-1/2 left-1/2 w-[150%] h-[450px] -translate-x-1/2 -translate-y-1/2 -rotate-[22deg] bg-slate-900/15 blur-3xl pointer-events-none z-0" />
        {/* Resplandor de luz suave en zona superior-izquierda */}
        <div className="absolute -top-20 left-1/4 w-[650px] h-[400px] bg-white/35 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Capa principal de UI (z-10) — sin bordes blancos rígidos */}
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
