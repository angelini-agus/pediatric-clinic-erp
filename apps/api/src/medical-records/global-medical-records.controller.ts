import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  MedicalRecordsService,
  type MedicalRecordWithPatientAndDoctor,
} from './medical-records.service.js';

/**
 * GlobalMedicalRecordsController — REST endpoint for global clinical histories across all patients.
 *
 * Controller path: 'medical-records' (resolves to /api/v1/medical-records via URI versioning)
 * Methods:
 *  - GET /api/v1/medical-records
 */
@ApiTags('medical-records')
@Controller({ path: 'medical-records', version: '1' })
export class GlobalMedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  /**
   * GET /api/v1/medical-records
   * Returns all clinical history evolutions across all patients ordered by creation date descending.
   */
  @Get()
  @ApiOperation({
    summary: 'List all medical records globally',
    description:
      'Returns all clinical history evolutions across all patients in the clinic, ordered by creation date descending, including doctor and patient details.',
  })
  @ApiOkResponse({
    description: 'List of global clinical record evolutions.',
  })
  findAll(): Promise<MedicalRecordWithPatientAndDoctor[]> {
    return this.medicalRecordsService.findAll();
  }
}
