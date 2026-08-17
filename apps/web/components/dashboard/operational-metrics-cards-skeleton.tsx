/**
 * OperationalMetricsCardsSkeleton — Skeleton fallback para Suspense.
 * Replica la grilla 1×4 de OperationalMetricsCards durante la carga.
 */
export function OperationalMetricsCardsSkeleton(): React.JSX.Element {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm p-6 h-[164px] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-slate-200" />
            <div className="h-5 w-14 rounded-full bg-slate-100" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-2 w-full rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
