import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator.js';

import { PortalAppointmentRequestDto } from './dto/portal-appointment-request.dto.js';
import { PortalPatientCreateDto } from './dto/portal-patient-create.dto.js';
import { PortalService } from './portal.service.js';

import type { PortalAppointment, PortalClinicInfo, PortalPatient } from './portal.service.js';
import type { JwtPayload } from '../auth/jwt.strategy.js';
import type { FastifyRequest } from 'fastify';

/**
 * PortalController — patient-facing endpoints.
 *
 * Base path: /api/v1/portal
 *
 * Endpoints:
 *  GET  /api/v1/portal/me            - Own profile + link status (200)
 *  GET  /api/v1/portal/appointments  - Own appointments (200)
 *  GET  /api/v1/portal/clinic        - Clinic info + exact address (200)
 *  POST /api/v1/portal/appointments  - Request an appointment (201)
 *
 * RBAC: exclusively PATIENT accounts. Every query is scoped server-side to
 * the patient record linked to the JWT user (no patient id in the request).
 */
@ApiTags('portal')
@Controller({ path: 'portal', version: '1' })
@Roles('PATIENT')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  /**
   * GET /api/v1/portal/me
   * Own profile and link status. `patient: null` means the account is not
   * linked yet.
   */
  @Get('me')
  @ApiOperation({
    summary: 'Own patient profile and link status',
    description:
      'Returns the patient record linked to the authenticated account, or null when the account has no linked record yet.',
  })
  @ApiOkResponse({ description: 'Own profile (patient may be null).' })
  getMe(
    @Req() request: FastifyRequest & { user: JwtPayload },
  ): Promise<{ patient: PortalPatient | null }> {
    return this.portalService.getMe(request.user.sub);
  }

  /**
   * GET /api/v1/portal/appointments
   * Own appointments (all statuses, newest first).
   */
  @Get('appointments')
  @ApiOperation({
    summary: 'Own appointments',
    description: 'Returns the appointments of the linked patient record.',
  })
  @ApiOkResponse({ description: 'Own appointments.' })
  @ApiForbiddenResponse({ description: 'Account not linked to a patient record.' })
  getAppointments(
    @Req() request: FastifyRequest & { user: JwtPayload },
  ): Promise<PortalAppointment[]> {
    return this.portalService.getAppointments(request.user.sub);
  }

  /**
   * GET /api/v1/portal/clinic
   * Clinic info including the exact address (published only behind login).
   */
  @Get('clinic')
  @ApiOperation({
    summary: 'Clinic info including the exact address',
    description:
      'Returns the clinic name, exact address and professional data for registered patients.',
  })
  @ApiOkResponse({ description: 'Clinic info.' })
  getClinic(): Promise<PortalClinicInfo> {
    return this.portalService.getClinic();
  }

  /**
   * POST /api/v1/portal/patient
   * Self-onboarding: creates the patient record from the portal data and
   * links it to the authenticated account (no staff intervention).
   */
  @Post('patient')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create the patient record (self-onboarding)',
    description:
      'Creates the patient record with the minimum data and links it to the authenticated account, so a newly registered user can request appointments immediately. The clinic completes the record later.',
  })
  @ApiCreatedResponse({ description: 'Patient record created and linked.' })
  @ApiConflictResponse({ description: 'The account already has a linked patient record.' })
  createPatient(
    @Body() dto: PortalPatientCreateDto,
    @Req() request: FastifyRequest & { user: JwtPayload },
  ): Promise<PortalPatient> {
    return this.portalService.createPatient(request.user.sub, dto);
  }

  /**
   * POST /api/v1/portal/appointments
   * Requests an appointment for the linked patient (status REQUESTED,
   * pending staff confirmation).
   */
  @Post('appointments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Request an appointment',
    description:
      'Creates an appointment request (status REQUESTED) for the linked patient. The clinic confirms it from the staff dashboard.',
  })
  @ApiCreatedResponse({ description: 'Appointment requested.' })
  @ApiForbiddenResponse({ description: 'Account not linked to a patient record.' })
  requestAppointment(
    @Body() dto: PortalAppointmentRequestDto,
    @Req() request: FastifyRequest & { user: JwtPayload },
  ): Promise<PortalAppointment> {
    return this.portalService.requestAppointment(request.user.sub, dto);
  }
}
