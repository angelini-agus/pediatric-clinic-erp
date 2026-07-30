import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const dashboardAnalyticsSchema = z.object({
  totalPatients: z
    .number()
    .int()
    .nonnegative()
    .describe('Total count of active (non-deleted) patients'),
  todayAppointments: z
    .number()
    .int()
    .nonnegative()
    .describe("Total appointments scheduled for the current day"),
  monthlyCompletedAppointments: z
    .number()
    .int()
    .nonnegative()
    .describe('Total completed appointments within the current month'),
});

/**
 * DashboardAnalyticsDto — Response DTO for GET /api/v1/analytics/dashboard.
 */
export class DashboardAnalyticsDto extends createZodDto(
  dashboardAnalyticsSchema,
) {}
