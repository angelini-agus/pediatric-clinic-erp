'use client';

import { Calendar, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Mis turnos', href: '/portal', icon: Calendar },
  { name: 'Mi perfil', href: '/portal/profile', icon: User },
  { name: 'Contacto', href: '/portal/contact', icon: MapPin },
];

export function PortalNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1" aria-label="Navegación del portal">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all',
              isActive
                ? 'bg-white text-brand shadow-sm'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900',
            )}
          >
            <Icon className={cn('h-4 w-4', isActive ? 'text-brand' : 'text-slate-400')} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
