import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // Sin bg-white ni bg-slate-50 — hereda el fondo radial del body
    <div className="min-h-screen flex">
      {/* Sidebar fija — sin border-r */}
      <Sidebar />

      {/* Contenedor principal */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
