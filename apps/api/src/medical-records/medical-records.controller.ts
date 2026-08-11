import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto.js';
import {
  MedicalRecordsService,
  type MedicalRecordWithDoctor,
} from './medical-records.service.js';

/**
 * MedicalRecordsController — REST endpoints for patient clinical histories.
 *
 * Controller path: 'patients' (resolves to /api/v1/patients via URI versioning)
 * Methods:
 *  - POST /api/v1/patients/:patientId/records
 *  - POST /api/v1/patients/:patientId/medical-records
 *  - GET  /api/v1/patients/:patientId/records
 *  - GET  /api/v1/patients/:patientId/medical-records
 *
 * LAW 26.529 IMMUTABILITY RESTRICTION:
 * - NO PATCH, PUT, or DELETE endpoints exist or are allowed.
 * - Clinical evolutions are append-only legal records.
 */
@ApiTags('medical-records')
@Controller({ path: 'patients', version: '1' })
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  /**
   * GET /api/v1/patients/:patientId/records
   * GET /api/v1/patients/:patientId/medical-records
   * Returns complete clinical history for a patient ordered by creation date descending.
   */
  @Get([':patientId/records', ':patientId/medical-records'])
  @ApiOperation({
    summary: 'List patient medical records',
    description:
      'Returns the complete clinical history of a patient, ordered by creation date descending, including doctor details.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient CUID ID',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiOkResponse({
    description: 'List of clinical record evolutions.',
  })
  findByPatientId(
    @Param('patientId') patientId: string,
  ): Promise<MedicalRecordWithDoctor[]> {
    return this.medicalRecordsService.findByPatientId(patientId);
  }

  /**
   * POST /api/v1/patients/:patientId/records
   * POST /api/v1/patients/:patientId/medical-records
   * Appends a new immutable clinical evolution entry to the patient record.
   * Atomically creates an AuditLog entry in the same transaction (Law 26.529 compliance).
   */
  @Post([':patientId/records', ':patientId/medical-records'])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Append medical record entry',
    description:
      'Creates a new immutable clinical evolution entry for a patient. Writes an audit log record atomically (Law 26.529 compliance).',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient CUID ID',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiCreatedResponse({
    description: 'Clinical record evolution appended successfully.',
    schema: { $ref: '#/components/schemas/CreateMedicalRecordDto' },
  })
  create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateMedicalRecordDto,
  ): Promise<MedicalRecordWithDoctor> {
    return this.medicalRecordsService.create(patientId, dto);
  }
}
