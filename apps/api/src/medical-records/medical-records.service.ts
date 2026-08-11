import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@pediatric-erp/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateMedicalRecordDto } from './dto/create-medical-record.dto.js';

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
   * Returns all clinical history records across all patients, ordered by creation date descending.
   * Includes doctor and patient metadata.
   *
   * @returns Array of medical records with doctor and patient metadata included
   */
  async findAll(): Promise<MedicalRecordWithPatientAndDoctor[]> {
    return this.prisma.client.medicalRecord.findMany({
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
    });
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
   * @param patientId - Patient CUID ID
   * @param dto - Validated medical record payload
   * @returns Newly created medical record with doctor metadata
   * @throws NotFoundException if patient does not exist
   */
  async create(
    patientId: string,
    dto: CreateMedicalRecordDto,
  ): Promise<MedicalRecordWithDoctor> {
    const patient = await this.prisma.client.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id '${patientId}' not found`);
    }

    let doctorId = dto['doctorId'];
    if (!doctorId) {
      const defaultDoctor = await this.prisma.client.user.findFirst({
        where: { deletedAt: null },
      });
      if (!defaultDoctor) {
        throw new NotFoundException('No active doctor found in database');
      }
      doctorId = defaultDoctor.id;
    }

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Create the MedicalRecord
      const medicalRecord = await tx.medicalRecord.create({
        data: {
          patientId,
          doctorId,
          diagnosis: dto['diagnosis'],
          notes: dto['notes'],
          treatment: dto['treatment'] ?? null,
          prescription: dto['prescription'] ?? null,
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

      // 2. Audit Trail (Law 26.529 Compliance)
      await tx.auditLog.create({
        data: {
          action: 'CREATE_MEDICAL_RECORD',
          entityName: 'MedicalRecord',
          entityId: medicalRecord.id,
          userId: doctorId,
          patientId,
          payload: {
            diagnosis: dto['diagnosis'],
            notes: dto['notes'],
            treatment: dto['treatment'] ?? null,
            prescription: dto['prescription'] ?? null,
          },
        },
      });

      return medicalRecord;
    });
  }
}
