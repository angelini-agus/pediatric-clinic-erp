import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service.js';

/**
 * PrismaModule — Global module providing PrismaService to the application.
 *
 * Decorated as @Global(), allowing other modules to inject PrismaService
 * without importing PrismaModule in each module.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
