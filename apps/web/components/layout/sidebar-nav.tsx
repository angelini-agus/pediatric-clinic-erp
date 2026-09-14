'use client';

import { LayoutDashboard, Users, Calendar, Stethoscope, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/patients', icon: Users },
  { name: 'Turnos', href: '/appointments', icon: Calendar },
  { name: 'Consultas', href: '/consultations', icon: Stethoscope },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export function SidebarNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (pathname === '/' && item.href === '/dashboard') ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-white/90 text-brand font-semibold shadow-sm'
                : 'text-slate-700 hover:bg-white/50 hover:text-slate-950',
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-brand' : 'text-slate-500')} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
