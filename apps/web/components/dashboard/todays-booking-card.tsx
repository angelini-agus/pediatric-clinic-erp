import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, CalendarOff } from 'lucide-react';
import { getTodaysAppointments, type AppointmentResponse } from '@/lib/api';
import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/components/ui/badge';

// ── Helpers ──────────────────────────────────────────────────────────────────

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

/** Maps Prisma AppointmentStatus (UPPER_SNAKE_CASE) to Badge variant (camelCase). */
const STATUS_TO_VARIANT: Record<AppointmentResponse['status'], BadgeVariant> = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

/** Maps Prisma AppointmentStatus to Spanish UI label. */
const STATUS_LABEL: Record<AppointmentResponse['status'], string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En Curso',
  COMPLETED: 'Completado',
  CANCELED: 'Cancelado',
};

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

/**
 * Returns a human-readable age string from a date of birth.
 * e.g. "3 años", "18 meses", "9 meses"
 */
function formatAge(dateOfBirth: Date): string {
  const now = new Date();
  const months =
    (now.getFullYear() - dateOfBirth.getFullYear()) * 12 +
    (now.getMonth() - dateOfBirth.getMonth());
  if (months < 24) return `${months} meses`;
  const years = Math.floor(months / 12);
  return `${years} años`;
}

/**
 * Formats guardian display string.
 * e.g. "Sofía González (Madre)"
 */
function formatGuardian(appointment: AppointmentResponse): string {
  const rel =
    appointment.patient.guardianRelationship.charAt(0).toUpperCase() +
    appointment.patient.guardianRelationship.slice(1).toLowerCase();
  return `${appointment.patient.guardianFullName} (${rel})`;
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
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
export async function TodaysBookingCard() {
  const appointments = await getTodaysAppointments();

  return (
    <div className="relative overflow-hidden bg-white/75 backdrop-blur-xl rounded-2xl shadow-sm p-5">
      {/* Decorative blobs — indigo/violet palette */}
      <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-indigo-400/25 blur-2xl" />
      <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-violet-400/20 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="h-[18px] w-[18px] text-brand" />
              Turnos de Hoy
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pacientes citados para la fecha actual
            </p>
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
          <Table>
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
                    <div className="font-medium text-slate-900">
                      {appt.patient.firstName} {appt.patient.lastName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatAge(appt.patient.dateOfBirth)}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {formatGuardian(appt)}
                  </TableCell>
                  <TableCell className="text-slate-700 text-xs font-medium">
                    {appt.type}
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    Dr. {appt.doctor.fullName}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={STATUS_TO_VARIANT[appt.status]}>
                      {STATUS_LABEL[appt.status]}
                    </Badge>
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
