'use client';

import { CalendarClock, Loader2, MessageCircle, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CLIENT_API_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

const WHATSAPP_LINK =
  'https://wa.me/5493413464378?text=' +
  encodeURIComponent('Hola, necesito vincular mi cuenta del portal.');

type OnboardingStep = 'choice' | 'existing' | 'new';

type PortalOnboardingProps = {
  /** Prefills the guardian field with the account holder name. */
  defaultGuardianName?: string | undefined;
};

const SEX_OPTIONS = [
  { value: 'FEMALE', label: 'Nena' },
  { value: 'MALE', label: 'Nene' },
  { value: 'OTHER', label: 'Otro' },
] as const;

const RELATIONSHIP_OPTIONS = [
  { value: 'MOTHER', label: 'Madre' },
  { value: 'FATHER', label: 'Padre' },
  { value: 'LEGAL_GUARDIAN', label: 'Tutor/a legal' },
  { value: 'OTHER', label: 'Otro' },
] as const;

/**
 * PortalOnboarding — Client Component.
 *
 * Shown to portal accounts without a linked patient record. Two paths:
 *  - "Ya me atendí": the clinic links the existing record (WhatsApp).
 *  - "Es la primera vez": self-onboarding — creates the patient record and
 *    links it to the account, so the user can request appointments
 *    immediately (no staff intervention).
 */
export function PortalOnboarding({
  defaultGuardianName,
}: PortalOnboardingProps): React.JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('choice');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [biologicalSex, setBiologicalSex] = useState<string>('FEMALE');
  const [guardianFullName, setGuardianFullName] = useState(defaultGuardianName ?? '');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState<string>('MOTHER');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`${CLIENT_API_URL}/portal/patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          firstName,
          lastName,
          ...(documentNumber.trim().length > 0 ? { documentNumber } : {}),
          dateOfBirth,
          biologicalSex,
          guardianFullName,
          guardianPhone,
          guardianRelationship,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setError(data?.message ?? 'No se pudo crear la ficha. Verificá los datos.');
        return;
      }

      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor. Intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';
  const labelClass = 'text-sm font-semibold text-slate-700';

  // ── Step 1: choose the path ─────────────────────────────────────────────
  if (step === 'choice') {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <CalendarClock className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-800">
            Tu cuenta todavía no está vinculada
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Para ver los turnos y sacar uno nuevo, primero necesitamos vincular tu cuenta con la
            ficha del paciente.
          </p>
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => {
              setStep('existing');
            }}
            className="rounded-2xl border border-slate-200 bg-white/70 px-5 py-4 text-left shadow-sm transition hover:border-brand/40 hover:shadow-md"
          >
            <span className="text-sm font-semibold text-slate-800">
              Ya me atendí en el consultorio
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              El consultorio vincula tu cuenta con la ficha que ya existe.
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('new');
            }}
            className="rounded-2xl border border-brand/30 bg-brand/5 px-5 py-4 text-left shadow-sm transition hover:border-brand/60 hover:shadow-md"
          >
            <span className="text-sm font-semibold text-brand-700">
              Es la primera vez en el consultorio
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              Completá los datos del paciente y sacá turno al toque.
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2a: existing patient → clinic links ────────────────────────────
  if (step === 'existing') {
    return (
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <MessageCircle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-800">Escribinos y lo vinculamos</h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Mandanos un mensaje por WhatsApp con el nombre y apellido del paciente. El consultorio
            vincula tu cuenta con su ficha y ya vas a poder ver los turnos.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <a
            href={WHATSAPP_LINK}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700"
          >
            <MessageCircle className="h-4 w-4" />
            Escribir por WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setStep('choice');
            }}
            className="text-xs font-semibold text-slate-500 underline-offset-2 hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2b: new patient → self-onboarding ──────────────────────────────
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Datos del paciente</h1>
        <p className="mt-1 text-sm text-slate-500">
          Con estos datos creamos la ficha. Lo que falte lo completamos en la primera visita.
        </p>
      </div>

      {error !== null && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-5 rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-card-shell backdrop-blur-xl sm:p-8"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="onb-firstName" className={labelClass}>
              Nombre <span className="text-rose-500">*</span>
            </label>
            <input
              id="onb-firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="onb-lastName" className={labelClass}>
              Apellido <span className="text-rose-500">*</span>
            </label>
            <input
              id="onb-lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
              }}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="onb-document" className={labelClass}>
              DNI <span className="font-normal text-slate-400">(si lo tenés a mano)</span>
            </label>
            <input
              id="onb-document"
              type="text"
              value={documentNumber}
              onChange={(e) => {
                setDocumentNumber(e.target.value);
              }}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="onb-birth" className={labelClass}>
              Fecha de nacimiento <span className="text-rose-500">*</span>
            </label>
            <input
              id="onb-birth"
              type="date"
              required
              value={dateOfBirth}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                setDateOfBirth(e.target.value);
              }}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="onb-sex" className={labelClass}>
            Sexo <span className="text-rose-500">*</span>
          </label>
          <select
            id="onb-sex"
            value={biologicalSex}
            onChange={(e) => {
              setBiologicalSex(e.target.value);
            }}
            className={cn(inputClass, 'bg-white')}
          >
            {SEX_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="onb-guardian" className={labelClass}>
              Nombre del tutor/a <span className="text-rose-500">*</span>
            </label>
            <input
              id="onb-guardian"
              type="text"
              required
              value={guardianFullName}
              onChange={(e) => {
                setGuardianFullName(e.target.value);
              }}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="onb-phone" className={labelClass}>
              Teléfono <span className="text-rose-500">*</span>
            </label>
            <input
              id="onb-phone"
              type="tel"
              required
              placeholder="+54 9 341 ..."
              value={guardianPhone}
              onChange={(e) => {
                setGuardianPhone(e.target.value);
              }}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="onb-relationship" className={labelClass}>
            Relación con el paciente <span className="text-rose-500">*</span>
          </label>
          <select
            id="onb-relationship"
            value={guardianRelationship}
            onChange={(e) => {
              setGuardianRelationship(e.target.value);
            }}
            className={cn(inputClass, 'bg-white')}
          >
            {RELATIONSHIP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setStep('choice');
            }}
            className="text-xs font-semibold text-slate-500 underline-offset-2 hover:underline"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando ficha...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Crear ficha y continuar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
