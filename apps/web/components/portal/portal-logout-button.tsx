'use client';

import { Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * PortalLogoutButton — closes the session (BFF POST /api/auth/logout clears
 * the httpOnly cookie) and returns to the login page.
 */
export function PortalLogoutButton(): React.JSX.Element {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      router.push('/login');
      router.refresh();
    } catch {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
      Salir
    </button>
  );
}
