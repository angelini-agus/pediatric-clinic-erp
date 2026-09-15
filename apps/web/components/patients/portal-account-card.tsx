'use client';

import { CheckCircle2, Loader2, Link2, Unlink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type PortalAccountCardProps = {
  patientId: string;
  linked: boolean;
  /** Email del tutor registrado en la ficha — se usa como sugerencia. */
  suggestedEmail?: string | null;
};

/**
 * PortalAccountCard — Client Component (staff side).
 *
 * Links the patient record to the PORTAL ACCOUNT OF THE GUARDIAN/PATIENT
 * (the email they used to register from the landing) — NOT the professional.
 * The actual authorization (SECRETARY/ADMIN/SUPER_ADMIN) is enforced by the API.
 */
export function PortalAccountCard({
  patientId,
  linked,
  suggestedEmail,
}: PortalAccountCardProps): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState(suggestedEmail ?? '');
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
            El tutor ya puede ingresar al portal con su cuenta para ver los turnos del paciente y
            solicitar nuevos.
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
            Pegá el email con el que el <strong>tutor del paciente</strong> se registró en el portal
            (desde la landing). Al vincular, esa cuenta va a poder ver los turnos y datos{' '}
            <strong>de este paciente</strong>. No es el email del profesional.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="email con el que se registró el tutor"
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
          {suggestedEmail !== null && suggestedEmail !== undefined && suggestedEmail.length > 0 && (
            <p className="text-xs text-slate-400">
              Email del tutor en la ficha: <span className="font-medium">{suggestedEmail}</span>
            </p>
          )}
        </form>
      )}
    </div>
  );
}
