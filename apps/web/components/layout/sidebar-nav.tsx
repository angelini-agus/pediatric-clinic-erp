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
    <nav className="space-y-1 px-1">
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
              // Pill shape — rounded-full en todos los estados
              'flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
              isActive
                // Pill activo: bg-white con sombra sutil
                ? 'bg-white text-brand font-semibold shadow-pill-active'
                : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0',
                isActive ? 'text-brand' : 'text-slate-400'
              )}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
