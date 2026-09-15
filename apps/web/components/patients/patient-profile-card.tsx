import {
  Baby,
  Droplets,
  FileText,
  Heart,
  Phone,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react';

import {
  formatAge,
  formatBiologicalSex,
  formatGuardianRelationship,
  getInitials,
  formatDate,
} from '@/lib/patient-utils';

import type { PatientResponse } from '@/lib/api';

// ── Data Row ──────────────────────────────────────────────────────────────────

function DataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
}): React.JSX.Element | null {
  if (!value) {
    return null;
  }
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-100 last:border-0">
      <div className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-brand" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-800 leading-snug">{value}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type PatientProfileCardProps = {
  patient: PatientResponse;
};

export function PatientProfileCard({ patient }: PatientProfileCardProps): React.JSX.Element {
  const age = formatAge(patient.dateOfBirth);
  const initials = getInitials(patient.firstName, patient.lastName);
  const sexLabel = formatBiologicalSex(patient.biologicalSex);
  const guardianRel = formatGuardianRelationship(patient.guardianRelationship);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border-none p-6 flex flex-col gap-5">
      {/* Avatar + name */}
      <div className="flex flex-col items-center text-center gap-3 pb-5 border-b border-slate-100">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
          {initials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {age} · {sexLabel}
          </p>
        </div>
        {patient.bloodGroup && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
            <Droplets className="h-3 w-3" />
            {patient.bloodGroup}
          </span>
        )}
      </div>

      {/* Patient data */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Datos del Paciente
        </p>
        <DataRow
          icon={FileText}
          label="DNI"
          value={
            patient.documentNumber !== null && patient.documentNumber !== undefined
              ? `${patient.documentType} ${patient.documentNumber}`
              : 'Sin documento (completar)'
          }
        />
        <DataRow icon={Baby} label="Fecha de Nacimiento" value={formatDate(patient.dateOfBirth)} />
        {patient.gestationalWeeks && (
          <DataRow
            icon={Baby}
            label="Semanas Gestacionales"
            value={`${String(patient.gestationalWeeks)} semanas`}
          />
        )}
        {patient.birthWeightGrams && (
          <DataRow
            icon={Baby}
            label="Peso al Nacer"
            value={`${(patient.birthWeightGrams / 1000).toFixed(2)} kg`}
          />
        )}
        {patient.apgarScore && <DataRow icon={Heart} label="Apgar" value={patient.apgarScore} />}
      </div>

      {/* Obra social */}
      {patient.healthInsurance && (
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Cobertura Médica
          </p>
          <DataRow icon={Shield} label="Obra Social" value={patient.healthInsurance} />
          {patient.healthInsurancePlan && (
            <DataRow icon={Shield} label="Plan" value={patient.healthInsurancePlan} />
          )}
          {patient.healthInsuranceNumber && (
            <DataRow icon={Shield} label="Nro. Afiliado" value={patient.healthInsuranceNumber} />
          )}
        </div>
      )}

      {/* Guardian */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Tutor Responsable
        </p>
        <DataRow icon={User} label={guardianRel} value={patient.guardianFullName} />
        <DataRow icon={Phone} label="Teléfono" value={patient.guardianPhone} />
        {patient.guardianEmail && (
          <DataRow icon={Phone} label="Email" value={patient.guardianEmail} />
        )}
      </div>
    </div>
  );
}
