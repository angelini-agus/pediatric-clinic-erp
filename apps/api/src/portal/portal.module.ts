import { Module } from '@nestjs/common';

import { AppointmentsModule } from '../appointments/appointments.module.js';

import { PortalController } from './portal.controller.js';
import { PortalService } from './portal.service.js';

/**
 * PortalModule — patient-facing portal (role PATIENT).
 *
 * Imports AppointmentsModule to reuse the appointment creation flow
 * (slot validation + audit) for portal requests.
 */
@Module({
  imports: [AppointmentsModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
