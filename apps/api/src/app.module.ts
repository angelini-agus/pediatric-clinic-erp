import { APP_PIPE, APP_FILTER } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { validateEnv } from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    // ── Config (Zod-validated) ───────────────────────────────────
    // validate() usa el schema Zod de @pediatric-erp/schemas
    // Esto garantiza que la app NO arranca con variables de entorno incorrectas
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      cache: true,
    }),

    // ── Rate Limiting ────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: Number(process.env['THROTTLE_TTL_SECONDS'] ?? 60) * 1000,
            limit: Number(process.env['THROTTLE_LIMIT'] ?? 30),
          },
        ],
      }),
    }),

    // ── Logging (Pino) ───────────────────────────────────────
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['LOG_LEVEL'] ?? 'info',
        ...(process.env['NODE_ENV'] === 'development' && {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: false,
              translateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss.l'Z'",
              ignore: 'pid,hostname',
            },
          },
        }),
        redact: {
          paths: ['req.headers.authorization', '*.password', '*.token'],
          remove: true,
        },
      },
    }),


    // ── Feature Modules ──────────────────────────────────────────
    PrismaModule,
    HealthModule,
    PatientsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ── Zod Validation Pipe (nestjs-zod) ─────────────────────────
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    // ── Exception Filter Global (DI-aware) ───────────────────────
    // Registrado como APP_FILTER para que NestJS inyecte PinoLogger
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
