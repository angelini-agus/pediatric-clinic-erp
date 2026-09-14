import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';

import { AnalyticsModule } from './analytics/analytics.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { AuditModule } from './audit/audit.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { validateEnv } from './config/env.validation.js';
import { DoctorsModule } from './doctors/doctors.module.js';
import { HealthModule } from './health/health.module.js';
import { MedicalRecordsModule } from './medical-records/medical-records.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { PrescriptionsModule } from './prescriptions/prescriptions.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SettingsModule } from './settings/settings.module.js';

@Module({
  imports: [
    // ── Config (Zod-validated) ───────────────────────────────────
    // validate() uses Zod schema from @pediatric-erp/schemas
    // Ensures application will NOT start with invalid env vars
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
    AuditModule,
    AuthModule,
    HealthModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    PrescriptionsModule,
    DoctorsModule,
    AnalyticsModule,
    SettingsModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    // ── Zod Validation Pipe (nestjs-zod) ─────────────────────────
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    // ── Global Exception Filter (DI-aware) ───────────────────────
    // Registered as APP_FILTER so NestJS injects PinoLogger
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // ── Global Guards (security by default) ────────────────────
    // NestJS executes APP_GUARD providers in the order they are
    // registered. Order matters — each subsequent guard assumes the
    // previous one has already run:
    //
    //   1. ThrottlerGuard  → rejects requests before any work
    //      (rate limit; cheap O(1) check on every endpoint).
    //   2. JwtAuthGuard    → populates `req.user` from the Bearer
    //      token; endpoints marked @Public() bypass this.
    //   3. RolesGuard      → enforces `@Roles(...)` metadata on top
    //      of the authenticated user (requires JwtAuthGuard to have
    //      already populated `req.user`).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
