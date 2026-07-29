import type { PatientResponse } from '@/lib/api';
import {
  User,
  Phone,
  Heart,
  Shield,
  Baby,
  FileText,
  Droplets,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAge(dateOfBirth: Date): string {
  const now = new Date();
  const months =
    (now.getFullYear() - dateOfBirth.getFullYear()) * 12 +
    (now.getMonth() - dateOfBirth.getMonth());
  if (months < 24) return `${months} meses`;
  return `${Math.floor(months / 12)} años`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatGuardianRelationship(rel: string): string {
  const map: Record<string, string> = {
    MOTHER: 'Madre',
    FATHER: 'Padre',
    GRANDMOTHER: 'Abuela',
    GRANDFATHER: 'Abuelo',
    GUARDIAN: 'Tutor Legal',
    OTHER: 'Otro',
  };
  return map[rel] ?? rel;
}

import type { LucideIcon } from 'lucide-react';

// ── Data Row ──────────────────────────────────────────────────────────────────

function DataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
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

interface PatientProfileCardProps {
  patient: PatientResponse;
}

export function PatientProfileCard({ patient }: PatientProfileCardProps) {
  const age = formatAge(patient.dateOfBirth);
  const initials = getInitials(patient.firstName, patient.lastName);
  const sexLabel = patient.biologicalSex === 'FEMALE' ? 'Femenino' : 'Masculino';
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
          <p className="text-sm text-slate-500 mt-0.5">{age} · {sexLabel}</p>
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
        <DataRow icon={FileText} label="DNI" value={`${patient.documentType} ${patient.documentNumber}`} />
        <DataRow icon={Baby} label="Fecha de Nacimiento" value={formatDate(patient.dateOfBirth)} />
        {patient.gestationalWeeks && (
          <DataRow
            icon={Baby}
            label="Semanas Gestacionales"
            value={`${patient.gestationalWeeks} semanas`}
          />
        )}
        {patient.birthWeightGrams && (
          <DataRow
            icon={Baby}
            label="Peso al Nacer"
            value={`${(patient.birthWeightGrams / 1000).toFixed(2)} kg`}
          />
        )}
        {patient.apgarScore && (
          <DataRow icon={Heart} label="Apgar" value={patient.apgarScore} />
        )}
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
        <DataRow
          icon={User}
          label={guardianRel}
          value={patient.guardianFullName}
        />
        <DataRow icon={Phone} label="Teléfono" value={patient.guardianPhone} />
        {patient.guardianEmail && (
          <DataRow icon={Phone} label="Email" value={patient.guardianEmail} />
        )}
      </div>
    </div>
  );
}
