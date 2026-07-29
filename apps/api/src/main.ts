import { VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { patchNestJsSwagger } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module.js';

/**
 * Applies nestjs-zod patch to Swagger prior to creating the application.
 * Allows DTOs created with createZodDto() to generate OpenAPI schemas properly.
 */
patchNestJsSwagger();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  // ── Logger (nestjs-pino) ─────────────────────────────────────
  app.useLogger(app.get(Logger));

  // ── Global Prefix & URI Versioning (/api/v1) ─────────────────
  const apiPrefix = 'api';
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ── CORS ─────────────────────────────────────────────────────
  // Origin configured from environment variables via ConfigService
  const corsOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Swagger / OpenAPI ────────────────────────────────────────
  // Only enable Swagger in non-production environments
  if (process.env['NODE_ENV'] !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Pediatric Clinic ERP — API')
      .setDescription(
        'Pediatric medical ERP RESTful API. Compliant with Law 26.529 (Argentina).',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter your JWT token',
          in: 'header',
        },
        'access-token',
      )
      .addTag('health', 'System health status')
      .addTag('auth', 'Authentication and authorization')
      .addTag('patients', 'Pediatric patient management')
      .addTag('appointments', 'Medical appointment management')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // ── Port ─────────────────────────────────────────────────────
  const port = process.env['PORT'] ?? 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`\n🚀 API running at: http://localhost:${port}/api`);
  console.log(`📖 Swagger at:     http://localhost:${port}/api/docs\n`);
}

void bootstrap();

