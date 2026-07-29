import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@pediatric-erp/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreatePatientDto } from './dto/create-patient.dto.js';

/** Full Patient record type (without includes). */
type Patient = Prisma.PatientGetPayload<Record<string, never>>;

/**
 * PatientsService — business logic for patient management.
 *
 * ARCHITECTURAL RULE (Law 26.529):
 * - MANDATORY Soft-delete: never use prisma.patient.delete()
 * - The `deletedAt` field marks the record as deleted
 * - All read queries MUST filter by `deletedAt: null`
 */
@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new patient in the database.
   * @param dto - Validated input data (via Zod + nestjs-zod)
   * @returns Newly created patient record
   */
  async create(dto: CreatePatientDto): Promise<Patient> {
    return this.prisma.client.patient.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        documentType: dto.documentType ?? 'DNI',
        documentNumber: dto.documentNumber,
        dateOfBirth: dto.dateOfBirth,
        biologicalSex: dto.biologicalSex,
        bloodGroup: dto.bloodGroup ?? null,
        healthInsurance: dto.healthInsurance ?? null,
        healthInsurancePlan: dto.healthInsurancePlan ?? null,
        healthInsuranceNumber: dto.healthInsuranceNumber ?? null,
        guardianFullName: dto.guardianFullName,
        guardianPhone: dto.guardianPhone,
        guardianEmail: dto.guardianEmail ?? null,
        guardianRelationship: dto.guardianRelationship,
        birthWeightGrams: dto.birthWeightGrams ?? null,
        gestationalWeeks: dto.gestationalWeeks ?? null,
        apgarScore: dto.apgarScore ?? null,
      },
    });
  }

  /**
   * Returns all active (non-deleted) patients.
   *
   * STRICT RULE: Query MUST include `where: { deletedAt: null }`.
   */
  async findAll(): Promise<Patient[]> {
    return this.prisma.client.patient.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Returns a single active patient by ID.
   *
   * @param id - Patient CUID ID
   * @returns Patient record
   * @throws NotFoundException if patient does not exist or is soft-deleted
   */
  async findOne(id: string): Promise<Patient> {
    const patient = await this.prisma.client.patient.findFirst({
      where: { id, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id '${id}' not found`);
    }

    return patient;
  }

  /**
   * Marks a patient as deleted (soft-delete).
   *
   * STRICT RULE: NEVER use prisma.patient.delete().
   * `deletedAt` is set to current date and time.
   *
   * @param id - Patient CUID ID
   * @returns Updated record with `deletedAt` set
   * @throws NotFoundException if patient does not exist (Prisma P2025)
   */
  async softDelete(id: string): Promise<Patient> {
    try {
      return await this.prisma.client.patient.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      // Prisma P2025: "Record to update not found"
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException(`Patient with id '${id}' not found`);
      }
      throw error;
    }
  }
}

