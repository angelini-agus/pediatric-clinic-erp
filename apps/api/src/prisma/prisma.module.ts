import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service.js';

/**
 * PrismaModule — módulo global que provee PrismaService a toda la app.
 *
 * Al ser @Global(), los demás módulos pueden inyectar PrismaService
 * sin necesidad de importar PrismaModule en cada uno.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
