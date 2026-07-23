import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-shell p-4">
      <div className="flex min-h-[calc(100vh-2rem)] bg-white rounded-[2.5rem] shadow-card-shell overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-full">
          <Header />
          <main className="flex-1 p-6 pt-0 bg-surface-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
