import { Suspense } from 'react';

import { DashboardTabsClient } from '@/components/dashboard/dashboard-tabs-client';
import { OperationalMetricsCards } from '@/components/dashboard/operational-metrics-cards';
import { OperationalMetricsCardsSkeleton } from '@/components/dashboard/operational-metrics-cards-skeleton';
import { TodaysBookingCard } from '@/components/dashboard/todays-booking-card';
import { TodaysBookingCardSkeleton } from '@/components/dashboard/todays-booking-card-skeleton';

// Force dynamic rendering so real-time analytics are fetched on each request
export const dynamic = 'force-dynamic';

/**
 * DashboardPage — Server Component.
 *
 * Composes:
 * - DashboardTabsClient (Client Component — interactive tabs)
 * - OperationalMetricsCards (Async Server Component — real-time analytics for 4 operational cards)
 * - TodaysBookingCard (Async Server Component — fetches real appointments for today)
 *
 * Cada componente async se envuelve en su propio `<Suspense>` con un
 * skeleton focalizado. Esto permite streaming progresivo: las cards y la
 * tabla aparecen independientemente en cuanto cada fetch termina, en vez
 * de bloquear la página entera hasta que el más lento responda.
 */
export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Internal navigation tabs */}
      <DashboardTabsClient />

      {/* 4 Operational Cards Grid (Real-time analytics) */}
      <Suspense fallback={<OperationalMetricsCardsSkeleton />}>
        <OperationalMetricsCards />
      </Suspense>

      {/* Today's bookings table */}
      <Suspense fallback={<TodaysBookingCardSkeleton />}>
        <TodaysBookingCard />
      </Suspense>
    </div>
  );
}
