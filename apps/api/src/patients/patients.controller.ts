import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreatePatientDto } from './dto/create-patient.dto.js';
import { PatientsService } from './patients.service.js';

/**
 * PatientsController — REST endpoints for pediatric patient management.
 *
 * Base path: /api/v1/patients
 *
 * Endpoints:
 *  POST   /api/v1/patients        - Create patient (201)
 *  GET    /api/v1/patients        - List active patients (200)
 *  DELETE /api/v1/patients/:id    - Soft-delete patient (204)
 */
@ApiTags('patients')
@Controller({ path: 'patients', version: '1' })
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  /**
   * POST /api/v1/patients
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
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  /**
   * GET /api/v1/patients
   */
  @Get()
  @ApiOperation({
    summary: 'List active patients',
    description:
      'Returns all active non-deleted patients (deletedAt: null), ordered by createdAt descending.',
  })
  @ApiOkResponse({
    description: 'List of active patients.',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/CreatePatientDto' },
    },
  })
  findAll() {
    return this.patientsService.findAll();
  }

  /**
   * DELETE /api/v1/patients/:id
   * Soft-delete: sets deletedAt, does NOT perform a physical delete.
   */
  @Delete(':id')
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
  async softDelete(@Param('id') id: string): Promise<void> {
    await this.patientsService.softDelete(id);
  }
}

