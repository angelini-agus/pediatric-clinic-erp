import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { AppointmentsService } from '../appointments/appointments.service.js';
import { AuditService } from '../audit/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import { PortalService } from './portal.service.js';

const LINKED_PATIENT = {
  id: 'pat_1',
  firstName: 'Mateo',
  lastName: 'González',
  dateOfBirth: new Date('2023-01-10'),
  guardianFullName: 'Ana González',
};

const REQUESTED_SLOT = new Date('2026-10-01T10:00:00.000Z');

/** Returns the first element of a mock call list (throws when never called). */
function firstCallArgs<T>(calls: T[]): T {
  const first = calls[0];
  if (first === undefined) {
    throw new Error('Mock was not called');
  }
  return first;
}

describe('PortalService', () => {
  let service: PortalService;
  let prisma: {
    client: {
      patient: { findFirst: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
      appointment: { findMany: ReturnType<typeof vi.fn> };
      user: { findFirst: ReturnType<typeof vi.fn> };
      clinicSettings: { findFirst: ReturnType<typeof vi.fn> };
    };
  };
  let appointments: { create: ReturnType<typeof vi.fn> };
  let audit: { log: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      client: {
        patient: { findFirst: vi.fn(), create: vi.fn() },
        appointment: { findMany: vi.fn() },
        user: { findFirst: vi.fn() },
        clinicSettings: { findFirst: vi.fn() },
      },
    };
    appointments = { create: vi.fn() };
    audit = { log: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalService,
        { provide: PrismaService, useValue: prisma },
        { provide: AppointmentsService, useValue: appointments },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<PortalService>(PortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMe', () => {
    it('returns patient: null when the account is not linked (no throw)', async () => {
      prisma.client.patient.findFirst.mockResolvedValue(null);

      const result = await service.getMe('usr_unlinked');

      expect(result).toEqual({ patient: null });
    });
  });

  describe('IDOR protection (unlinked account)', () => {
    it('getAppointments throws ForbiddenException and never queries appointments', async () => {
      prisma.client.patient.findFirst.mockResolvedValue(null);

      await expect(service.getAppointments('usr_unlinked')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.client.appointment.findMany).not.toHaveBeenCalled();
    });

    it('requestAppointment throws ForbiddenException and never creates', async () => {
      prisma.client.patient.findFirst.mockResolvedValue(null);

      await expect(
        service.requestAppointment('usr_unlinked', { dateTime: REQUESTED_SLOT, type: 'Control' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(appointments.create).not.toHaveBeenCalled();
    });
  });

  describe('getAppointments', () => {
    it('resolves the patient from the JWT user and scopes the query to it', async () => {
      prisma.client.patient.findFirst.mockResolvedValue(LINKED_PATIENT);
      prisma.client.appointment.findMany.mockResolvedValue([]);

      await service.getAppointments('usr_1');

      const patientArgs = firstCallArgs(
        prisma.client.patient.findFirst.mock.calls as unknown as [
          { where: { userId: string; deletedAt: null } },
        ][],
      );
      expect(patientArgs[0].where).toEqual({ userId: 'usr_1', deletedAt: null });

      const findArgs = firstCallArgs(
        prisma.client.appointment.findMany.mock.calls as unknown as [
          { where: { patientId: string; deletedAt: null } },
        ][],
      );
      expect(findArgs[0].where).toEqual({ patientId: 'pat_1', deletedAt: null });
    });
  });

  describe('requestAppointment', () => {
    it('creates the request with status REQUESTED for the linked patient and resolved doctor', async () => {
      prisma.client.patient.findFirst.mockResolvedValue(LINKED_PATIENT);
      prisma.client.user.findFirst.mockResolvedValue({
        id: 'usr_doc',
        fullName: 'Dra. Patricia Martinangelio',
        specialty: 'Pediatra',
      });
      appointments.create.mockResolvedValue({
        id: 'apt_1',
        dateTime: REQUESTED_SLOT,
        type: 'Control',
        notes: null,
        status: 'REQUESTED',
        patientId: 'pat_1',
        doctorId: 'usr_doc',
      });

      const result = await service.requestAppointment('usr_1', {
        dateTime: REQUESTED_SLOT,
        type: 'Control',
      });

      const createArgs = firstCallArgs(
        appointments.create.mock.calls as unknown as [
          { status: string; patientId: string; doctorId: string },
          string,
        ][],
      );
      expect(createArgs[0].status).toBe('REQUESTED');
      expect(createArgs[0].patientId).toBe('pat_1');
      expect(createArgs[0].doctorId).toBe('usr_doc');
      expect(createArgs[1]).toBe('usr_1');

      expect(result.status).toBe('REQUESTED');
      expect(result.doctor.fullName).toBe('Dra. Patricia Martinangelio');
    });
  });

  describe('createPatient (self-onboarding)', () => {
    const patientInput = {
      firstName: 'Mateo',
      lastName: 'González',
      dateOfBirth: new Date('2020-05-10'),
      biologicalSex: 'MALE' as const,
      guardianFullName: 'Ana González',
      guardianPhone: '+5493410000000',
      guardianRelationship: 'MOTHER' as const,
    };

    it('creates the record linked to the account with the account email as guardian email', async () => {
      prisma.client.patient.findFirst.mockResolvedValue(null);
      prisma.client.user.findFirst.mockResolvedValue({ email: 'ana@example.com' });
      prisma.client.patient.create.mockResolvedValue({
        id: 'pat_new',
        firstName: 'Mateo',
        lastName: 'González',
        dateOfBirth: new Date('2020-05-10'),
        guardianFullName: 'Ana González',
      });

      const result = await service.createPatient('usr_1', patientInput);

      const createArgs = firstCallArgs(
        prisma.client.patient.create.mock.calls as unknown as [
          {
            data: {
              userId: string;
              guardianEmail: string;
              documentNumber: string | null;
            };
          },
        ][],
      );
      expect(createArgs[0].data.userId).toBe('usr_1');
      expect(createArgs[0].data.guardianEmail).toBe('ana@example.com');
      expect(createArgs[0].data.documentNumber).toBeNull();

      const auditArgs = firstCallArgs(
        audit.log.mock.calls as unknown as [{ action: string; userId: string }][],
      );
      expect(auditArgs[0].action).toBe('CREATE_PATIENT');
      expect(auditArgs[0].userId).toBe('usr_1');

      expect(result.id).toBe('pat_new');
    });

    it('throws ConflictException when the account already has a linked record', async () => {
      prisma.client.patient.findFirst.mockResolvedValue({ id: 'pat_1' });

      await expect(service.createPatient('usr_1', patientInput)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.client.patient.create).not.toHaveBeenCalled();
    });
  });
});
