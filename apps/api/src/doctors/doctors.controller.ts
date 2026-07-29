import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DoctorsService, type DoctorListItem } from './doctors.service.js';

/**
 * DoctorsController — read-only endpoints for doctor/user lookup.
 *
 * Base path: /api/v1/doctors
 *
 * Endpoints:
 *  GET /api/v1/doctors - List all active doctors (200)
 */
@ApiTags('doctors')
@Controller({ path: 'doctors', version: '1' })
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  /**
   * GET /api/v1/doctors
   * Lists all active users with role DOCTOR.
   */
  @Get()
  @ApiOperation({
    summary: 'List active doctors',
    description: 'Returns all active (deletedAt: null) users with role DOCTOR, ordered by fullName.',
  })
  @ApiOkResponse({ description: 'List of active doctors.' })
  findAll(): Promise<DoctorListItem[]> {
    return this.doctorsService.findAll();
  }
}
