import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // h-screen + overflow-hidden: la página nunca hace scroll
    // p-6 en todos los lados: más espacio con los bordes del viewport
    <div className="h-screen overflow-hidden bg-shell p-6">
      {/* Gran Tarjeta: ocupa exactamente el espacio disponible */}
      <div className="flex h-full bg-white rounded-[2.5rem] shadow-card-shell overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full">
          <Header />
          {/* Solo el contenido interno hace scroll, no la página */}
          <main className="flex-1 overflow-y-auto p-6 pt-0 bg-surface-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
