import { Injectable } from '@nestjs/common';
import type { Prisma } from '@pediatric-erp/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreatePatientDto } from './dto/create-patient.dto.js';

/** Tipo de un registro Patient completo (sin includes). */
type Patient = Prisma.PatientGetPayload<Record<string, never>>;

/**
 * PatientsService — lógica de negocio para la gestión de pacientes.
 *
 * REGLA ARQUITECTÓNICA (Ley 26.529):
 * - Soft-delete OBLIGATORIO: nunca usar prisma.patient.delete()
 * - El campo `deletedAt` marca el registro como eliminado
 * - Todas las queries de lectura DEBEN filtrar `deletedAt: null`
 */
@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo paciente en la base de datos.
   * @param dto - Datos validados (vía Zod + nestjs-zod)
   * @returns El registro de paciente recién creado
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
   * Retorna todos los pacientes activos (no eliminados).
   *
   * REGLA ESTRICTA: La query DEBE incluir `where: { deletedAt: null }`.
   */
  async findAll(): Promise<Patient[]> {
    return this.prisma.client.patient.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marca un paciente como eliminado (soft-delete).
   *
   * REGLA ESTRICTA: NUNCA usar prisma.patient.delete().
   * Se setea `deletedAt` con la fecha y hora actual.
   *
   * @param id - ID CUID del paciente
   * @returns El registro actualizado con `deletedAt` seteado
   */
  async softDelete(id: string): Promise<Patient> {
    return this.prisma.client.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
