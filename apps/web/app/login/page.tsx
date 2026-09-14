'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { HeartPulse, Loader2, LockKeyhole, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';

/**
 * LoginFormSchema — schema cliente (validación UX en español).
 *
 * El backend re-valida con `loginSchema` (en `@pediatric-erp/schemas`); este
 * schema local solo aporta mensajes amigables y la normalización
 * (trim + lowercase) que el BFF Route Handler espera.
 */
const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'El correo electrónico es obligatorio').email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .max(200, 'La contraseña es demasiado larga'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

type LoginPageState =
  { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; message: string };

/**
 * LoginPage — Client Component.
 * Route: /login
 *
 * Envía credenciales a POST /api/auth/login (Route Handler BFF) que se
 * encarga de llamar al backend NestJS y persistir el JWT en una cookie
 * **httpOnly + secure + sameSite=lax** (inaccesible desde JS — mitiga
 * XSS token theft). El cliente solo recibe el `user` y redirige al dashboard.
 *
 * El navegador NUNCA toca `document.cookie` ni el token — todo se hace
 * server-side en el Route Handler.
 */
export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<LoginPageState>({ kind: 'idle' });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onValid = async (values: LoginFormValues): Promise<void> => {
    setState({ kind: 'submitting' });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setState({
          kind: 'error',
          message: data?.message ?? 'Credenciales inválidas. Verificá el correo y la contraseña.',
        });
        return;
      }

      // El token queda en una cookie httpOnly; aquí solo validamos que
      // la respuesta es JSON y descartamos el payload.
      await response.json().catch(() => null);

      router.push('/dashboard');
      router.refresh();
    } catch {
      setState({
        kind: 'error',
        message: 'No se pudo conectar con el servidor. Intentá nuevamente.',
      });
    }
  };

  const submitting = state.kind === 'submitting' || isSubmitting;

  const triggerClass = (hasError: boolean): string =>
    cn(
      'w-full rounded-xl border bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand',
      hasError ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-slate-200',
    );

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Miradas</h1>
          <p className="mt-1 text-sm text-slate-500">Consultorios de Pediatría Integral</p>
        </div>

        {/* Top-level error */}
        {state.kind === 'error' && (
          <div
            role="alert"
            data-testid="login-error"
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-700"
          >
            {state.message}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(onValid)(e)} className="space-y-5" noValidate>
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@admin.com"
                data-testid="login-email"
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
              Contraseña
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                data-testid="login-password"
                {...register('password')}
                className={triggerClass(Boolean(errors.password))}
              />
            </div>
            {errors.password?.message && (
              <p className="text-xs text-rose-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            data-testid="login-submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          ¿Sos profesional nuevo?{' '}
          <Link
            href="/register"
            className="font-semibold text-brand-600 hover:underline focus:outline-none focus:ring-2 focus:ring-brand/30 rounded"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
