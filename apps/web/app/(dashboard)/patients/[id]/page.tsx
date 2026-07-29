import { getPatient, getMedicalRecords, getTodaysAppointments } from '@/lib/api';
import { PatientProfileCard } from '@/components/patients/patient-profile-card';
import { NewMedicalRecordForm } from '@/components/patients/new-medical-record-form';
import { MedicalRecordsTimeline } from '@/components/patients/medical-records-timeline';
import { UserX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ── Disable aggressive caching for live medical data ─────────────────────────
export const dynamic = 'force-dynamic';

interface PatientPageProps {
  params: {
    id: string;
  };
}

/**
 * PatientPage — Server Component.
 * Dynamic route: /patients/[id]
 *
 * Fetches:
 *  1. Patient metadata (GET /api/v1/patients/:id)
 *  2. Immutable medical history (GET /api/v1/patients/:id/medical-records)
 *
 * Layout:
 *  - Left column (col-span-4): Patient Profile Card with personal & clinical details
 *  - Right column (col-span-8): New evolution form + Medical Records timeline
 */
export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = params;

  // Concurrent server-side fetches
  const [patient, medicalRecords, appointments] = await Promise.all([
    getPatient(id),
    getMedicalRecords(id),
    getTodaysAppointments(),
  ]);

  // ── Patient Not Found State ────────────────────────────────────────────────
  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
          <UserX className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Paciente No Encontrado</h2>
          <p className="text-sm text-slate-400 mt-1">
            El registro del paciente solicitado no existe o fue eliminado.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline mt-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  // Doctor ID from real DB doctor user (Dr. Ricardo Silva)
  const doctorId = appointments[0]?.doctor.id ?? 'clxxxxxxxxxxxxxxxxxxxxxxxx';

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header back button & title */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al Dashboard
        </Link>
        <span className="text-xs font-semibold text-slate-400 bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-sm">
          Historia Clínica N° {patient.documentNumber}
        </span>
      </div>

      {/* Grid Layout (4 cols left / 8 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Profile Card (col-span-4) */}
        <div className="lg:col-span-4">
          <PatientProfileCard patient={patient} />
        </div>

        {/* Right Column: New Evolution Form + Timeline (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* New Evolution Form (Collapsible Client Component) */}
          <NewMedicalRecordForm
            patientId={patient.id}
            doctorId={doctorId}
          />

          {/* Clinical History Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">
                Historial Clínico (Evoluciones)
              </h2>
              <span className="text-xs font-semibold text-slate-400 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                {medicalRecords.length}{' '}
                {medicalRecords.length === 1 ? 'Registro' : 'Registros'}
              </span>
            </div>

            <MedicalRecordsTimeline records={medicalRecords} />
          </div>
        </div>
      </div>
    </div>
  );
}
