import {
  getDashboardAnalytics,
  type DashboardAnalytics,
} from '@/lib/api';
import {
  UserCheck,
  Filter,
  FileWarning,
  CalendarX,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OperationalMetricsCards — Async Server Component.
 *
 * Fetches real-time analytics from GET /api/v1/analytics/dashboard
 * and renders 4 operational cards with glassmorphism design:
 *
 * 1. Próximo Paciente (Next Patient name, age, time)
 * 2. Embudo de Turnos (Total | Atendidos | En Espera)
 * 3. Evoluciones Pendientes (Legal alert for unsigned medical records)
 * 4. Ausentismos / Cancelados (Today's canceled appointments count)
 */
export async function OperationalMetricsCards() {
  const analytics: DashboardAnalytics | null = await getDashboardAnalytics();

  const nextAppt = analytics?.nextAppointment ?? null;
  const funnel = analytics?.appointmentFunnel ?? { total: 0, completed: 0, waiting: 0 };
  const unsignedRecords = analytics?.unsignedRecords ?? 0;
  const canceledToday = analytics?.canceledToday ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* ── CARD 1: Próximo Paciente ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2rem] border-none shadow-sm p-6 flex flex-col justify-between group transition-all duration-300 hover:bg-white/75 hover:shadow-md">
        {/* Decorative ambient blobs */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-violet-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600/90 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
              Próximo Paciente
            </span>
            {nextAppt && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Clock className="h-3 w-3" />
                {nextAppt.time}
              </span>
            )}
          </div>

          {nextAppt ? (
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {nextAppt.patient.fullName}
              </h3>
              <p className="text-xs font-semibold text-indigo-600/90 mt-0.5">
                {nextAppt.patient.age}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="truncate">Motivo: {nextAppt.type}</span>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-base font-semibold text-slate-700">
                Sin turnos pendientes
              </p>
              <p className="text-xs text-slate-400 mt-1">
                No hay más citas agendadas para el día de hoy.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── CARD 2: Embudo de Turnos ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2rem] border-none shadow-sm p-6 flex flex-col justify-between group transition-all duration-300 hover:bg-white/75 hover:shadow-md">
        {/* Decorative ambient blobs */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600/90 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-blue-500" />
              Embudo de Turnos
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full">
              Hoy
            </span>
          </div>

          <div className="pt-1">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <span>{funnel.total} Totales</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-600">{funnel.completed} Atendidos</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-600">{funnel.waiting} En Espera</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100/90 h-2.5 rounded-full overflow-hidden flex p-0.5 gap-0.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    funnel.total > 0
                      ? Math.round((funnel.completed / funnel.total) * 100)
                      : 0
                  }%`,
                }}
                title={`${funnel.completed} atendidos`}
              />
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    funnel.total > 0
                      ? Math.round((funnel.waiting / funnel.total) * 100)
                      : 0
                  }%`,
                }}
                title={`${funnel.waiting} en espera`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 text-center">
            <div className="bg-slate-50/80 rounded-xl p-1.5 border border-slate-100">
              <div className="text-xs font-semibold text-slate-400">Totales</div>
              <div className="text-sm font-bold text-slate-800">{funnel.total}</div>
            </div>
            <div className="bg-emerald-50/60 rounded-xl p-1.5 border border-emerald-100/60">
              <div className="text-xs font-semibold text-emerald-600">Atendidos</div>
              <div className="text-sm font-bold text-emerald-700">{funnel.completed}</div>
            </div>
            <div className="bg-amber-50/60 rounded-xl p-1.5 border border-amber-100/60">
              <div className="text-xs font-semibold text-amber-600">En Espera</div>
              <div className="text-sm font-bold text-amber-700">{funnel.waiting}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 3: Evoluciones Pendientes ───────────────────────────────── */}
      <div
        className={cn(
          'relative overflow-hidden backdrop-blur-xl rounded-[2rem] border-none shadow-sm p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md',
          unsignedRecords > 0
            ? 'bg-amber-50/50 border border-amber-200/50'
            : 'bg-white/60 hover:bg-white/75',
        )}
      >
        {/* Ambient alert background glow if unsignedRecords > 0 */}
        {unsignedRecords > 0 ? (
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-amber-400/25 blur-2xl pointer-events-none" />
        ) : (
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />
        )}

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5',
                unsignedRecords > 0 ? 'text-amber-700' : 'text-emerald-700',
              )}
            >
              {unsignedRecords > 0 ? (
                <FileWarning className="h-3.5 w-3.5 text-amber-600 animate-pulse-slow" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              )}
              Evoluciones Pendientes
            </span>
            {unsignedRecords > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Alerta Legal
              </span>
            )}
          </div>

          {unsignedRecords > 0 ? (
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                Tenés{' '}
                <span className="text-amber-700 font-bold bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                  {unsignedRecords}
                </span>{' '}
                {unsignedRecords === 1 ? 'paciente atendido' : 'pacientes atendidos'} hoy sin historia clínica firmada.
              </p>
              <p className="text-xs text-amber-700/80 mt-2 font-medium">
                Completá las evoluciones clínicas requeridas por Ley 26.529.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-emerald-800 leading-snug">
                Todas las historias clínicas del día están firmadas.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Cumplimiento legal al 100%.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── CARD 4: Ausentismos / Cancelados ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2rem] border-none shadow-sm p-6 flex flex-col justify-between group transition-all duration-300 hover:bg-white/75 hover:shadow-md">
        {/* Decorative ambient blobs */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-rose-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-orange-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600/90 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarX className="h-3.5 w-3.5 text-rose-500" />
              Ausentismos / Cancelados
            </span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              Hoy
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold text-slate-900 leading-none mb-1 flex items-baseline gap-2">
              <span>{canceledToday}</span>
              <span className="text-xs font-semibold text-slate-500">
                {canceledToday === 1 ? 'turno cancelado' : 'turnos cancelados'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Huecos disponibles en la agenda para reasignación de sobreturnos.
            </p>
          </div>

          <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Optimizá el tiempo de atención en clínica</span>
          </div>
        </div>
      </div>
    </div>
  );
}
