'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Turnos', href: '/turnos', icon: Calendar },
  { name: 'Historia Clínica', href: '/historia-clinica', icon: FileText },
  { name: 'Consultas', href: '/consultas', icon: Stethoscope },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (pathname === '/' && item.href === '/dashboard') ||
          (item.href !== '/dashboard' && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-white/90 text-brand font-semibold shadow-sm border border-white/70'
                : 'text-slate-700 hover:bg-white/50 hover:text-slate-950'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0',
                isActive ? 'text-brand' : 'text-slate-500'
              )}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
