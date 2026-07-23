import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock } from 'lucide-react';

interface Booking {
  id: string;
  time: string;
  patientName: string;
  patientAge: string;
  guardianName: string;
  type: string;
  doctor: string;
  status: 'scheduled' | 'canceled' | 'inProgress' | 'completed';
  statusLabel: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    time: '09:00 AM',
    patientName: 'Mateo González',
    patientAge: '3 años',
    guardianName: 'Sofía González (Madre)',
    type: 'Control de Rutina',
    doctor: 'Dr. Ricardo Silva',
    status: 'completed',
    statusLabel: 'Completado',
  },
  {
    id: '2',
    time: '09:30 AM',
    patientName: 'Valentina Pérez',
    patientAge: '18 meses',
    guardianName: 'Carlos Pérez (Padre)',
    type: 'Consulta de Control',
    doctor: 'Dr. Ricardo Silva',
    status: 'inProgress',
    statusLabel: 'En Curso',
  },
  {
    id: '3',
    time: '10:00 AM',
    patientName: 'Benjamín Rodríguez',
    patientAge: '5 años',
    guardianName: 'Ana Rodríguez (Madre)',
    type: 'Vacunación SAP',
    doctor: 'Dr. Ricardo Silva',
    status: 'scheduled',
    statusLabel: 'Programado',
  },
  {
    id: '4',
    time: '10:30 AM',
    patientName: 'Emma López',
    patientAge: '9 meses',
    guardianName: 'Martín López (Padre)',
    type: 'Control 9 Meses',
    doctor: 'Dr. Ricardo Silva',
    status: 'scheduled',
    statusLabel: 'Programado',
  },
  {
    id: '5',
    time: '11:00 AM',
    patientName: 'Lucas Martínez',
    patientAge: '7 años',
    guardianName: 'Patricia Martínez (Madre)',
    type: 'Cuadro Febril',
    doctor: 'Dr. Ricardo Silva',
    status: 'canceled',
    statusLabel: 'Cancelado',
  },
  {
    id: '6',
    time: '11:30 AM',
    patientName: 'Juana Díaz',
    patientAge: '2 años',
    guardianName: 'Laura Díaz (Madre)',
    type: 'Control de Crecimiento',
    doctor: 'Dr. Ricardo Silva',
    status: 'scheduled',
    statusLabel: 'Programado',
  },
];

export function TodaysBookingCard() {
  return (
    <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/40 p-6">
      {/* Blobs decorativos */}
      <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-blue-300/15 blur-3xl" />
      <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-purple-300/15 blur-3xl" />

      {/* Contenido z-10 */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand" />
              Turnos de Hoy
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lista de pacientes citados para la fecha actual
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/60 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>6 Turnos Registrados</span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-slate-200/60">
              <TableHead className="w-[100px]">Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Tutor Responsable</TableHead>
              <TableHead>Motivo / Tipo</TableHead>
              <TableHead>Atendido por</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBookings.map((booking) => (
              <TableRow
                key={booking.id}
                className="border-slate-200/40 hover:bg-white/40 transition-colors"
              >
                <TableCell className="font-semibold text-slate-700">
                  {booking.time}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">{booking.patientName}</div>
                  <div className="text-xs text-slate-400 font-normal">{booking.patientAge}</div>
                </TableCell>
                <TableCell className="text-slate-600 text-xs">
                  {booking.guardianName}
                </TableCell>
                <TableCell className="text-slate-700 text-xs font-medium">
                  {booking.type}
                </TableCell>
                <TableCell className="text-slate-600 text-xs">
                  {booking.doctor}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={booking.status}>{booking.statusLabel}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
