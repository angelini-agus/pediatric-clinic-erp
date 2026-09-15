import { Suspense } from 'react';

import { DashboardViewTabs, type DashboardView } from '@/components/dashboard/dashboard-view-tabs';
import { OperationalMetricsCards } from '@/components/dashboard/operational-metrics-cards';
import { OperationalMetricsCardsSkeleton } from '@/components/dashboard/operational-metrics-cards-skeleton';
import { PendingRequestsCard } from '@/components/dashboard/pending-requests-card';
import { TodaysBookingCard } from '@/components/dashboard/todays-booking-card';
import { getTodaysAppointments, getUpcomingAppointments } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

// Force dynamic rendering so real-time analytics are fetched on each request
export const dynamic = 'force-dynamic';

type DashboardPageProps = {
  searchParams?: {
    view?: string;
  };
};

/** Normalizes the `?view=` param to a known view (default: resumen). */
function parseView(value: string | undefined): DashboardView {
  if (value === 'solicitudes' || value === 'en-curso' || value === 'atendidos') {
    return value;
  }
  return 'resumen';
}

/**
 * DashboardPage — Server Component.
 *
 * Vistas del día (URL-driven, /dashboard?view=…):
 *  - resumen: métricas operativas + tabla completa de turnos de hoy
 *  - solicitudes: bandeja de pedidos del portal pendientes de confirmar
 *  - en-curso: turnos de hoy programados o en curso
 *  - atendidos: turnos de hoy completados o cancelados
 */
export default async function DashboardPage({
  searchParams,
}: DashboardPageProps): Promise<React.JSX.Element> {
  const token = getAuthToken();
  const view = parseView(searchParams?.view);

  const [today, upcoming] = await Promise.all([
    getTodaysAppointments(token),
    getUpcomingAppointments(token),
  ]);

  const pendingRequests = upcoming.filter((appointment) => appointment.status === 'REQUESTED');
  const inProgress = today.filter(
    (appointment) => appointment.status === 'SCHEDULED' || appointment.status === 'IN_PROGRESS',
  );
  const attended = today.filter(
    (appointment) => appointment.status === 'COMPLETED' || appointment.status === 'CANCELED',
  );

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Day-view switcher (not navigation — that is the sidebar) */}
      <DashboardViewTabs activeView={view} pendingRequests={pendingRequests.length} />

      {view === 'resumen' && (
        <>
          {/* 4 Operational Cards Grid (Real-time analytics) */}
          <Suspense fallback={<OperationalMetricsCardsSkeleton />}>
            <OperationalMetricsCards />
          </Suspense>

          {/* Today's bookings table (all statuses) */}
          <TodaysBookingCard appointments={today} />
        </>
      )}

      {view === 'solicitudes' && <PendingRequestsCard requests={pendingRequests} />}

      {view === 'en-curso' && (
        <TodaysBookingCard
          appointments={inProgress}
          emptyMessage="No hay turnos programados o en curso para hoy"
        />
      )}

      {view === 'atendidos' && (
        <TodaysBookingCard
          appointments={attended}
          emptyMessage="Todavía no hay turnos atendidos ni cancelados hoy"
        />
      )}
    </div>
  );
}
