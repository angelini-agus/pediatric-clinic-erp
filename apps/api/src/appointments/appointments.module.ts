import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';

import { AppointmentsController } from './appointments.controller.js';
import { AppointmentsService } from './appointments.service.js';

/**
 * AppointmentsModule — domain module for appointment management.
 *
 * PrismaService is automatically injected from PrismaModule (@Global).
 */
@Module({
  imports: [AuditModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
