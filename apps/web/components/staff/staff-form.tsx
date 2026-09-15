'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { staffCreateSchema, type StaffCreate } from '@pediatric-erp/schemas';
import { CheckCircle2, Loader2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';

type StaffFormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; email: string; role: string }
  | { kind: 'error'; message: string };

const ROLE_OPTIONS: { value: StaffCreate['role']; label: string }[] = [
  { value: 'DOCTOR', label: 'Médico/a' },
  { value: 'SECRETARY', label: 'Secretario/a' },
  { value: 'ADMIN', label: 'Administrador/a' },
];

const ROLE_LABELS: Record<string, string> = {
  DOCTOR: 'Médico/a',
  SECRETARY: 'Secretario/a',
  ADMIN: 'Administrador/a',
};

/**
 * StaffForm — Client Component.
 *
 * Alta de profesionales (ADMIN/DOCTOR/SECRETARY) por un administrador.
 * Envía a `POST /api/staff` (BFF) que reenvía el token del admin al
 * backend NestJS. El admin conserva su sesión: la cookie no se modifica.
 */
export function StaffForm(): React.JSX.Element {
  const [state, setState] = useState<StaffFormState>({ kind: 'idle' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffCreate>({
    resolver: zodResolver(staffCreateSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'DOCTOR',
      specialty: '',
      medicalLicense: '',
    },
  });

  const onValid = async (values: StaffCreate): Promise<void> => {
    setState({ kind: 'submitting' });
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'same-origin',
      });

      const data = (await response.json().catch(() => null)) as {
        user?: { email: string; role: string };
        message?: string;
      } | null;

      if (!response.ok) {
        setState({
          kind: 'error',
          message: data?.message ?? 'No se pudo crear el profesional. Verificá los datos.',
        });
        return;
      }

      setState({
        kind: 'success',
        email: data?.user?.email ?? values.email,
        role: data?.user?.role ?? values.role,
      });
      reset();
    } catch {
      setState({
        kind: 'error',
        message: 'No se pudo conectar con el servidor. Intentá nuevamente.',
      });
    }
  };

  const submitting = state.kind === 'submitting' || isSubmitting;

  const inputClass = (hasError: boolean): string =>
    cn(
      'w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand',
      hasError ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-slate-200',
    );

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-card-shell backdrop-blur-xl">
      {state.kind === 'success' && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Profesional creado: <strong>{state.email}</strong> (
            {ROLE_LABELS[state.role] ?? state.role}). Ya puede iniciar sesión con la contraseña
            asignada.
          </span>
        </div>
      )}

      {state.kind === 'error' && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {state.message}
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(onValid)(e)} className="space-y-5" noValidate>
        {/* Nombre completo */}
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
            Nombre Completo <span className="text-rose-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Dra. Patricia Martinangelio"
            {...register('fullName')}
            className={inputClass(Boolean(errors.fullName))}
          />
          {errors.fullName?.message && (
            <p className="text-xs text-rose-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Correo Electrónico <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="profesional@dramartinangelio.com"
            {...register('email')}
            className={inputClass(Boolean(errors.email))}
          />
          {errors.email?.message && <p className="text-xs text-rose-500">{errors.email.message}</p>}
        </div>

        {/* Rol */}
        <div className="flex flex-col gap-2">
          <label htmlFor="role" className="text-sm font-semibold text-slate-700">
            Rol <span className="text-rose-500">*</span>
          </label>
          <select
            id="role"
            {...register('role')}
            className={inputClass(Boolean(errors.role))}
            defaultValue="DOCTOR"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.role?.message && <p className="text-xs text-rose-500">{errors.role.message}</p>}
        </div>

        {/* Especialidad (opcional) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="specialty" className="text-sm font-semibold text-slate-700">
            Especialidad <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="specialty"
            type="text"
            placeholder="Pediatra"
            {...register('specialty')}
            className={inputClass(Boolean(errors.specialty))}
          />
          {errors.specialty?.message && (
            <p className="text-xs text-rose-500">{errors.specialty.message}</p>
          )}
        </div>

        {/* Matrícula (opcional) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="medicalLicense" className="text-sm font-semibold text-slate-700">
            Matrícula <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="medicalLicense"
            type="text"
            placeholder="Mat. 19693"
            {...register('medicalLicense')}
            className={inputClass(Boolean(errors.medicalLicense))}
          />
          {errors.medicalLicense?.message && (
            <p className="text-xs text-rose-500">{errors.medicalLicense.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">
            Contraseña <span className="text-rose-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...register('password')}
            className={inputClass(Boolean(errors.password))}
          />
          {errors.password?.message && (
            <p className="text-xs text-rose-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirmar password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
            Confirmar Contraseña <span className="text-rose-500">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repetí la contraseña"
            {...register('confirmPassword')}
            className={inputClass(Boolean(errors.confirmPassword))}
          />
          {errors.confirmPassword?.message && (
            <p className="text-xs text-rose-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando profesional...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Crear profesional
            </>
          )}
        </button>
      </form>
    </div>
  );
}
