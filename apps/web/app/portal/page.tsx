import { CalendarClock, CheckCircle2, Clock, MessageCircle } from 'lucide-react';

import { RequestAppointmentForm } from '@/components/portal/request-appointment-form';
import { Badge } from '@/components/ui/badge';
import { getPortalAppointments, getPortalMe } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

import type { PortalAppointment } from '@/lib/api';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mis turnos',
  description: 'Turnos y solicitudes del paciente en el portal de Miradas.',
};

/** Patient-friendly status labels (the staff sees the clinical wording). */
const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Pendiente de confirmación',
  SCHEDULED: 'Confirmado',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Atendido',
  CANCELED: 'Cancelado',
};

const STATUS_VARIANTS: Record<
  string,
  'requested' | 'scheduled' | 'inProgress' | 'completed' | 'canceled'
> = {
  REQUESTED: 'requested',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

const WHATSAPP_LINK =
  'https://wa.me/5493413464378?text=' +
  encodeURIComponent('Hola, necesito vincular mi cuenta del portal.');

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function AppointmentRow({ appointment }: { appointment: PortalAppointment }): React.JSX.Element {
  return (
    <li className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/70 px-5 py-4 shadow-sm backdrop-blur-xl">
      <div className="min-w-0">
        <p className="text-sm font-semibold capitalize text-slate-800">
          {formatDateTime(appointment.dateTime)}
        </p>
        <p className="truncate text-xs text-slate-500">
          {appointment.type} · {appointment.doctor.fullName}
        </p>
        {appointment.notes !== null && appointment.notes !== undefined && (
          <p className="mt-1 text-xs text-slate-400">{appointment.notes}</p>
        )}
      </div>
      <Badge variant={STATUS_VARIANTS[appointment.status] ?? 'secondary'} className="shrink-0">
        {STATUS_LABELS[appointment.status] ?? appointment.status}
      </Badge>
    </li>
  );
}

export default async function PortalPage(): Promise<React.JSX.Element> {
  const token = getAuthToken();
  const [{ patient }, appointments] = await Promise.all([
    getPortalMe(token),
    getPortalAppointments(token),
  ]);

  // ── Not linked yet ──────────────────────────────────────────────────────
  if (patient === null) {
    return (
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <CalendarClock className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-800">Tu cuenta todavía no está vinculada</h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Escribinos por WhatsApp para que el consultorio vincule tu cuenta con la ficha de tu
            hijo/a. Una vez vinculada vas a poder ver los turnos, solicitar nuevos y acceder a la
            ubicación exacta del consultorio.
          </p>
        </div>
        <a
          href={WHATSAPP_LINK}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700"
        >
          <MessageCircle className="h-4 w-4" />
          Escribir por WhatsApp
        </a>
      </div>
    );
  }

  const now = new Date();
  const upcoming = appointments
    .filter((a) => a.status !== 'CANCELED' && a.status !== 'COMPLETED' && a.dateTime >= now)
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  const history = appointments
    .filter((a) => !upcoming.includes(a))
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
  const nextAppointment = upcoming[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Hola, {patient.guardianFullName.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500">
          Turnos de {patient.firstName} {patient.lastName}
        </p>
      </header>

      {/* Next appointment */}
      {nextAppointment !== undefined ? (
        <section className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-card-shell backdrop-blur-xl sm:p-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Próximo turno</h2>
          </div>
          <p className="mt-4 text-lg font-semibold capitalize text-slate-800">
            {formatDateTime(nextAppointment.dateTime)}
          </p>
          <p className="text-sm text-slate-500">
            {nextAppointment.type} · {nextAppointment.doctor.fullName}
          </p>
          <Badge
            variant={STATUS_VARIANTS[nextAppointment.status] ?? 'secondary'}
            className="mt-3 inline-flex"
          >
            {STATUS_LABELS[nextAppointment.status] ?? nextAppointment.status}
          </Badge>
        </section>
      ) : (
        <section className="rounded-[2rem] border border-white/60 bg-white/70 p-6 text-center shadow-card-shell backdrop-blur-xl sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Clock className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-600">No tenés turnos próximos</p>
          <p className="text-xs text-slate-400">Podés solicitar uno con el formulario de abajo.</p>
        </section>
      )}

      {/* Request form */}
      <RequestAppointmentForm />

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Historial</h2>
          <ul className="space-y-3">
            {history.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
