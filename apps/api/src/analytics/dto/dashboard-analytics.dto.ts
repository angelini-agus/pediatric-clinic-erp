import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const nextAppointmentPatientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  age: z.string(),
});

export const nextAppointmentSchema = z
  .object({
    id: z.string(),
    dateTime: z.coerce.date(),
    time: z.string(),
    type: z.string(),
    patient: nextAppointmentPatientSchema,
  })
  .nullable();

export const appointmentFunnelSchema = z.object({
  total: z.number().int().nonnegative().describe('Total appointments today'),
  completed: z.number().int().nonnegative().describe('Completed appointments today'),
  waiting: z.number().int().nonnegative().describe('Scheduled or in-progress appointments today'),
});

export const dashboardAnalyticsSchema = z.object({
  nextAppointment: nextAppointmentSchema.describe('Next scheduled appointment today or null'),
  appointmentFunnel: appointmentFunnelSchema.describe('Funnel metrics for today'),
  unsignedRecords: z
    .number()
    .int()
    .nonnegative()
    .describe('Completed appointments today without a signed medical record'),
  canceledToday: z.number().int().nonnegative().describe('Canceled appointments today'),
});

/**
 * DashboardAnalyticsDto — Response DTO for GET /api/v1/analytics/dashboard.
 */
export class DashboardAnalyticsDto extends createZodDto(dashboardAnalyticsSchema) {}
