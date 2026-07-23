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
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-brand-50 text-brand font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
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
