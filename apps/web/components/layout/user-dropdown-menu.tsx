'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { Settings, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface UserDropdownMenuProps {
  variant?: 'sidebar' | 'header';
}

export function UserDropdownMenu({ variant = 'sidebar' }: UserDropdownMenuProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Delete the JWT token cookie
    deleteCookie('token', { path: '/' });
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirect to login and refresh page cache
    router.push('/login');
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'sidebar' ? (
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm hover:bg-white hover:shadow-md transition-all duration-150 text-left outline-none cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              DR
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                Dr. Ricardo Silva
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Pediatra · Mat. 48102
              </div>
            </div>
          </button>
        ) : (
          <button
            type="button"
            aria-label="Perfil de usuario"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0 hover:scale-105 transition-transform outline-none cursor-pointer"
          >
            RS
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={variant === 'sidebar' ? 'start' : 'end'}
        side={variant === 'sidebar' ? 'top' : 'bottom'}
        sideOffset={8}
        className="w-56 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl p-1.5"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <div className="font-semibold text-xs text-slate-900">Dr. Ricardo Silva</div>
          <div className="text-[10px] font-normal text-slate-500 lowercase">ricardo.silva@pediatric-erp.com</div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 focus:bg-slate-100/80 cursor-pointer"
          >
            <Settings className="h-4 w-4 text-slate-500 shrink-0" />
            <span>Configuración</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 focus:text-red-700 focus:bg-red-50/80 cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-red-500 shrink-0" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
