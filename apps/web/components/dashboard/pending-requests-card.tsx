import { Inbox } from 'lucide-react';
import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatAge, formatGuardianDisplay } from '@/lib/patient-utils';

import { AppointmentStatusSelector } from './appointment-status-selector';

import type { AppointmentResponse } from '@/lib/api';

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type PendingRequestsCardProps = {
  requests: AppointmentResponse[];
};

/**
 * PendingRequestsCard — Server Component (presentacional).
 *
 * Bandeja accionable de solicitudes del portal (status REQUESTED, de
 * cualquier fecha). La clínica confirma con el selector de estado
 * (→ Programado) o cancela.
 */
export function PendingRequestsCard({ requests }: PendingRequestsCardProps): React.JSX.Element {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 shadow-sm backdrop-blur-xl will-change-transform"
      style={{
        background:
          'radial-gradient(ellipse at 105% -5%, rgba(139,92,246,0.14) 0%, rgba(255,255,255,0.75) 50%)',
      }}
    >
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Inbox className="h-[18px] w-[18px] text-violet-600" />
              Solicitudes de turno
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Pedidos hechos por los pacientes desde el portal — confirmá o cancelá
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-sm">
            <span>
              {requests.length} {requests.length === 1 ? 'Pendiente' : 'Pendientes'}
            </span>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-400">
            <Inbox className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
            <p className="text-sm font-medium text-slate-500">No hay solicitudes pendientes</p>
            <p className="text-xs text-slate-400">
              Las solicitudes que hagan los pacientes desde el portal aparecen acá.
            </p>
          </div>
        ) : (
          <Table data-testid="pending-requests-table">
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="text-slate-400">Fecha y hora pedida</TableHead>
                <TableHead className="text-slate-400">Paciente</TableHead>
                <TableHead className="text-slate-400">Tutor Responsable</TableHead>
                <TableHead className="text-slate-400">Motivo</TableHead>
                <TableHead className="text-right text-slate-400">Confirmar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow
                  key={request.id}
                  className="border-slate-50 transition-colors hover:bg-slate-50/80"
                >
                  <TableCell className="font-semibold capitalize text-slate-700">
                    {formatDateTime(request.dateTime)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/patients/${request.patient.id}`} className="group block">
                      <div className="font-medium text-slate-900 transition-colors group-hover:text-brand group-hover:underline">
                        {request.patient.firstName} {request.patient.lastName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatAge(request.patient.dateOfBirth)}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatGuardianDisplay(
                      request.patient.guardianFullName,
                      request.patient.guardianRelationship,
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-700">
                    {request.type}
                    {request.notes !== null && request.notes !== undefined && (
                      <span className="mt-0.5 block text-xs font-normal text-slate-400">
                        {request.notes}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <AppointmentStatusSelector
                      appointmentId={request.id}
                      currentStatus={request.status}
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
