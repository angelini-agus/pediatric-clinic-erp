import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { AuditService } from '../audit/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import { PatientsService } from './patients.service.js';

/** Returns the first element of a mock call list (throws when never called). */
function firstCallArgs<T>(calls: T[]): T {
  const first = calls[0];
  if (first === undefined) {
    throw new Error('Mock was not called');
  }
  return first;
}

describe('PatientsService — portal account linking', () => {
  let service: PatientsService;
  let prisma: {
    client: {
      patient: { findFirst: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
      user: { findFirst: ReturnType<typeof vi.fn> };
    };
  };
  let audit: { log: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      client: {
        patient: { findFirst: vi.fn(), update: vi.fn() },
        user: { findFirst: vi.fn() },
      },
    };
    audit = { log: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  describe('linkAccount', () => {
    it('links the patient and records the audit event', async () => {
      prisma.client.patient.findFirst
        .mockResolvedValueOnce({ id: 'pat_1', userId: null })
        .mockResolvedValueOnce(null);
      prisma.client.user.findFirst.mockResolvedValue({ id: 'usr_pat', role: 'PATIENT' });
      prisma.client.patient.update.mockResolvedValue({ id: 'pat_1', userId: 'usr_pat' });

      const result = await service.linkAccount('pat_1', { email: 'ana@example.com' }, 'usr_admin');

      expect(prisma.client.patient.update).toHaveBeenCalledWith({
        where: { id: 'pat_1' },
        data: { userId: 'usr_pat' },
      });

      const auditArgs = firstCallArgs(
        audit.log.mock.calls as unknown as [{ action: string; entityId: string; userId: string }][],
      );
      expect(auditArgs[0].action).toBe('LINK_PATIENT_ACCOUNT');
      expect(auditArgs[0].entityId).toBe('pat_1');
      expect(auditArgs[0].userId).toBe('usr_admin');

      expect(result.userId).toBe('usr_pat');
    });

    it('throws NotFoundException when the patient does not exist', async () => {
      prisma.client.patient.findFirst.mockResolvedValue(null);

      await expect(
        service.linkAccount('pat_missing', { email: 'ana@example.com' }, 'usr_admin'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.client.patient.update).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the patient is already linked', async () => {
      prisma.client.patient.findFirst.mockResolvedValue({ id: 'pat_1', userId: 'usr_other' });

      await expect(
        service.linkAccount('pat_1', { email: 'ana@example.com' }, 'usr_admin'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws NotFoundException when no account has that email', async () => {
      prisma.client.patient.findFirst.mockResolvedValue({ id: 'pat_1', userId: null });
      prisma.client.user.findFirst.mockResolvedValue(null);

      await expect(
        service.linkAccount('pat_1', { email: 'nadie@example.com' }, 'usr_admin'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when the account is not a PATIENT account', async () => {
      prisma.client.patient.findFirst.mockResolvedValue({ id: 'pat_1', userId: null });
      prisma.client.user.findFirst.mockResolvedValue({ id: 'usr_doc', role: 'DOCTOR' });

      await expect(
        service.linkAccount('pat_1', { email: 'doctora@example.com' }, 'usr_admin'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.client.patient.update).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the account is already linked to another patient', async () => {
      prisma.client.patient.findFirst
        .mockResolvedValueOnce({ id: 'pat_1', userId: null })
        .mockResolvedValueOnce({ id: 'pat_other' });
      prisma.client.user.findFirst.mockResolvedValue({ id: 'usr_pat', role: 'PATIENT' });

      await expect(
        service.linkAccount('pat_1', { email: 'ana@example.com' }, 'usr_admin'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.client.patient.update).not.toHaveBeenCalled();
    });
  });

  describe('unlinkAccount', () => {
    it('clears the link and records the audit event', async () => {
      prisma.client.patient.findFirst.mockResolvedValue({ id: 'pat_1', userId: 'usr_pat' });
      prisma.client.patient.update.mockResolvedValue({ id: 'pat_1', userId: null });

      await service.unlinkAccount('pat_1', 'usr_admin');

      expect(prisma.client.patient.update).toHaveBeenCalledWith({
        where: { id: 'pat_1' },
        data: { userId: null },
      });

      const auditArgs = firstCallArgs(audit.log.mock.calls as unknown as [{ action: string }][]);
      expect(auditArgs[0].action).toBe('UNLINK_PATIENT_ACCOUNT');
    });

    it('throws ConflictException when the patient has no linked account', async () => {
      prisma.client.patient.findFirst.mockResolvedValue({ id: 'pat_1', userId: null });

      await expect(service.unlinkAccount('pat_1', 'usr_admin')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.client.patient.update).not.toHaveBeenCalled();
    });
  });
});
