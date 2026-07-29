import type { MedicalRecordResponse } from '@/lib/api';
import { ClipboardList, Pill, Activity, Stethoscope } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(date: Date): { date: string; time: string } {
  return {
    date: date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

import type { LucideIcon } from 'lucide-react';

// ── Section block inside a record card ───────────────────────────────────────

function RecordSection({
  icon: Icon,
  title,
  content,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  content: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${accent}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-700">{content}</p>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 bg-white/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
      <ClipboardList className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
      <p className="text-sm font-medium text-slate-500">Sin historial clínico</p>
      <p className="text-xs text-slate-400">
        Las evoluciones registradas para este paciente aparecerán aquí.
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface MedicalRecordsTimelineProps {
  records: MedicalRecordResponse[];
}

export function MedicalRecordsTimeline({ records }: MedicalRecordsTimelineProps) {
  if (records.length === 0) return <EmptyTimeline />;

  return (
    <div className="relative flex flex-col gap-0">
      {/* Vertical timeline line */}
      <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand/40 via-violet-300/40 to-transparent" />

      {records.map((record, index) => {
        const { date, time } = formatDateTime(record.createdAt);
        const isFirst = index === 0;

        return (
          <div key={record.id} className="relative flex gap-4 pb-5">
            {/* Timeline dot */}
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                isFirst
                  ? 'bg-gradient-to-br from-brand to-violet-600'
                  : 'bg-white border-2 border-slate-200'
              }`}
            >
              <Stethoscope
                className={`h-4 w-4 ${isFirst ? 'text-white' : 'text-slate-400'}`}
              />
            </div>

            {/* Card */}
            <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3">
              {/* Header: date + doctor */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-500 capitalize">{date}</p>
                  <p className="text-[11px] text-slate-400">{time}</p>
                </div>
                {/* Doctor signature */}
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-brand">
                    Dr. {record.doctor.fullName}
                  </p>
                  {record.doctor.medicalLicense && (
                    <p className="text-[10px] text-slate-400">
                      {record.doctor.medicalLicense}
                    </p>
                  )}
                </div>
              </div>

              {/* Diagnosis — always present */}
              <RecordSection
                icon={Activity}
                title="Diagnóstico"
                content={record.diagnosis}
                accent="bg-indigo-50/70 border-indigo-100 text-indigo-700"
              />

              {/* Clinical notes — always present */}
              <RecordSection
                icon={ClipboardList}
                title="Notas Clínicas"
                content={record.notes}
                accent="bg-slate-50/70 border-slate-200 text-slate-600"
              />

              {/* Optional: Treatment */}
              {record.treatment && (
                <RecordSection
                  icon={Activity}
                  title="Tratamiento"
                  content={record.treatment}
                  accent="bg-teal-50/70 border-teal-100 text-teal-700"
                />
              )}

              {/* Optional: Prescription */}
              {record.prescription && (
                <RecordSection
                  icon={Pill}
                  title="Prescripción"
                  content={record.prescription}
                  accent="bg-violet-50/70 border-violet-100 text-violet-700"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
