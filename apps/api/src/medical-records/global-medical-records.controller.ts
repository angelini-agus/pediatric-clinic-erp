import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator.js';

import {
  MedicalRecordsService,
  type MedicalRecordsPage,
} from './medical-records.service.js';

/**
 * GlobalMedicalRecordsController — REST endpoint for global clinical histories across all patients.
 *
 * Controller path: 'medical-records' (resolves to /api/v1/medical-records via URI versioning)
 * Methods:
 *  - GET /api/v1/medical-records?page=1&pageSize=20
 *
 * RBAC: Returns the clinical history of EVERY patient in the clinic —
 * the most sensitive read in the system. Restricted to DOCTOR, ADMIN
 * and SUPER_ADMIN. SECRETARY/PATIENT never access this endpoint.
 */
@ApiTags('medical-records')
@Controller({ path: 'medical-records', version: '1' })
@Roles('DOCTOR', 'ADMIN', 'SUPER_ADMIN')
export class GlobalMedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  /**
   * GET /api/v1/medical-records?page=1&pageSize=20
   * Returns a page of all clinical history evolutions across all
   * patients, ordered by creation date descending, including doctor
   * and patient details, plus the total count for pagination.
   */
  @Get()
  @ApiOperation({
    summary: 'List all medical records globally (paginated)',
    description:
      'Returns a page of all clinical history evolutions across all patients in the clinic, ordered by creation date descending, including doctor and patient details, plus the total count.',
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
    example: '20',
  })
  @ApiOkResponse({
    description: 'Paginated list of global clinical record evolutions.',
  })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<MedicalRecordsPage> {
    return this.medicalRecordsService.findAll(
      page !== undefined ? Number(page) : undefined,
      pageSize !== undefined ? Number(pageSize) : undefined,
    );
  }
}
