import { Injectable } from '@nestjs/common';

import { formatAge, formatTime } from '../common/utils/format.utils.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type { DashboardAnalyticsDto } from './dto/dashboard-analytics.dto.js';

/**
 * AnalyticsService — Business logic for dashboard metrics and reporting.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates real-time metrics for the 4 operational dashboard cards:
   * 1. nextAppointment: Next SCHEDULED appointment today (dateTime > now)
   * 2. appointmentFunnel: Today's total, completed, and waiting appointments count
   * 3. unsignedRecords: Today's COMPLETED appointments without a signed MedicalRecord
   * 4. canceledToday: Today's CANCELED appointments count
   *
   * PERFORMANCE GUARANTEE:
   * - Uses Prisma SQL count and findFirst queries (no findMany with JS .length counting).
   * - Executes all queries concurrently via Promise.all().
   */
  async getDashboardMetrics(): Promise<DashboardAnalyticsDto> {
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [nextAppt, funnelTotal, funnelCompleted, funnelWaiting, unsignedRecords, canceledToday] =
      await Promise.all([
        // 1. Next SCHEDULED appointment today where dateTime > now
        this.prisma.client.appointment.findFirst({
          where: {
            dateTime: {
              gte: now,
              lte: endOfToday,
            },
            status: 'SCHEDULED',
            deletedAt: null,
          },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
              },
            },
          },
          orderBy: {
            dateTime: 'asc',
          },
        }),

        // 2a. Today's total appointments count
        this.prisma.client.appointment.count({
          where: {
            dateTime: {
              gte: startOfToday,
              lte: endOfToday,
            },
            deletedAt: null,
          },
        }),

        // 2b. Today's completed appointments count
        this.prisma.client.appointment.count({
          where: {
            dateTime: {
              gte: startOfToday,
              lte: endOfToday,
            },
            status: 'COMPLETED',
            deletedAt: null,
          },
        }),

        // 2c. Today's waiting appointments count (SCHEDULED or IN_PROGRESS)
        this.prisma.client.appointment.count({
          where: {
            dateTime: {
              gte: startOfToday,
              lte: endOfToday,
            },
            status: {
              in: ['SCHEDULED', 'IN_PROGRESS'],
            },
            deletedAt: null,
          },
        }),

        // 3. Today's COMPLETED appointments without a MedicalRecord created today
        this.prisma.client.appointment.count({
          where: {
            dateTime: {
              gte: startOfToday,
              lte: endOfToday,
            },
            status: 'COMPLETED',
            deletedAt: null,
            patient: {
              medicalRecords: {
                none: {
                  createdAt: {
                    gte: startOfToday,
                    lte: endOfToday,
                  },
                  deletedAt: null,
                },
              },
            },
          },
        }),

        // 4. Today's CANCELED appointments count
        this.prisma.client.appointment.count({
          where: {
            dateTime: {
              gte: startOfToday,
              lte: endOfToday,
            },
            status: 'CANCELED',
            deletedAt: null,
          },
        }),
      ]);

    const formattedNextAppt = nextAppt
      ? {
          id: nextAppt.id,
          dateTime: nextAppt.dateTime,
          time: formatTime(nextAppt.dateTime),
          type: nextAppt.type,
          patient: {
            id: nextAppt.patient.id,
            firstName: nextAppt.patient.firstName,
            lastName: nextAppt.patient.lastName,
            fullName: `${nextAppt.patient.firstName} ${nextAppt.patient.lastName}`,
            age: formatAge(nextAppt.patient.dateOfBirth),
          },
        }
      : null;

    return {
      nextAppointment: formattedNextAppt,
      appointmentFunnel: {
        total: funnelTotal,
        completed: funnelCompleted,
        waiting: funnelWaiting,
      },
      unsignedRecords,
      canceledToday,
    };
  }
}
