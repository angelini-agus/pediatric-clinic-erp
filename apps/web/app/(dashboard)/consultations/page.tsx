import { Stethoscope } from 'lucide-react';

import { ClinicalHistoryList } from '@/components/consultations/clinical-history-list';
import { ConsultationsTabs } from '@/components/consultations/consultations-tabs';
import { TodayWorklist } from '@/components/consultations/today-worklist';
import { getAllMedicalRecords, getTodaysAppointments } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { decodeAuthPayload } from '@/lib/jwt';

import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Consultas',
  description: 'Workspace del día e historial clínico global del consultorio.',
};

const PAGE_SIZE = 10;

type ConsultationsPageProps = {
  searchParams?: {
    tab?: string;
    q?: string;
    page?: string;
  };
};

/**
 * ConsultationsPage — Server Component.
 *
 * Dos vistas (URL-driven):
 *  - "Hoy": worklist de los turnos del día con panel de consulta embebido.
 *  - "Historial clínico": todas las evoluciones del consultorio, paginadas
 *    y con búsqueda por paciente/DNI.
 *
 * RBAC: el historial global es DOCTOR/ADMIN/SUPER_ADMIN (el endpoint
 * devuelve 403 al resto); los formularios de evolución/receta son solo
 * para DOCTOR (la API firma con el profesional autenticado).
 */
export default async function ConsultationsPage({
  searchParams,
}: ConsultationsPageProps): Promise<React.JSX.Element> {
  const token = getAuthToken();
  const user = decodeAuthPayload();

  const isDoctor = user?.role === 'DOCTOR';
  const isClinical = isDoctor || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const requestedTab = searchParams?.tab === 'historial' ? 'historial' : 'hoy';
  const activeTab = requestedTab === 'historial' && !isClinical ? 'hoy' : requestedTab;

  const query = searchParams?.q?.trim() ?? '';
  const rawPage = Number.parseInt(searchParams?.page ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const appointments = await getTodaysAppointments(token);
  const history =
    activeTab === 'historial'
      ? await getAllMedicalRecords({ page, pageSize: PAGE_SIZE, query }, token)
      : null;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Consultas Médicas</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {activeTab === 'historial'
              ? 'Historial clínico global del consultorio'
              : 'Turnos de hoy y documentación de la consulta'}
          </p>
        </div>
      </div>

      <ConsultationsTabs activeTab={activeTab} showHistory={isClinical} />

      {activeTab === 'historial' && history !== null ? (
        <ClinicalHistoryList
          records={history.data}
          total={history.total}
          page={page}
          pageSize={PAGE_SIZE}
          query={query}
        />
      ) : (
        <TodayWorklist
          appointments={appointments}
          canDocument={isDoctor}
          doctorId={isDoctor ? user.id : null}
        />
      )}
    </div>
  );
}
