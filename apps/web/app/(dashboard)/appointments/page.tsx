import { CalendarDays, Clock, CalendarOff } from 'lucide-react';
import Link from 'next/link';

import { NewAppointmentDialog } from '@/components/appointments/new-appointment-dialog';
import { AppointmentStatusSelector } from '@/components/dashboard/appointment-status-selector';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getUpcomingAppointments } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

// ── Disable caching for live data ─────────────────────────────────────────────
export const dynamic = 'force-dynamic';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(date: Date): { date: string; time: string } {
  return {
    date: date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }),
    time: date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

function formatAge(dateOfBirth: Date): string {
  const now = new Date();
  const months =
    (now.getFullYear() - dateOfBirth.getFullYear()) * 12 +
    (now.getMonth() - dateOfBirth.getMonth());
  if (months < 24) return `${months} m`;
  return `${Math.floor(months / 12)} años`;
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
      <CalendarOff className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
      <p className="text-sm font-medium text-slate-500">No hay turnos próximos</p>
      <p className="text-xs text-slate-400">
        Los turnos agendados desde hoy aparecerán aquí.
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

/**
 * AgendaPage — Server Component.
 * Route: /appointments
 *
 * Fetches and displays all upcoming appointments (dateTime >= now)
 * in a glassmorphism table with status badges and inline status selector.
 */
export default async function AgendaPage() {
  const appointments = await getUpcomingAppointments(getAuthToken());

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="h-5 w-5 text-brand" />
            Agenda de Turnos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Turnos próximos agendados en la clínica
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>
              {appointments.length}{' '}
              {appointments.length === 1 ? 'Turno' : 'Turnos'}
            </span>
          </div>
          <NewAppointmentDialog />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="relative overflow-hidden bg-white/75 backdrop-blur-xl rounded-2xl shadow-sm p-5">
        {/* Decorative blobs */}
        <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-indigo-400/25 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-violet-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {appointments.length === 0 ? (
            <EmptyState />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="w-[90px] text-slate-400">Hora</TableHead>
                  <TableHead className="text-slate-400">Paciente</TableHead>
                  <TableHead className="text-slate-400">Tutor Responsable</TableHead>
                  <TableHead className="text-slate-400">Motivo / Tipo</TableHead>
                  <TableHead className="text-slate-400">Médico</TableHead>
                  <TableHead className="text-right text-slate-400">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => {
                  const { date, time } = formatDateTime(appt.dateTime);
                  const age = formatAge(appt.patient.dateOfBirth);
                  return (
                    <TableRow
                      key={appt.id}
                      className="border-slate-50 hover:bg-slate-50/80 transition-colors"
                    >
                      <TableCell className="text-slate-600 text-xs font-medium capitalize">
                        {date}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">
                        {time}
                      </TableCell>
                      <TableCell>
                        <Link href={`/patients/${appt.patient.id}`} className="group block">
                          <div className="font-medium text-slate-900 group-hover:underline group-hover:text-brand transition-colors cursor-pointer">
                            {appt.patient.firstName} {appt.patient.lastName}
                          </div>
                          <div className="text-xs text-slate-400">{age}</div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {appt.patient.guardianFullName}
                      </TableCell>
                      <TableCell className="text-slate-700 text-xs font-medium">
                        {appt.type}
                      </TableCell>
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
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
