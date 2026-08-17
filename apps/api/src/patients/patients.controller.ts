import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';


import { Roles } from '../common/decorators/roles.decorator.js';

import { CreatePatientDto } from './dto/create-patient.dto.js';
import { PatientsService, type PatientsPage } from './patients.service.js';

import type { JwtPayload } from '../auth/jwt.strategy.js';
import type { Prisma } from '@pediatric-erp/db';
import type { FastifyRequest } from 'fastify';

type Patient = Prisma.PatientGetPayload<Record<string, never>>;

/**
 * PatientsController — REST endpoints for pediatric patient management.
 *
 * Base path: /api/v1/patients
 *
 * Endpoints:
 *  POST   /api/v1/patients        - Create patient (201)
 *  GET    /api/v1/patients        - List active patients (200)
 *  DELETE /api/v1/patients/:id    - Soft-delete patient (204)
 *
 * RBAC:
 * - Class default: all staff (SECRETARY, ADMIN, DOCTOR, SUPER_ADMIN)
 *   manage patient demographics.
 * - DELETE override: only ADMIN / SUPER_ADMIN can soft-delete a
 *   patient record (Law 26.529 — the act affects the legal archive).
 */
@ApiTags('patients')
@Controller({ path: 'patients', version: '1' })
@Roles('SECRETARY', 'ADMIN', 'DOCTOR', 'SUPER_ADMIN')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  /**
   * POST /api/v1/patients
   * Creates a patient. The authenticated user (`req.user.sub`) is
   * recorded as the audit actor.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create pediatric patient',
    description:
      'Registers a new patient in the system. Validates clinical data (date of birth, weight, gestational weeks) via Zod.',
  })
  @ApiCreatedResponse({
    description: 'Patient created successfully.',
    schema: { $ref: '#/components/schemas/CreatePatientDto' },
  })
  create(
    @Body() dto: CreatePatientDto,
    @Req() request: FastifyRequest & { user: JwtPayload },
  ): Promise<Patient> {
    return this.patientsService.create(dto, request.user.sub);
  }

  /**
   * GET /api/v1/patients?q=...&page=...&pageSize=...
   * Returns a paginated list of active patients. `q` filters by
   * firstName / lastName / documentNumber (case-insensitive contains).
   */
  @Get()
  @ApiOperation({
    summary: 'List active patients (paginated, searchable)',
    description:
      'Returns a page of active non-deleted patients (deletedAt: null), ordered by createdAt descending. Supports `q` (free-text search over name/DNI) and `page`/`pageSize` (pagination).',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Free-text search on firstName, lastName or documentNumber.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '1-indexed page number (default 1).',
    example: '1',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Items per page (default 20, max 100).',
    example: '12',
  })
  @ApiOkResponse({
    description: 'Paginated list of active patients.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CreatePatientDto' },
        },
        total: { type: 'integer', minimum: 0 },
      },
    },
  })
  findAll(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<PatientsPage> {
    return this.patientsService.findAll({
      ...(q !== undefined ? { query: q } : {}),
      ...(page !== undefined ? { page: Number(page) } : {}),
      ...(pageSize !== undefined ? { pageSize: Number(pageSize) } : {}),
    });
  }

  /**
   * GET /api/v1/patients/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get patient by ID',
    description: 'Returns a single active patient record by CUID ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Patient CUID ID',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiOkResponse({
    description: 'Patient record found.',
  })
  findOne(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.findOne(id);
  }

  /**
   * DELETE /api/v1/patients/:id
   * Soft-delete: sets deletedAt, does NOT perform a physical delete.
   */
  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete patient (soft-delete)',
    description:
      'Marks the patient as deleted by setting deletedAt. The record persists in the database (Law 26.529).',
  })
  @ApiParam({
    name: 'id',
    description: 'Patient CUID ID',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiNoContentResponse({
    description: 'Patient logically deleted (soft-delete).',
  })
  async softDelete(
    @Param('id') id: string,
    @Req() request: FastifyRequest & { user: JwtPayload },
  ): Promise<void> {
    await this.patientsService.softDelete(id, request.user.sub);
  }
}

