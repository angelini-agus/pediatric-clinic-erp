'use client';

import { CalendarClock, ExternalLink, FileText, Loader2, Stethoscope, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { AppointmentStatusSelector } from '@/components/dashboard/appointment-status-selector';
import { MedicalRecordsTimeline } from '@/components/patients/medical-records-timeline';
import { NewMedicalRecordForm } from '@/components/patients/new-medical-record-form';
import { PrescriptionForm } from '@/components/patients/prescription-form';
import { Badge } from '@/components/ui/badge';
import { CLIENT_API_URL, medicalRecordResponseSchema } from '@/lib/api';
import { formatAge, formatGuardianDisplay } from '@/lib/patient-utils';
import { cn } from '@/lib/utils';

import type { AppointmentResponse, MedicalRecordResponse } from '@/lib/api';

type TodayWorklistProps = {
  appointments: AppointmentResponse[];
  /** Solo un DOCTOR puede firmar evoluciones y recetas. */
  canDocument: boolean;
  /** id del profesional logueado (req.user.sub) cuando es DOCTOR. */
  doctorId: string | null;
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * TodayWorklist — Client Component (workspace del profesional).
 *
 * Lista de turnos de hoy + panel de consulta embebido: al seleccionar un
 * paciente se muestra su contexto, el estado del turno, sus últimas
 * evoluciones y (para DOCTOR) los formularios de evolución y receta, sin
 * salir de la página.
 */
export function TodayWorklist({
  appointments,
  canDocument,
  doctorId,
}: TodayWorklistProps): React.JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [records, setRecords] = useState<MedicalRecordResponse[] | null>(null);

  const selected = appointments.find((a) => a.id === selectedId);

  // Carga las últimas evoluciones del paciente seleccionado (client-side,
  // vía el proxy same-origin que inyecta el Bearer de la cookie httpOnly).
  useEffect(() => {
    if (selected === undefined) {
      setRecords(null);
      return;
    }

    let cancelled = false;
    setRecords(null);

    const load = async (): Promise<void> => {
      try {
        const res = await fetch(`${CLIENT_API_URL}/patients/${selected.patientId}/records`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          if (!cancelled) setRecords([]);
          return;
        }

        const json: unknown = await res.json();
        const parsed = z.array(medicalRecordResponseSchema).safeParse(json);
        if (!cancelled) setRecords(parsed.success ? parsed.data : []);
      } catch {
        if (!cancelled) setRecords([]);
      }
    };

    void load();

    return (): void => {
      cancelled = true;
    };
  }, [selected]);

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/40 py-16 text-slate-400 backdrop-blur-sm">
        <CalendarClock className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
        <p className="text-sm font-medium text-slate-500">No hay turnos para hoy</p>
        <p className="text-xs text-slate-400">
          Los turnos agendados para hoy aparecerán acá para iniciar la consulta.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Worklist */}
      <div className="space-y-2 lg:col-span-5">
        {appointments.map((appointment) => {
          const isSelected = appointment.id === selectedId;
          return (
            <button
              key={appointment.id}
              type="button"
              onClick={() => {
                setSelectedId(isSelected ? null : appointment.id);
              }}
              className={cn(
                'w-full rounded-2xl border px-4 py-3 text-left shadow-sm backdrop-blur-xl transition',
                isSelected
                  ? 'border-brand/50 bg-white ring-2 ring-brand/20'
                  : 'border-slate-200/70 bg-white/70 hover:border-brand/30 hover:shadow-md',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-800">
                  {formatTime(appointment.dateTime)}
                </span>
                <Badge
                  variant={
                    appointment.status === 'REQUESTED'
                      ? 'requested'
                      : appointment.status === 'IN_PROGRESS'
                        ? 'inProgress'
                        : appointment.status === 'COMPLETED'
                          ? 'completed'
                          : appointment.status === 'CANCELED'
                            ? 'canceled'
                            : 'scheduled'
                  }
                  className="shrink-0"
                >
                  {appointment.status === 'REQUESTED'
                    ? 'Solicitado'
                    : appointment.status === 'IN_PROGRESS'
                      ? 'En curso'
                      : appointment.status === 'COMPLETED'
                        ? 'Completado'
                        : appointment.status === 'CANCELED'
                          ? 'Cancelado'
                          : 'Programado'}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {formatAge(appointment.patient.dateOfBirth)} ·{' '}
                {formatGuardianDisplay(
                  appointment.patient.guardianFullName,
                  appointment.patient.guardianRelationship,
                )}
              </p>
              <p className="mt-1 truncate text-xs text-slate-400">{appointment.type}</p>
            </button>
          );
        })}
      </div>

      {/* Consulta panel */}
      <div className="lg:col-span-7">
        {selected === undefined ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/40 p-8 text-center backdrop-blur-sm">
            <Stethoscope className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
            <p className="text-sm font-medium text-slate-500">
              Elegí un turno para abrir la consulta
            </p>
            <p className="text-xs text-slate-400">
              Vas a ver los datos del paciente, sus últimas evoluciones y los formularios.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Patient context */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {selected.patient.firstName} {selected.patient.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatAge(selected.patient.dateOfBirth)} ·{' '}
                      {formatGuardianDisplay(
                        selected.patient.guardianFullName,
                        selected.patient.guardianRelationship,
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AppointmentStatusSelector
                    appointmentId={selected.id}
                    currentStatus={selected.status}
                  />
                  <Link
                    href={`/patients/${selected.patientId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ficha completa
                  </Link>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-slate-50/80 px-3 py-2">
                <p className="text-xs font-semibold text-slate-600">{selected.type}</p>
                {selected.notes !== null && selected.notes !== undefined && (
                  <p className="mt-0.5 text-xs text-slate-500">{selected.notes}</p>
                )}
              </div>
            </div>

            {/* Documentation forms (DOCTOR only) */}
            {canDocument && doctorId !== null && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <NewMedicalRecordForm patientId={selected.patientId} doctorId={doctorId} />
                <PrescriptionForm patientId={selected.patientId} doctorId={doctorId} />
              </div>
            )}

            {/* Recent history */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700">Últimas evoluciones</h3>
              </div>
              {records === null ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/60 py-8 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando historial...
                </div>
              ) : (
                <MedicalRecordsTimeline records={records.slice(0, 3)} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
