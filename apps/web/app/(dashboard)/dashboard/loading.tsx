/**
 * loading.tsx — Next.js Suspense fallback for the Dashboard page.
 * Shows skeleton placeholders while TodaysBookingCard fetches appointments.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm p-5 h-[108px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 mb-3" />
            <div className="h-2.5 w-24 rounded bg-slate-100 mb-2" />
            <div className="h-6 w-16 rounded bg-slate-200 mb-2" />
            <div className="h-2 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Bookings table skeleton */}
      <div className="relative overflow-hidden bg-white/75 backdrop-blur-xl rounded-2xl shadow-sm p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-4 w-32 rounded bg-slate-200 mb-1.5" />
            <div className="h-3 w-48 rounded bg-slate-100" />
          </div>
          <div className="h-7 w-20 rounded-full bg-slate-100" />
        </div>

        {/* Table rows skeleton */}
        <div className="space-y-0">
          {/* Header row */}
          <div className="flex gap-4 pb-2 border-b border-slate-100 mb-1">
            {[100, 120, 140, 120, 120, 80].map((w, i) => (
              <div key={i} className="h-3 rounded bg-slate-100" style={{ width: w }} />
            ))}
          </div>
          {/* Data rows */}
          {Array.from({ length: 6 }).map((_, row) => (
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
    </div>
  );
}
