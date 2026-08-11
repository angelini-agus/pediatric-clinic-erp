import { Stethoscope, Calendar, ArrowRight, User, FileText } from 'lucide-react';
import Link from 'next/link';

import { getAllMedicalRecords, type GlobalMedicalRecordResponse } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function formatDateTime(dateInput: Date | string) {
  const d = new Date(dateInput);
  const dateStr = d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return { dateStr, timeStr };
}

/**
 * ConsultationsPage — Server Component.
 * Route: /consultations
 *
 * Displays the global clinical evolutions history across all patients.
 */
export default async function ConsultationsPage() {
  const accessToken = getAuthToken();
  const records: GlobalMedicalRecordResponse[] = await getAllMedicalRecords(accessToken);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Stethoscope className="h-5 w-5 text-brand" />
            Historial de Consultas Médicas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro global e inalterable de evoluciones clínicas en la institución
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm border border-slate-100">
          <FileText className="h-3.5 w-3.5 text-brand" />
          <span>
            {records.length} {records.length === 1 ? 'Evolución Registrada' : 'Evoluciones Registradas'}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {records.length === 0 ? (
        /* Empty State */
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            <Stethoscope className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              No hay consultas registradas en el historial
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Las consultas y evoluciones médicas firmadas por los profesionales aparecerán listadas aquí automáticamente.
            </p>
          </div>
        </div>
      ) : (
        /* Glassmorphism Table/List Container */
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="px-6 py-4">Fecha y Hora</th>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Médico Tratante</th>
                  <th className="px-6 py-4">Diagnóstico Principal</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-sm">
                {records.map((record) => {
                  const { dateStr, timeStr } = formatDateTime(record.createdAt);
                  const patientName = `${record.patient.firstName} ${record.patient.lastName}`;

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-white/80 transition-colors group"
                    >
                      {/* Date & Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{dateStr}</p>
                            <p className="text-[11px] text-slate-400">{timeStr} hs</p>
                          </div>
                        </div>
                      </td>

                      {/* Patient Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{patientName}</p>
                            {record.patient.documentNumber && (
                              <p className="text-[11px] text-slate-400">
                                {record.patient.documentType || 'DNI'} {record.patient.documentNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Doctor Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-slate-700 text-xs">
                            Dr. {record.doctor.fullName}
                          </p>
                          {record.doctor.specialty && (
                            <p className="text-[11px] text-slate-400">
                              {record.doctor.specialty}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Diagnosis */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 max-w-xs truncate">
                          {record.diagnosis}
                        </span>
                      </td>

                      {/* Details Link */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/patients/${record.patient.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand/80 transition-colors bg-brand/5 hover:bg-brand/10 px-3 py-1.5 rounded-xl"
                        >
                          Ver Detalles
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
