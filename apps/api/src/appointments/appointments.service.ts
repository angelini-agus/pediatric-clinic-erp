import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@pediatric-erp/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import type { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto.js';

/** Appointment record payload type with patient and doctor included. */
export type AppointmentWithDetails = Prisma.AppointmentGetPayload<{
  include: {
    patient: true;
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
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all active appointments for TODAY (between 00:00:00 and 23:59:59.999),
   * including full patient details and doctor metadata.
   *
   * STRICT PRISMA RULE: Filters by `dateTime` (today) AND `deletedAt: null`.
   * INCLUDES: `patient` and `doctor` (user).
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
      include: {
        patient: true,
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
   * including patient details and doctor metadata, ordered chronologically.
   *
   * STRICT PRISMA RULE: Filters by `dateTime >= now` AND `deletedAt: null`.
   */
  async findUpcoming(): Promise<AppointmentWithDetails[]> {
    const now = new Date();
    return this.prisma.client.appointment.findMany({
      where: {
        dateTime: { gte: now },
        deletedAt: null,
      },
      include: {
        patient: true,
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
   * @param dto - Validated input data (via Zod + nestjs-zod)
   * @returns Newly created appointment record
   */
  async create(dto: CreateAppointmentDto): Promise<AppointmentRecord> {
    return this.prisma.client.appointment.create({
      data: {
        dateTime: dto.dateTime,
        type: dto.type,
        notes: dto.notes ?? null,
        status: dto.status ?? 'SCHEDULED',
        patientId: dto.patientId,
        doctorId: dto.doctorId,
      },
    });
  }

  /**
   * Updates an appointment's status (e.g., SCHEDULED -> IN_PROGRESS -> COMPLETED).
   *
   * @param id - Appointment CUID ID
   * @param dto - Validated status payload
   * @returns Updated appointment record
   * @throws NotFoundException if appointment does not exist (Prisma P2025)
   */
  async updateStatus(
    id: string,
    dto: UpdateAppointmentStatusDto,
  ): Promise<AppointmentRecord> {
    try {
      return await this.prisma.client.appointment.update({
        where: { id },
        data: { status: dto.status },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException(`Appointment with id '${id}' not found`);
      }
      throw error;
    }
  }

  /**
   * Marks an appointment as deleted (soft-delete).
   *
   * STRICT RULE: NEVER use prisma.appointment.delete().
   * `deletedAt` is set to current date and time.
   *
   * @param id - Appointment CUID ID
   * @returns Updated record with `deletedAt` set
   * @throws NotFoundException if appointment does not exist (Prisma P2025)
   */
  async softDelete(id: string): Promise<AppointmentRecord> {
    try {
      return await this.prisma.client.appointment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException(`Appointment with id '${id}' not found`);
      }
      throw error;
    }
  }
}
