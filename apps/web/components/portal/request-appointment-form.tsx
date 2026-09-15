'use client';

import { CalendarPlus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CLIENT_API_URL } from '@/lib/api';

/**
 * RequestAppointmentForm — Client Component.
 *
 * Sends an appointment request to the portal API (through the same-origin
 * proxy). The request is created with status REQUESTED and the clinic
 * confirms it — the patient never picks a doctor or another patient.
 */
export function RequestAppointmentForm(): React.JSX.Element {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(false);

    try {
      const dateTime = new Date(`${date}T${time}:00`).toISOString();
      const response = await fetch(`${CLIENT_API_URL}/portal/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          dateTime,
          type: reason,
          ...(notes.trim().length > 0 ? { notes } : {}),
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setError(data?.message ?? 'No se pudo enviar la solicitud. Intentá nuevamente.');
        return;
      }

      setSuccess(true);
      setDate('');
      setTime('');
      setReason('');
      setNotes('');
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor. Intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-card-shell backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <CalendarPlus className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">Solicitar un turno</h2>
          <p className="text-xs text-slate-400">
            Elegí el día y horario que te sirvan — el consultorio te confirma.
          </p>
        </div>
      </div>

      {success && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          ¡Solicitud enviada! El consultorio te va a confirmar el turno.
        </p>
      )}

      {error !== null && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="portal-date" className="text-sm font-semibold text-slate-700">
              Día <span className="text-rose-500">*</span>
            </label>
            <input
              id="portal-date"
              type="date"
              required
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                setDate(e.target.value);
              }}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="portal-time" className="text-sm font-semibold text-slate-700">
              Horario <span className="text-rose-500">*</span>
            </label>
            <input
              id="portal-time"
              type="time"
              required
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
              }}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="portal-reason" className="text-sm font-semibold text-slate-700">
            Motivo <span className="text-rose-500">*</span>
          </label>
          <input
            id="portal-reason"
            type="text"
            required
            maxLength={100}
            placeholder="Control, vacunación, consulta..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
            }}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="portal-notes" className="text-sm font-semibold text-slate-700">
            Notas <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="portal-notes"
            rows={2}
            maxLength={500}
            placeholder="Algo que quieras contarnos antes de la consulta"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
            }}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando solicitud...
            </>
          ) : (
            <>
              <CalendarPlus className="h-4 w-4" />
              Solicitar turno
            </>
          )}
        </button>
      </form>
    </div>
  );
}
