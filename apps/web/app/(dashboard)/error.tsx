'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

type DashboardErrorProps = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Dashboard Error Boundary — `(dashboard)/error.tsx`.
 *
 * Next.js captura cualquier excepción lanzada en un Server Component hijo
 * y la muestra acá. Mantiene el shell del dashboard intacto (sidebar/header)
 * y ofrece un fallback actionable con botón de reintento.
 *
 * Reglas:
 *  - 'use client' obligatorio (Next.js requiere un Client Component para
 *    poder ejecutar `reset()`).
 *  - Log del error en `useEffect` (no durante render → evita loops).
 */
export default function DashboardError({ error, reset }: DashboardErrorProps): React.JSX.Element {
  useEffect(() => {
    console.error('[dashboard] route error:', error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center text-center px-6 py-16 min-h-[60vh]"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-rose-200/40 blur-2xl pointer-events-none" />
        <div className="relative w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-rose-500" strokeWidth={1.75} />
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-2">
        No pudimos cargar el panel
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        Ocurrió un error inesperado al obtener los datos. Puede ser un
        problema de conexión con el servidor. Intentá nuevamente y, si
        persiste, contactá al administrador.
      </p>

      {error.digest && (
        <p className="text-[11px] font-mono text-slate-400 mb-6">
          Código de error: {error.digest}
        </p>
      )}

      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  );
}
