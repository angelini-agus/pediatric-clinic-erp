'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePassword } from '@pediatric-erp/schemas';
import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';

type ChangePasswordState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

/**
 * ChangePasswordForm — Client Component.
 *
 * Cambio de contraseña del usuario autenticado. Envía a
 * `POST /api/auth/change-password` (BFF) que reenvía el token al backend
 * NestJS, donde se verifica la contraseña actual con bcrypt.
 *
 * El JWT actual sigue siendo válido hasta expirar: cambiar la contraseña
 * NO cierra la sesión abierta.
 */
export function ChangePasswordForm(): React.JSX.Element {
  const [state, setState] = useState<ChangePasswordState>({ kind: 'idle' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePassword>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onValid = async (values: ChangePassword): Promise<void> => {
    setState({ kind: 'submitting' });
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'same-origin',
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setState({
          kind: 'error',
          message: data?.message ?? 'No se pudo cambiar la contraseña. Verificá los datos.',
        });
        return;
      }

      setState({ kind: 'success' });
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
          <span>Contraseña actualizada correctamente.</span>
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
        {/* Contraseña actual */}
        <div className="flex flex-col gap-2">
          <label htmlFor="currentPassword" className="text-sm font-semibold text-slate-700">
            Contraseña actual <span className="text-rose-500">*</span>
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            placeholder="Tu contraseña actual"
            {...register('currentPassword')}
            className={inputClass(Boolean(errors.currentPassword))}
          />
          {errors.currentPassword?.message && (
            <p className="text-xs text-rose-500">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* Nueva contraseña */}
        <div className="flex flex-col gap-2">
          <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
            Nueva contraseña <span className="text-rose-500">*</span>
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...register('newPassword')}
            className={inputClass(Boolean(errors.newPassword))}
          />
          {errors.newPassword?.message && (
            <p className="text-xs text-rose-500">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirmar nueva contraseña */}
        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
            Confirmar nueva contraseña <span className="text-rose-500">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repetí la nueva contraseña"
            {...register('confirmPassword')}
            className={inputClass(Boolean(errors.confirmPassword))}
          />
          {errors.confirmPassword?.message && (
            <p className="text-xs text-rose-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Cambiando contraseña...
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </>
          )}
        </button>
      </form>
    </div>
  );
}
