import { CalendarDays, Clock, CalendarOff } from 'lucide-react';
import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getTodaysAppointments } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { formatAge, formatGuardianDisplay } from '@/lib/patient-utils';

import { AppointmentStatusSelector } from './appointment-status-selector';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formats a Date to "HH:MM AM/PM" string (local 12h time).
 * e.g. 2026-07-29T12:00:00Z → "09:00 AM" (UTC-3)
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
      <CalendarOff className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
      <p className="text-sm font-medium text-slate-500">No hay turnos para hoy</p>
      <p className="text-xs text-slate-400">Los turnos agendados para hoy aparecerán aquí.</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

/**
 * TodaysBookingCard — Server Component.
 * Fetches today's active appointments from the NestJS API and renders them
 * in a table with dynamic status badges and real patient/doctor data.
 */
export async function TodaysBookingCard(): Promise<React.JSX.Element> {
  const appointments = await getTodaysAppointments(getAuthToken());

  return (
    <div
      className="relative overflow-hidden backdrop-blur-xl rounded-2xl shadow-sm p-5 will-change-transform"
      style={{
        background:
          'radial-gradient(ellipse at 105% -5%, rgba(99,102,241,0.14) 0%, rgba(255,255,255,0.75) 50%)',
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="h-[18px] w-[18px] text-brand" />
              Turnos de Hoy
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Pacientes citados para la fecha actual</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>
              {appointments.length} {appointments.length === 1 ? 'Turno' : 'Turnos'}
            </span>
          </div>
        </div>

        {appointments.length === 0 ? (
          <EmptyState />
        ) : (
          <Table data-testid="todays-bookings-table">
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="w-[100px] text-slate-400">Hora</TableHead>
                <TableHead className="text-slate-400">Paciente</TableHead>
                <TableHead className="text-slate-400">Tutor Responsable</TableHead>
                <TableHead className="text-slate-400">Motivo / Tipo</TableHead>
                <TableHead className="text-slate-400">Atendido por</TableHead>
                <TableHead className="text-right text-slate-400">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow
                  key={appt.id}
                  className="border-slate-50 hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell className="font-semibold text-slate-700">
                    {formatTime(appt.dateTime)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/patients/${appt.patient.id}`} className="group block">
                      <div className="font-medium text-slate-900 group-hover:underline group-hover:text-brand transition-colors cursor-pointer">
                        {appt.patient.firstName} {appt.patient.lastName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatAge(appt.patient.dateOfBirth)}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {formatGuardianDisplay(
                      appt.patient.guardianFullName,
                      appt.patient.guardianRelationship,
                    )}
                  </TableCell>
                  <TableCell className="text-slate-700 text-xs font-medium">{appt.type}</TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    Dr. {appt.doctor.fullName}
                  </TableCell>
                  <TableCell className="text-right">
                    <AppointmentStatusSelector
                      appointmentId={appt.id}
                      currentStatus={appt.status}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
