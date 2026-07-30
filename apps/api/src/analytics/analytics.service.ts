import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { DashboardAnalyticsDto } from './dto/dashboard-analytics.dto.js';

/**
 * AnalyticsService — Business logic for dashboard metrics and reporting.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates dashboard analytics metrics in real time.
   *
   * PERFORMANCE REQUIREMENTS:
   * - Uses Prisma `count()` queries directly in SQL (no findMany / JS length).
   * - Executes queries concurrently via `Promise.all()`.
   *
   * METRICS:
   * a) Active Patients: Patients with deletedAt = null
   * b) Today's Appointments: Appointments with dateTime on current date & deletedAt = null
   * c) Monthly Completed: Appointments with status = COMPLETED, dateTime in current month & deletedAt = null
   */
  async getDashboardMetrics(): Promise<DashboardAnalyticsDto> {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const [totalPatients, todayAppointments, monthlyCompletedAppointments] =
      await Promise.all([
        this.prisma.client.patient.count({
          where: { deletedAt: null },
        }),
        this.prisma.client.appointment.count({
          where: {
            dateTime: {
              gte: startOfToday,
              lte: endOfToday,
            },
            deletedAt: null,
          },
        }),
        this.prisma.client.appointment.count({
          where: {
            status: 'COMPLETED',
            dateTime: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            deletedAt: null,
          },
        }),
      ]);

    return {
      totalPatients,
      todayAppointments,
      monthlyCompletedAppointments,
    };
  }
}
