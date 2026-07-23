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
  { id: '1', time: '09:00 AM', patientName: 'Mateo González', patientAge: '3 años', guardianName: 'Sofía González (Madre)', type: 'Control de Rutina', doctor: 'Dr. Ricardo Silva', status: 'completed', statusLabel: 'Completado' },
  { id: '2', time: '09:30 AM', patientName: 'Valentina Pérez', patientAge: '18 meses', guardianName: 'Carlos Pérez (Padre)', type: 'Consulta de Control', doctor: 'Dr. Ricardo Silva', status: 'inProgress', statusLabel: 'En Curso' },
  { id: '3', time: '10:00 AM', patientName: 'Benjamín Rodríguez', patientAge: '5 años', guardianName: 'Ana Rodríguez (Madre)', type: 'Vacunación SAP', doctor: 'Dr. Ricardo Silva', status: 'scheduled', statusLabel: 'Programado' },
  { id: '4', time: '10:30 AM', patientName: 'Emma López', patientAge: '9 meses', guardianName: 'Martín López (Padre)', type: 'Control 9 Meses', doctor: 'Dr. Ricardo Silva', status: 'scheduled', statusLabel: 'Programado' },
  { id: '5', time: '11:00 AM', patientName: 'Lucas Martínez', patientAge: '7 años', guardianName: 'Patricia Martínez (Madre)', type: 'Cuadro Febril', doctor: 'Dr. Ricardo Silva', status: 'canceled', statusLabel: 'Cancelado' },
  { id: '6', time: '11:30 AM', patientName: 'Juana Díaz', patientAge: '2 años', guardianName: 'Laura Díaz (Madre)', type: 'Control de Crecimiento', doctor: 'Dr. Ricardo Silva', status: 'scheduled', statusLabel: 'Programado' },
];

export function TodaysBookingCard() {
  return (
    <div className="relative overflow-hidden bg-white/75 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-5">
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
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            <span>6 Turnos</span>
          </div>
        </div>

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
            {mockBookings.map((booking) => (
              <TableRow key={booking.id} className="border-slate-50 hover:bg-slate-50/80 transition-colors">
                <TableCell className="font-semibold text-slate-700">{booking.time}</TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">{booking.patientName}</div>
                  <div className="text-xs text-slate-400">{booking.patientAge}</div>
                </TableCell>
                <TableCell className="text-slate-500 text-xs">{booking.guardianName}</TableCell>
                <TableCell className="text-slate-700 text-xs font-medium">{booking.type}</TableCell>
                <TableCell className="text-slate-500 text-xs">{booking.doctor}</TableCell>
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
