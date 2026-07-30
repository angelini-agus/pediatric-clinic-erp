import { TodaysBookingCard } from '@/components/dashboard/todays-booking-card';
import { DashboardTabsClient } from '@/components/dashboard/dashboard-tabs-client';
import { OperationalMetricsCards } from '@/components/dashboard/operational-metrics-cards';

// Force dynamic rendering so real-time analytics are fetched on each request
export const dynamic = 'force-dynamic';

/**
 * DashboardPage — Server Component.
 *
 * Composes:
 * - DashboardTabsClient (Client Component — interactive tabs)
 * - OperationalMetricsCards (Async Server Component — real-time analytics for 4 operational cards)
 * - TodaysBookingCard (Async Server Component — fetches real appointments for today)
 */
export default function DashboardPage() {
  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Internal navigation tabs */}
      <DashboardTabsClient />

      {/* 4 Operational Cards Grid (Real-time analytics) */}
      <OperationalMetricsCards />

      {/* Today's bookings table */}
      <TodaysBookingCard />
    </div>
  );
}
