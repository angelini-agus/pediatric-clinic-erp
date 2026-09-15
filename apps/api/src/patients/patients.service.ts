import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuditService } from '../audit/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type { CreatePatientDto } from './dto/create-patient.dto.js';
import type { Prisma } from '@pediatric-erp/db';
import type { LinkPatientAccount } from '@pediatric-erp/schemas';

/** Full Patient record type (without includes). */
type Patient = Prisma.PatientGetPayload<Record<string, never>>;

/** Default page size for server-side pagination. */
const DEFAULT_PAGE_SIZE = 20;
/** Hard cap on page size (anti-DoS). */
const MAX_PAGE_SIZE = 100;

/** Options accepted by `findAll` (query filters + pagination). */
export type FindAllPatientsOptions = {
  /** Free-text search on firstName, lastName or documentNumber. */
  query?: string;
  /** 1-indexed page number. */
  page?: number;
  /** Items per page. */
  pageSize?: number;
};

/** Paginated patient list payload. */
export type PatientsPage = {
  data: Patient[];
  total: number;
};

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Creates a new patient in the database and records an audit event.
   *
   * @param dto - Validated input data (via Zod + nestjs-zod)
   * @param actorId - Authenticated user id (req.user.sub)
   * @returns Newly created patient record
   */
  async create(dto: CreatePatientDto, actorId: string): Promise<Patient> {
    const patient = await this.prisma.client.patient.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        documentType: dto.documentType,
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

    await this.audit.log({
      action: 'CREATE_PATIENT',
      entityName: 'Patient',
      entityId: patient.id,
      userId: actorId,
      patientId: patient.id,
    });

    return patient;
  }

  /**
   * Returns a page of active (non-deleted) patients, optionally filtered
   * by a free-text query across firstName, lastName and documentNumber
   * (case-insensitive `contains`, served by the
   * `patients_lastName_firstName_idx` and `patients_documentNumber_idx`
   * indexes).
   *
   * STRICT RULE: Query MUST include `where: { deletedAt: null }`.
   */
  async findAll(options: FindAllPatientsOptions = {}): Promise<PatientsPage> {
    const rawPage = options.page ?? 1;
    const rawPageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize = Number.isFinite(rawPageSize)
      ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(rawPageSize)))
      : DEFAULT_PAGE_SIZE;
    const query = options.query?.trim();

    const where: Prisma.PatientWhereInput = { deletedAt: null };
    if (query !== undefined && query.length > 0) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { documentNumber: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.client.$transaction([
      this.prisma.client.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.client.patient.count({ where }),
    ]);

    return { data, total };
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
   * Marks a patient as deleted (soft-delete) and records an audit event.
   *
   * STRICT RULE: NEVER use prisma.patient.delete().
   * `deletedAt` is set to current date and time.
   *
   * @param id - Patient CUID ID
   * @param actorId - Authenticated user id (req.user.sub)
   * @returns Updated record with `deletedAt` set
   * @throws NotFoundException if patient does not exist (Prisma P2025)
   */
  async softDelete(id: string, actorId: string): Promise<Patient> {
    try {
      const patient = await this.prisma.client.patient.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await this.audit.log({
        action: 'SOFT_DELETE_PATIENT',
        entityName: 'Patient',
        entityId: id,
        userId: actorId,
        patientId: id,
      });

      return patient;
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

  /**
   * Links a patient record to a PATIENT user account (portal access),
   * matched by email.
   *
   * Rules:
   *  - The patient must exist and be active.
   *  - The patient must not be linked yet.
   *  - The account must exist, be active and have role PATIENT.
   *  - One account per patient record (unique `userId`).
   *
   * AUDIT: records LINK_PATIENT_ACCOUNT with the actor (payload carries the
   * account id — no PHI).
   *
   * @throws NotFoundException when the patient or the account does not exist
   * @throws BadRequestException when the account is not a PATIENT account
   * @throws ConflictException when either side is already linked
   */
  async linkAccount(patientId: string, dto: LinkPatientAccount, actorId: string): Promise<Patient> {
    const patient = await this.prisma.client.patient.findFirst({
      where: { id: patientId, deletedAt: null },
      select: { id: true, userId: true },
    });

    if (patient === null) {
      throw new NotFoundException(`Patient with id '${patientId}' not found`);
    }

    if (patient.userId !== null) {
      throw new ConflictException('El paciente ya tiene una cuenta del portal vinculada');
    }

    const user = await this.prisma.client.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      select: { id: true, role: true },
    });

    if (user === null) {
      throw new NotFoundException('No existe una cuenta registrada con ese email');
    }

    if (user.role !== 'PATIENT') {
      throw new BadRequestException('Esa cuenta no es una cuenta de paciente');
    }

    const alreadyLinked = await this.prisma.client.patient.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true },
    });

    if (alreadyLinked !== null) {
      throw new ConflictException('Esa cuenta ya está vinculada a otro paciente');
    }

    const updated = await this.prisma.client.patient.update({
      where: { id: patient.id },
      data: { userId: user.id },
    });

    await this.audit.log({
      action: 'LINK_PATIENT_ACCOUNT',
      entityName: 'Patient',
      entityId: patient.id,
      userId: actorId,
      patientId: patient.id,
      payload: { accountId: user.id },
    });

    return updated;
  }

  /**
   * Unlinks the portal account from a patient record (the user account is
   * NOT deleted — only the association is removed).
   *
   * AUDIT: records UNLINK_PATIENT_ACCOUNT with the actor.
   *
   * @throws NotFoundException when the patient does not exist
   * @throws ConflictException when the patient has no linked account
   */
  async unlinkAccount(patientId: string, actorId: string): Promise<Patient> {
    const patient = await this.prisma.client.patient.findFirst({
      where: { id: patientId, deletedAt: null },
      select: { id: true, userId: true },
    });

    if (patient === null) {
      throw new NotFoundException(`Patient with id '${patientId}' not found`);
    }

    if (patient.userId === null) {
      throw new ConflictException('El paciente no tiene una cuenta vinculada');
    }

    const previousAccountId = patient.userId;

    const updated = await this.prisma.client.patient.update({
      where: { id: patient.id },
      data: { userId: null },
    });

    await this.audit.log({
      action: 'UNLINK_PATIENT_ACCOUNT',
      entityName: 'Patient',
      entityId: patient.id,
      userId: actorId,
      patientId: patient.id,
      payload: { accountId: previousAccountId },
    });

    return updated;
  }
}
