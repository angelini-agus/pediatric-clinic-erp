import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { AppointmentsService } from '../appointments/appointments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type { PortalAppointmentRequest } from '@pediatric-erp/schemas';

/** Patient summary shown in the portal (own record only). */
export type PortalPatient = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  guardianFullName: string;
};

/** Appointment row shown in the portal. */
export type PortalAppointment = {
  id: string;
  dateTime: Date;
  type: string;
  notes: string | null;
  status: string;
  doctor: { fullName: string; specialty: string | null };
};

/** Clinic info for registered patients (includes the exact address). */
export type PortalClinicInfo = {
  clinicName: string;
  address: string | null;
  professionalName: string | null;
  specialty: string | null;
  licenseNumber: string | null;
};

/**
 * PortalService — patient-facing read/request operations.
 *
 * SECURITY RULE (IDOR): the patient record is ALWAYS resolved from the
 * authenticated user id (`userId = req.user.sub`). The client never sends
 * a patient id — every query is scoped to the linked record.
 */
@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointments: AppointmentsService,
  ) {}

  /**
   * Own profile + link status. Returns `patient: null` when the account is
   * not linked yet (the UI shows the "contact the clinic" state instead).
   */
  async getMe(userId: string): Promise<{ patient: PortalPatient | null }> {
    const patient = await this.prisma.client.patient.findFirst({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        guardianFullName: true,
      },
    });

    return { patient };
  }

  /**
   * Own appointments (all statuses, newest first).
   *
   * @throws ForbiddenException when the account is not linked to a patient
   */
  async getAppointments(userId: string): Promise<PortalAppointment[]> {
    const patient = await this.requireLinkedPatient(userId);

    return this.prisma.client.appointment.findMany({
      where: { patientId: patient.id, deletedAt: null },
      select: {
        id: true,
        dateTime: true,
        type: true,
        notes: true,
        status: true,
        doctor: {
          select: { fullName: true, specialty: true },
        },
      },
      orderBy: { dateTime: 'desc' },
    });
  }

  /**
   * Public clinic info for registered patients — the landing only publishes
   * the city; the exact address lives behind the portal login.
   */
  async getClinic(): Promise<PortalClinicInfo> {
    const settings = await this.prisma.client.clinicSettings.findFirst({
      where: { deletedAt: null },
      select: {
        clinicName: true,
        address: true,
        fullName: true,
        specialty: true,
        licenseNumber: true,
      },
    });

    return {
      clinicName: settings?.clinicName ?? 'Miradas',
      address: settings?.address ?? null,
      professionalName: settings?.fullName ?? null,
      specialty: settings?.specialty ?? null,
      licenseNumber: settings?.licenseNumber ?? null,
    };
  }

  /**
   * Requests an appointment for the linked patient.
   *
   * The record is created with status REQUESTED (never SCHEDULED): the
   * clinic confirms it from the staff dashboard. The patient id comes from
   * the JWT link and the doctor is resolved server-side — the client cannot
   * impersonate another patient nor choose an arbitrary doctor.
   *
   * @throws ForbiddenException when the account is not linked
   * @throws NotFoundException when the clinic has no active professional
   */
  async requestAppointment(
    userId: string,
    dto: PortalAppointmentRequest,
  ): Promise<PortalAppointment> {
    const patient = await this.requireLinkedPatient(userId);

    const doctor = await this.prisma.client.user.findFirst({
      where: { role: 'DOCTOR', deletedAt: null },
      select: { id: true, fullName: true, specialty: true },
      orderBy: { fullName: 'asc' },
    });

    if (doctor === null) {
      throw new NotFoundException('El consultorio no tiene profesionales activos.');
    }

    const appointment = await this.appointments.create(
      {
        dateTime: dto.dateTime,
        type: dto.type,
        notes: dto.notes ?? null,
        status: 'REQUESTED',
        patientId: patient.id,
        doctorId: doctor.id,
      },
      userId,
    );

    return {
      id: appointment.id,
      dateTime: appointment.dateTime,
      type: appointment.type,
      notes: appointment.notes,
      status: appointment.status,
      doctor: { fullName: doctor.fullName, specialty: doctor.specialty },
    };
  }

  /**
   * Resolves the patient record linked to the authenticated portal user.
   *
   * @throws ForbiddenException when the account has no linked record
   */
  private async requireLinkedPatient(userId: string): Promise<PortalPatient> {
    const patient = await this.prisma.client.patient.findFirst({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        guardianFullName: true,
      },
    });

    if (patient === null) {
      throw new ForbiddenException(
        'Tu cuenta todavía no está vinculada a una ficha de paciente. Contactá al consultorio.',
      );
    }

    return patient;
  }
}
