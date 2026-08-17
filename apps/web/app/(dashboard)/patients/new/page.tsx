import { UserPlus } from 'lucide-react';

import { NewPatientForm } from '@/components/patients/new-patient-form';

// ── Disable caching (dynamic page with forms) ─────────────────────────────────
export const dynamic = 'force-dynamic';

/**
 * NewPatientPage — Server Component shell.
 * Route: /patients/new
 *
 * Aloja el formulario de alta de pacientes pediátricos. Se eligió ruta
 * (en lugar de un Dialog) para que la URL sea compartible, el botón "atrás"
 * del navegador funcione y el alta sea deep-linkable.
 */
export default function NewPatientPage(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-fade-in pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Nuevo Paciente
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registrá un nuevo paciente pediátrico y su tutor responsable.
          </p>
        </div>
      </div>

      {/* Glassmorphism card */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border-none shadow-sm p-6 md:p-8">
        <NewPatientForm />
      </div>
    </div>
  );
}
