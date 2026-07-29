import { getPatients } from '@/lib/api';
import { PatientsGrid } from '@/components/patients/patients-grid';
import { Users } from 'lucide-react';

// ── Disable caching for live data ──────────────────────────────────────────────
export const dynamic = 'force-dynamic';

/**
 * PatientsPage — Server Component.
 * Route: /patients
 *
 * Displays the complete list of pediatric patients registered in the clinic.
 */
export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="h-5 w-5 text-brand" />
            Pacientes Pediátricos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Listado completo de pacientes registrados y sus tutores
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm">
          <span>{patients.length} {patients.length === 1 ? 'Paciente' : 'Pacientes Registrados'}</span>
        </div>
      </div>

      {/* Grid with Live Search */}
      <PatientsGrid initialPatients={patients} />
    </div>
  );
}
