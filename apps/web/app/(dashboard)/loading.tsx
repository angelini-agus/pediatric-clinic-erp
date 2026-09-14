/**
 * Dashboard Loading Boundary — `(dashboard)/loading.tsx`.
 *
 * Skeleton global que cubre la transición al navegar entre rutas del
 * dashboard. Mantiene el sidebar/header renderizados (esos son del layout
 * padre) y muestra placeholders para `children`.
 *
 * Nota: este es el fallback de Suspense a nivel de segmento. Las cards
 * individuales dentro de `/dashboard` usan sus propios skeletons más
 * detallados (ver `dashboard/loading.tsx` y los `<Suspense>` en su
 * `page.tsx`).
 */
export default function DashboardLoading(): React.JSX.Element {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-live="polite">
      {/* Page heading skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-slate-200" />
        <div className="h-4 w-72 rounded bg-slate-100" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex items-center gap-1 border-b border-slate-100">
        {[80, 96, 88, 104, 92].map((w, i) => (
          <div
            key={i}
            className="h-9 rounded-md bg-slate-100"
            style={{ width: `${String(w)}px` }}
          />
        ))}
      </div>

      {/* Generic content card */}
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-slate-200" />
            <div className="h-3 w-56 rounded bg-slate-100" />
          </div>
          <div className="h-7 w-24 rounded-full bg-slate-100" />
        </div>
        <div className="space-y-3">
          {[100, 92, 96, 88, 90].map((w, i) => (
            <div
              key={i}
              className="h-10 rounded-xl bg-slate-50 border border-slate-100"
              style={{ width: `${String(w)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
