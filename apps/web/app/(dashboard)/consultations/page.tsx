import { Construction, Stethoscope } from 'lucide-react';

/**
 * ConsultationsPage — Server Component.
 * Route: /consultations
 *
 * Módulo **no implementado todavía**: el sidebar apunta a esta ruta pero
 * el feature de consultas clínicas (gestión de evoluciones desde el
 * punto de vista del profesional) está pendiente. Mostramos un Empty State
 * elegante en lugar de un 404 para que la navegación nunca rompa.
 *
 * Cuando se implemente el feature, este archivo se reemplazará por la
 * página real (lista de evoluciones + formulario de carga).
 */
export default function ConsultationsPage(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Consultas Médicas</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evoluciones clínicas y seguimiento de pacientes
          </p>
        </div>
      </div>

      {/* Empty State / Placeholder */}
      <div
        className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100/80 p-10 md:p-16"
        role="status"
        aria-live="polite"
      >
        {/* Decorative ambient blobs */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-violet-100/30 blur-3xl" />

        <div className="relative flex flex-col items-center text-center max-w-md mx-auto gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-200/40 blur-2xl pointer-events-none" />
            <div className="relative w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Construction className="h-10 w-10 text-amber-500" strokeWidth={1.75} />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              Módulo en construcción
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              El flujo completo de consultas, evoluciones y firma de
              historias clínicas está siendo desarrollado. Mientras
              tanto, podés acceder a las evoluciones de cada paciente
              desde su historia clínica individual.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Próximamente
          </div>
        </div>
      </div>
    </div>
  );
}
