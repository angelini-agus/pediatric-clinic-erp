'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PatientResponse } from '@/lib/api';
import {
  Search,
  User,
  Shield,
  FileText,
  ChevronRight,
  UserX,
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

// ── Props ─────────────────────────────────────────────────────────────────────

interface PatientsGridProps {
  initialPatients: PatientResponse[];
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PatientsGrid({ initialPatients }: PatientsGridProps) {
  const [search, setSearch] = useState('');

  const filteredPatients = initialPatients.filter((patient) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const documentNumber = patient.documentNumber.toLowerCase();
    const guardian = patient.guardianFullName.toLowerCase();
    return (
      fullName.includes(query) ||
      documentNumber.includes(query) ||
      guardian.includes(query)
    );
  });

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, DNI o tutor..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all shadow-sm"
        />
      </div>

      {/* Grid */}
      {filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 bg-white/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
          <UserX className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <p className="text-sm font-medium text-slate-500">
            No se encontraron pacientes
          </p>
          <p className="text-xs text-slate-400">
            {search ? 'Intenta con otro término de búsqueda.' : 'No hay pacientes registrados en el sistema.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const age = formatAge(patient.dateOfBirth);
            const initials = getInitials(patient.firstName, patient.lastName);
            const guardianRel = formatGuardianRelationship(
              patient.guardianRelationship,
            );

            return (
              <div
                key={patient.id}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  {/* Header: Avatar + Name + Blood type */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand transition-colors">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {age} · {patient.biologicalSex === 'FEMALE' ? 'Femenino' : 'Masculino'}
                        </p>
                      </div>
                    </div>
                    {patient.bloodGroup && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                        <Droplets className="h-3 w-3" />
                        {patient.bloodGroup}
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        DNI: <strong className="font-semibold text-slate-700">{patient.documentNumber}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Tutor: {patient.guardianFullName} ({guardianRel})
                      </span>
                    </div>
                    {patient.healthInsurance && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {patient.healthInsurance}{' '}
                          {patient.healthInsurancePlan ? `(${patient.healthInsurancePlan})` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Button */}
                <Link
                  href={`/patients/${patient.id}`}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-brand hover:text-white text-brand text-xs font-semibold transition-all duration-150 shadow-xs"
                >
                  <span>Ver Historia Clínica</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
