import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import type { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto.js';
import type { Prisma } from '@pediatric-erp/db';

/**
 * COLLABORATION RULE: The queried patient payload only carries the fields
 * consumed by the UI (id, firstName, lastName, dateOfBirth,
 * guardianFullName, guardianRelationship). Never expand this select
 * beyond what the client actually renders — a full `patient: true`
 * select returns ~100 columns per row and grows the wire payload.
 */
const PATIENT_SUMMARY_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  guardianFullName: true,
  guardianRelationship: true,
} as const satisfies Prisma.PatientSelect;

/** Half of the doctor conflict window (see APPOINTMENT_SLOT_WINDOW_MS). */
const APPOINTMENT_SLOT_WINDOW_MS = 30 * 60 * 1000;

/** Appointment payload with slim patient summary and doctor metadata. */
export type AppointmentWithDetails = Prisma.AppointmentGetPayload<{
  select: {
    id: true;
    dateTime: true;
    type: true;
    notes: true;
    status: true;
    patientId: true;
    doctorId: true;
    createdAt: true;
    updatedAt: true;
    deletedAt: true;
    patient: {
      select: typeof PATIENT_SUMMARY_SELECT;
    };
    doctor: {
      select: {
        id: true;
        fullName: true;
        specialty: true;
        medicalLicense: true;
      };
    };
  };
}>;

/** Full Appointment record type (without includes). */
export type AppointmentRecord = Prisma.AppointmentGetPayload<Record<string, never>>;

/**
 * AppointmentsService — business logic for appointment management.
 *
 * ARCHITECTURAL RULE (Law 26.529):
 * - MANDATORY Soft-delete: never use prisma.appointment.delete()
 * - The `deletedAt` field marks the record as deleted
 * - Read queries MUST filter by `deletedAt: null`
 */
