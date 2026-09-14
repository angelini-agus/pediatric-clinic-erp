import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import type { CreateMedicalRecordDto } from './dto/create-medical-record.dto.js';
import type { Prisma } from '@pediatric-erp/db';

/** Default page size for server-side pagination. */
const DEFAULT_PAGE_SIZE = 20;
/** Hard cap on page size (anti-DoS). */
const MAX_PAGE_SIZE = 100;

/** MedicalRecord type with doctor details included. */
export type MedicalRecordWithDoctor = Prisma.MedicalRecordGetPayload<{
  include: {
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

/** MedicalRecord type with both doctor and patient details included. */
export type MedicalRecordWithPatientAndDoctor = Prisma.MedicalRecordGetPayload<{
  include: {
    doctor: {
      select: {
        id: true;
        fullName: true;
        specialty: true;
        medicalLicense: true;
      };
    };
    patient: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        documentType: true;
        documentNumber: true;
      };
    };
  };
}>;

/** Paginated medical records payload. */
export type MedicalRecordsPage = {
  data: MedicalRecordWithPatientAndDoctor[];
  total: number;
};

/**
 * MedicalRecordsService — business logic for patient clinical records.
 *
 * ARCHITECTURAL RULE (Law 26.529 — Immutability & Auditability):
 * - Clinical evolutions are APPEND-ONLY.
 * - STRICTLY NO UPDATE OR DELETE operations are exposed.
 * - Every creation MUST write an AuditLog entry in the same transaction.
 */
@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns a page of all clinical history records across all patients,
   * ordered by creation date descending. Includes doctor and patient
   * metadata. Uses `skip`/`take` (served by the
   * `medical_records_patientId_createdAt_idx` / `medical_records_deletedAt_idx`
   * indexes) and returns the total count for pagination UIs.
   *
   * @param page - 1-indexed page number (default 1)
   * @param pageSize - Items per page (default 20, max 100)
   * @returns { data, total } page of medical records with doctor and patient metadata
   */
  async findAll(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<MedicalRecordsPage> {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safePageSize = Number.isFinite(pageSize)
      ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)))
      : DEFAULT_PAGE_SIZE;

    const [data, total] = await this.prisma.client.$transaction([
      this.prisma.client.medicalRecord.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          doctor: {
            select: {
              id: true,
              fullName: true,
              specialty: true,
              medicalLicense: true,
            },
          },
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              documentType: true,
              documentNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
      this.prisma.client.medicalRecord.count({
        where: { deletedAt: null },
      }),
    ]);

    return { data, total };
  }

  /**
   * Returns full clinical history for a patient, ordered by creation date descending.
   *
   * @param patientId - Patient CUID ID
   * @returns Array of medical records with doctor metadata included
   * @throws NotFoundException if patient does not exist
   */
  async findByPatientId(patientId: string): Promise<MedicalRecordWithDoctor[]> {
    const patient = await this.prisma.client.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id '${patientId}' not found`);
    }

    return this.prisma.client.medicalRecord.findMany({
      where: {
        patientId,
        deletedAt: null,
      },
      include: {
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
        createdAt: 'desc',
      },
    });
  }

  /**
   * Creates a new immutable medical record entry and logs audit trail.
   * Runs in a single atomic Prisma transaction ($transaction).
   *
   * SECURITY (Law 26.529 — Anti-forgery):
   *   - `doctorId` MUST be the id of the authenticated user extracted
   *     server-side from `req.user.sub` (JWT payload). It is NEVER read
   *     from the request body, NEVER defaulted, NEVER looked up as the
   *     "first user in the DB". Forging a record on behalf of another
   *     doctor is therefore impossible from the client side.
   *   - Defense-in-depth: the authenticated user MUST exist in the DB,
   *     must be active (deletedAt: null) and must still hold the DOCTOR
   *     role. A JWT remains valid until expiry even if the account was
   *     soft-deleted or demoted; this check rejects that window.
   *
   * @param patientId - Patient CUID ID
   * @param doctorId  - Authenticated user id (must match the JWT subject)
   * @param dto       - Validated medical record payload
   * @returns Newly created medical record with doctor metadata
   * @throws NotFoundException if patient does not exist
   * @throws ForbiddenException if the authenticated user is not an active DOCTOR
   */
  async create(
    patientId: string,
    doctorId: string,
    dto: CreateMedicalRecordDto,
  ): Promise<MedicalRecordWithDoctor> {
    const patient = await this.prisma.client.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id '${patientId}' not found`);
    }

    const doctor = await this.prisma.client.user.findFirst({
      where: { id: doctorId, role: 'DOCTOR', deletedAt: null },
      select: { id: true },
    });

    if (!doctor) {
      throw new ForbiddenException(
        `Authenticated user '${doctorId}' is not an active DOCTOR. Clinical signature rejected.`,
      );
    }

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Create the MedicalRecord — `doctorId` comes from the JWT,
      //    NEVER from the request body.
      const medicalRecord = await tx.medicalRecord.create({
        data: {
          patientId,
          doctorId,
          diagnosis: dto.diagnosis,
          notes: dto.notes,
          treatment: dto.treatment ?? null,
          prescription: dto.prescription ?? null,
        },
        include: {
          doctor: {
            select: {
              id: true,
              fullName: true,
              specialty: true,
              medicalLicense: true,
            },
          },
        },
      });

      // 2. Audit Trail (Law 26.529 Compliance) — `userId` mirrors the
      //    authenticated subject so the chain of custody is unambiguous.
      await tx.auditLog.create({
        data: {
          action: 'CREATE_MEDICAL_RECORD',
          entityName: 'MedicalRecord',
          entityId: medicalRecord.id,
          userId: doctorId,
          patientId,
          payload: {
            diagnosis: dto.diagnosis,
            notes: dto.notes,
            treatment: dto.treatment ?? null,
            prescription: dto.prescription ?? null,
          },
        },
      });

      return medicalRecord;
    });
  }
}
