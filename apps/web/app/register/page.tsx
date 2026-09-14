'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type Register } from '@pediatric-erp/schemas';
import { HeartPulse, Loader2, LockKeyhole, Mail, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';

type RegisterFormValues = Register;

type RegisterPageState =
  { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; message: string };

/**
 * RegisterPage — Client Component.
 * Route: /register
 *
 * Alta de usuarios staff. Mismo flujo seguro que el login: envía a
 * `POST /api/auth/register` (BFF Route Handler) que:
 *  1. Llama al backend NestJS `POST /api/v1/auth/register`.
 *  2. Persiste el JWT devuelto en una cookie **httpOnly + secure + sameSite=lax**.
 *  3. Devuelve solo el `user` al cliente (nunca el token).
 *
 * El navegador NO toca cookies ni headers — todo se hace server-side.
 * Tras un registro exitoso, redirige al dashboard para auto-login.
 */
export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<RegisterPageState>({ kind: 'idle' });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onValid = async (values: RegisterFormValues): Promise<void> => {
    setState({ kind: 'submitting' });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setState({
          kind: 'error',
          message: data?.message ?? 'No se pudo completar el registro. Verificá los datos.',
        });
        return;
      }

      // Token guardado server-side en cookie httpOnly. Redirigir al ERP
      // hace que el middleware redirija correctamente si la sesión es válida.
      router.push('/dashboard');
      router.refresh();
    } catch {
      setState({
        kind: 'error',
        message: 'No se pudo conectar con el servidor. Intentá nuevamente.',
      });
    }
  };

  const triggerClass = (hasError: boolean): string =>
    cn(
      'w-full rounded-xl border bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand',
      hasError ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-slate-200',
    );

  const submitting = state.kind === 'submitting' || isFormSubmitting;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-shell p-6">
      {/* Ambient light blobs */}
      <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-24 h-[30rem] w-[30rem] rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl pointer-events-none" />

      {/* Glassmorphism card */}
      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-card-shell backdrop-blur-xl sm:p-10">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-indigo-500/30">
            <HeartPulse className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Crear cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registrate como profesional para acceder al ERP.
          </p>
        </div>

        {/* Top-level error */}
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
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Dr. Juan Pérez"
                {...register('fullName')}
                className={triggerClass(Boolean(errors.fullName))}
              />
            </div>
            {errors.fullName?.message && (
              <p className="text-xs text-rose-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Correo Electrónico <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="doctor@clinica.com"
                {...register('email')}
                className={triggerClass(Boolean(errors.email))}
              />
            </div>
            {errors.email?.message && (
              <p className="text-xs text-rose-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Contraseña <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                {...register('password')}
                className={triggerClass(Boolean(errors.password))}
              />
            </div>
            {errors.password?.message && (
              <p className="text-xs text-rose-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
              Confirmar Contraseña <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repetí la contraseña"
                {...register('confirmPassword')}
                className={triggerClass(Boolean(errors.confirmPassword))}
              />
            </div>
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
                Creando cuenta...
              </>
            ) : (
              'Registrarme'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          ¿Ya tenés cuenta?{' '}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:underline focus:outline-none focus:ring-2 focus:ring-brand/30 rounded"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
