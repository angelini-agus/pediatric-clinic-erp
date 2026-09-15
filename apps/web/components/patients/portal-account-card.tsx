'use client';

import { CheckCircle2, Loader2, Link2, Unlink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type PortalAccountCardProps = {
  patientId: string;
  linked: boolean;
};

/**
 * PortalAccountCard — Client Component (staff side).
 *
 * Shows whether the patient record has a portal account linked and lets
 * the staff link one by email or remove the association. The actual
 * authorization (SECRETARY/ADMIN/SUPER_ADMIN) is enforced by the API.
 */
export function PortalAccountCard({
  patientId,
  linked,
}: PortalAccountCardProps): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLink = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${patientId}/account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'same-origin',
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setError(data?.message ?? 'No se pudo vincular la cuenta.');
        return;
      }

      setEmail('');
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = async (): Promise<void> => {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${patientId}/account`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? 'No se pudo desvincular la cuenta.');
        return;
      }

      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl',
            linked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500',
          )}
        >
          {linked ? <CheckCircle2 className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Cuenta del portal</h3>
          <p className="text-xs text-slate-400">
            {linked ? 'Vinculada — el paciente puede ingresar' : 'Sin vincular'}
          </p>
        </div>
      </div>

      {error !== null && (
        <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {error}
        </p>
      )}

      {linked ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs leading-relaxed text-slate-500">
            El paciente ya puede ingresar al portal con su cuenta para ver sus turnos y la ubicación
            exacta del consultorio.
          </p>
          <button
            type="button"
            onClick={() => void handleUnlink()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Unlink className="h-3.5 w-3.5" />
            )}
            Desvincular cuenta
          </button>
        </div>
      ) : (
        <form onSubmit={(e) => void handleLink(e)} className="mt-4 space-y-3">
          <p className="text-xs leading-relaxed text-slate-500">
            El paciente debe registrarse primero desde la landing (o el login) con su email. Después
            vinculá esa cuenta acá para darle acceso a su portal.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="email@delpaciente.com"
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Link2 className="h-3.5 w-3.5" />
              )}
              Vincular
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