@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Returns all active appointments for TODAY (between 00:00:00 and 23:59:59.999),
   * including slim patient details and doctor metadata.
   *
   * STRICT PRISMA RULE: Filters by `dateTime` (today) AND `deletedAt: null`.
   * Uses `select` (not `include`) to avoid N+1 and oversized payloads:
   * `appointments_dateTime_idx` serves this range scan.
   */
  async findToday(): Promise<AppointmentWithDetails[]> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return this.prisma.client.appointment.findMany({
      where: {
        dateTime: {
          gte: startOfToday,
          lte: endOfToday,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        dateTime: true,
        type: true,
        notes: true,
        status: true,
        patientId: true,
        doctorId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        patient: {
          select: PATIENT_SUMMARY_SELECT,
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            medicalLicense: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }

  /**
   * Returns all upcoming active appointments (dateTime >= now),
   * including slim patient details and doctor metadata, ordered chronologically.
   *
   * STRICT PRISMA RULE: Filters by `dateTime >= now` AND `deletedAt: null`.
   * `appointments_dateTime_idx` serves this head-of-cursor scan; the
   * doctor relation is fetched with an explicit select to minimize
   * per-row projection cost.
   */
  async findUpcoming(): Promise<AppointmentWithDetails[]> {
    const now = new Date();
    return this.prisma.client.appointment.findMany({
      where: {
        dateTime: { gte: now },
        deletedAt: null,
      },
      select: {
        id: true,
        dateTime: true,
        type: true,
        notes: true,
        status: true,
        patientId: true,
        doctorId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        patient: {
          select: PATIENT_SUMMARY_SELECT,
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            medicalLicense: true,
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    });
  }

  /**
   * Schedules a new appointment.
   *
   * SLOT VALIDATION: Rejects the booking if the doctor already has an
   * active (SCHEDULED or IN_PROGRESS) appointment whose `dateTime` falls
   * within a 30-minute window around the requested slot. Uses the
   * `appointments_doctorId_dateTime_idx` composite index.
   *
   * AUDIT: records CREATE_APPOINTMENT with the authenticated actor.
   *
   * @param dto - Validated input data (via Zod + nestjs-zod)
   * @param actorId - Authenticated user id (req.user.sub)
   * @returns Newly created appointment record
   * @throws ConflictException if the doctor slot overlaps another active appointment
   */
  async create(dto: CreateAppointmentDto, actorId: string): Promise<AppointmentRecord> {
    const requestedAt = dto.dateTime;
    const windowStart = new Date(requestedAt.getTime() - APPOINTMENT_SLOT_WINDOW_MS);
    const windowEnd = new Date(requestedAt.getTime() + APPOINTMENT_SLOT_WINDOW_MS);

    const conflictingAppointment = await this.prisma.client.appointment.findFirst({
      where: {
        doctorId: dto.doctorId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        deletedAt: null,
        dateTime: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      select: { id: true, dateTime: true },
    });

    if (conflictingAppointment !== null) {
      throw new ConflictException(
        `Doctor already has an active appointment '${conflictingAppointment.id}' at ${conflictingAppointment.dateTime.toISOString()}, within +/-30 minutes of the requested slot ${requestedAt.toISOString()}.`,
      );
    }

    const appointment = await this.prisma.client.appointment.create({
      data: {
        dateTime: dto.dateTime,
        type: dto.type,
        notes: dto.notes ?? null,
        status: dto.status,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
      },
    });

    await this.audit.log({
      action: 'CREATE_APPOINTMENT',
      entityName: 'Appointment',
      entityId: appointment.id,
      userId: actorId,
      patientId: dto.patientId,
      payload: {
        dateTime: dto.dateTime.toISOString(),
        type: dto.type,
        doctorId: dto.doctorId,
      },
    });

    return appointment;
  }

  /**
   * Updates an appointment's status (e.g., SCHEDULED -> IN_PROGRESS -> COMPLETED).
   *
   * AUDIT: records UPDATE_APPOINTMENT_STATUS with the previous and new
   * status (payload carries no PHI — statuses are operational).
   *
   * @param id - Appointment CUID ID
   * @param dto - Validated status payload
   * @param actorId - Authenticated user id (req.user.sub)
   * @returns Updated appointment record
   * @throws NotFoundException if appointment does not exist
   */
  async updateStatus(
    id: string,
    dto: UpdateAppointmentStatusDto,
    actorId: string,
  ): Promise<AppointmentRecord> {
    const existing = await this.prisma.client.appointment.findUnique({
      where: { id },
      select: { status: true, patientId: true },
    });

    if (existing === null) {
      throw new NotFoundException(`Appointment with id '${id}' not found`);
    }

    const updated = await this.prisma.client.appointment.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.audit.log({
      action: 'UPDATE_APPOINTMENT_STATUS',
      entityName: 'Appointment',
      entityId: id,
      userId: actorId,
      patientId: existing.patientId,
      payload: {
        from: existing.status,
        to: dto.status,
      },
    });

    return updated;
  }

  /**
   * Marks an appointment as deleted (soft-delete).
   *
   * STRICT RULE: NEVER use prisma.appointment.delete().
   * `deletedAt` is set to current date and time.
   *
   * STATE MACHINE GUARD: appointments in a TERMINAL state (CANCELED or
   * COMPLETED) are immutable — they represent settled clinical events
   * (Law 26.529 archive integrity). Deleting them is rejected with 409
   * instead of silently removing legal evidence.
   *
   * AUDIT: records SOFT_DELETE_APPOINTMENT with the authenticated actor.
   *
   * @param id - Appointment CUID ID
   * @param actorId - Authenticated user id (req.user.sub)
   * @returns Updated record with `deletedAt` set
   * @throws NotFoundException if appointment does not exist
   * @throws ConflictException if appointment is in CANCELED/COMPLETED state
   */
  async softDelete(id: string, actorId: string): Promise<AppointmentRecord> {
    const existing = await this.prisma.client.appointment.findUnique({
      where: { id },
      select: { status: true, patientId: true },
    });

    if (existing === null) {
      throw new NotFoundException(`Appointment with id '${id}' not found`);
    }

    if (existing.status === 'CANCELED' || existing.status === 'COMPLETED') {
      throw new ConflictException(
        `Appointment '${id}' has terminal status '${existing.status}' and cannot be deleted.`,
      );
    }

    const updated = await this.prisma.client.appointment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      action: 'SOFT_DELETE_APPOINTMENT',
      entityName: 'Appointment',
      entityId: id,
      userId: actorId,
      patientId: existing.patientId,
    });

    return updated;
  }
}
