/**
 * TodaysBookingCardSkeleton — Skeleton fallback para Suspense.
 * Replica el card de "Turnos de Hoy" mientras se cargan los appointments.
 */
export function TodaysBookingCardSkeleton(): React.JSX.Element {
  return (
    <div
      className="relative overflow-hidden bg-white/75 backdrop-blur-xl rounded-2xl shadow-sm p-5 animate-pulse"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-3 w-48 rounded bg-slate-100" />
        </div>
        <div className="h-7 w-20 rounded-full bg-slate-100" />
      </div>

      <div className="space-y-0">
        {/* Header row */}
        <div className="flex gap-4 pb-2 border-b border-slate-100 mb-1">
          {[100, 120, 140, 120, 120, 80].map((w, i) => (
            <div key={i} className="h-3 rounded bg-slate-100" style={{ width: w }} />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div
            key={row}
            className="flex gap-4 items-center py-3 border-b border-slate-50 last:border-0"
          >
            <div className="h-4 w-[100px] rounded bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-slate-200" />
              <div className="h-2.5 w-16 rounded bg-slate-100" />
            </div>
            <div className="h-3 w-[140px] rounded bg-slate-100 shrink-0" />
            <div className="h-3 w-[120px] rounded bg-slate-100 shrink-0" />
            <div className="h-3 w-[120px] rounded bg-slate-100 shrink-0" />
            <div className="h-5 w-20 rounded-full bg-slate-100 shrink-0 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
