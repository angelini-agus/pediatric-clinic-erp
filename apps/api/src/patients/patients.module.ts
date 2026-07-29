import { Module } from '@nestjs/common';

import { PatientsController } from './patients.controller.js';
import { PatientsService } from './patients.service.js';

/**
 * PatientsModule — módulo de dominio para la gestión de pacientes.
 *
 * PrismaService se inyecta automáticamente desde PrismaModule (@Global).
 */
@Module({
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
