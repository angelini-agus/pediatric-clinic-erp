import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@pediatric-erp/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreatePrescriptionDto } from './dto/create-prescription.dto.js';
import {
  PdfGeneratorService,
  type PrescriptionWithRelations,
} from './pdf-generator.service.js';

export type { PrescriptionWithRelations };

/**
 * PrescriptionsService — business logic for medical prescriptions.
 *
 * Compliance (Law 26.529 & Medical Prescriptions):
 * - Prescriptions are immutable append-only records.
 * - Every creation writes an AuditLog entry in the same transaction.
 * - Generates high-fidelity PDF documents on the fly.
 */
@Injectable()
export class PrescriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  /**
   * Creates a new medical prescription and logs audit trail atomically.
   *
   * @param patientId - Patient CUID ID
   * @param dto - Validated prescription payload
   * @returns Created prescription record with relations
   * @throws NotFoundException if patient does not exist
   */
  async create(
    patientId: string,
    dto: CreatePrescriptionDto,
  ): Promise<PrescriptionWithRelations> {
    const patient = await this.prisma.client.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id '${patientId}' not found`);
    }

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Create Prescription
      const prescription = await tx.prescription.create({
        data: {
          patientId,
          doctorId: dto['doctorId'],
          medication: dto['medication'],
          dosage: dto['dosage'],
          instructions: dto['instructions'],
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
      });

      // 2. Audit Trail Log
      await tx.auditLog.create({
        data: {
          action: 'CREATE_PRESCRIPTION',
          entityName: 'Prescription',
          entityId: prescription.id,
          userId: dto['doctorId'],
          patientId,
          payload: {
            medication: dto['medication'],
            dosage: dto['dosage'],
            instructions: dto['instructions'],
          },
        },
      });

      return prescription;
    });
  }

  /**
   * Returns all active prescriptions for a patient, ordered by creation date descending.
   *
   * @param patientId - Patient CUID ID
   * @returns Array of prescriptions with doctor metadata
   */
  async findByPatientId(
    patientId: string,
  ): Promise<PrescriptionWithRelations[]> {
    const patient = await this.prisma.client.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id '${patientId}' not found`);
    }

    return this.prisma.client.prescription.findMany({
      where: {
        patientId,
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
        createdAt: 'desc',
      },
    });
  }

  /**
   * Returns a single prescription by ID.
   *
   * @param id - Prescription CUID ID
   * @returns Prescription record
   * @throws NotFoundException if prescription does not exist
   */
  async findOne(id: string): Promise<PrescriptionWithRelations> {
    const prescription = await this.prisma.client.prescription.findFirst({
      where: { id, deletedAt: null },
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
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with id '${id}' not found`);
    }

    return prescription;
  }

  /**
   * Generates a PDF buffer for a prescription.
   * @param prescription - Prescription record with relations
   * @returns Buffer containing the PDF
   */
  async generatePdfBuffer(
    prescription: PrescriptionWithRelations,
  ): Promise<Buffer> {
    return this.pdfGeneratorService.generatePrescriptionPdf(prescription);
  }
}
