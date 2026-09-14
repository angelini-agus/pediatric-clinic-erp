import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator.js';

import {
  AppointmentsService,
  type AppointmentWithDetails,
  type AppointmentRecord,
} from './appointments.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto.js';

import type { JwtPayload } from '../auth/jwt.strategy.js';
import type { FastifyRequest } from 'fastify';

/**
 * AppointmentsController — REST endpoints for medical appointment management.
 *
 * Base path: /api/v1/appointments
 *
 * Endpoints:
 *  GET    /api/v1/appointments/today       - List today's active appointments (200)
 *  POST   /api/v1/appointments             - Schedule new appointment (201)
 *  PATCH  /api/v1/appointments/:id/status   - Update appointment status (200)
 *  DELETE /api/v1/appointments/:id          - Soft-delete appointment (204)
 *
 * RBAC:
 * - Class default: all staff (SECRETARY, ADMIN, DOCTOR, SUPER_ADMIN)
 *   schedule and operate appointments.
 * - DELETE override: only ADMIN / SUPER_ADMIN can soft-delete an
 *   appointment (cancellations are safer done via status=CANCELED).
 */
@ApiTags('appointments')
@Controller({ path: 'appointments', version: '1' })
@Roles('SECRETARY', 'ADMIN', 'DOCTOR', 'SUPER_ADMIN')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * GET /api/v1/appointments/today
   * Key endpoint for Dashboard — returns today's appointments with patient and doctor data included.
   */
  @Get('today')
  @ApiOperation({
    summary: "List today's active appointments",
    description:
      'Returns all active appointments scheduled for today (00:00 to 23:59), including patient details and doctor metadata. Filters deletedAt: null.',
  })
  @ApiOkResponse({
    description: "Today's active appointments with patient and doctor details.",
  })
  findToday(): Promise<AppointmentWithDetails[]> {
    return this.appointmentsService.findToday();
  }

  /**
   * GET /api/v1/appointments/upcoming
   * Returns all future (dateTime >= now) active appointments with patient + doctor data.
   */
  @Get('upcoming')
  @ApiOperation({
    summary: 'List upcoming appointments',
    description:
      'Returns all non-deleted appointments scheduled from now onwards, ordered by dateTime ascending.',
  })
  @ApiOkResponse({
    description: 'Upcoming appointments with patient and doctor details.',
  })
  findUpcoming(): Promise<AppointmentWithDetails[]> {
    return this.appointmentsService.findUpcoming();
  }

  /**
   * POST /api/v1/appointments
   * Schedules a new appointment.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Schedule new appointment',
    description: 'Creates a new medical appointment record in the database. Validated via Zod.',
  })
  @ApiCreatedResponse({
    description: 'Appointment scheduled successfully.',
    schema: { $ref: '#/components/schemas/CreateAppointmentDto' },
  })
  create(
    @Body() dto: CreateAppointmentDto,
    @Req() request: FastifyRequest & { user: JwtPayload },
  ): Promise<AppointmentRecord> {
    return this.appointmentsService.create(dto, request.user.sub);
  }

  /**
   * PATCH /api/v1/appointments/:id/status
   * Updates an appointment's status (e.g. SCHEDULED -> IN_PROGRESS -> COMPLETED).
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update appointment status',
    description:
      'Updates the status of an existing appointment (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELED).',
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment CUID ID',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiOkResponse({
    description: 'Appointment status updated successfully.',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
    @Req() request: FastifyRequest & { user: JwtPayload },
  ): Promise<AppointmentRecord> {
    return this.appointmentsService.updateStatus(id, dto, request.user.sub);
  }

  /**
   * DELETE /api/v1/appointments/:id
   * Soft-delete: sets deletedAt with current date, does NOT physically delete record.
   */
  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete appointment (soft-delete)',
    description:
      'Marks the appointment as deleted by setting deletedAt. Record persists in the database (Law 26.529).',
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment CUID ID',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiNoContentResponse({
    description: 'Appointment logically deleted (soft-delete).',
  })
  async softDelete(
    @Param('id') id: string,
    @Req() request: FastifyRequest & { user: JwtPayload },
  ): Promise<void> {
    await this.appointmentsService.softDelete(id, request.user.sub);
  }
}
