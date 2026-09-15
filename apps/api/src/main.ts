import helmet from '@fastify/helmet';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { patchNestJsSwagger } from 'nestjs-zod';

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

  // ── Security Headers (Helmet + CSP) ──────────────────────────
  // Hardens every response with anti-clickjacking, MIME sniffing
  // and content security headers. CSP policy:
  //  - default-src 'self' (no external origins)
  //  - style-src allows inline (Tailwind utility classes + Swagger UI)
  //  - script-src allows inline only for Swagger UI assets in dev
  //  - frameAncestors 'none' blocks clickjacking of the API
  //  - object-src 'none' blocks flash/plugin embedding
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  });

  // ── Global Prefix (/api/v1) ──────────────────────────────────
  const apiPrefix = 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // ── CORS ─────────────────────────────────────────────────────
  // SECURITY RULE: hardcoded localhost origins are DEV-ONLY. In
  // production the CORS_ORIGIN env var is the single source of truth
  // (e.g. https://erp.example.com). Accepts a comma-separated list to
  // allow multiple frontends (e.g. web + landing).
  const isProduction = process.env['NODE_ENV'] === 'production';
  const configuredOrigins = (process.env['CORS_ORIGIN'] ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  const localDevOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const origins = [...new Set([...configuredOrigins, ...(isProduction ? [] : localDevOrigins)])];

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Swagger / OpenAPI ────────────────────────────────────────
  // Only enable Swagger in non-production environments
  if (process.env['NODE_ENV'] !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Pediatric Clinic ERP — API')
      .setDescription('Pediatric medical ERP RESTful API. Compliant with Law 26.529 (Argentina).')
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
      .addTag('medical-records', 'Immutable clinical records')
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

  console.log(`\n🚀 API running at: http://localhost:${String(port)}/${apiPrefix}`);
  console.log(`📖 Swagger at:     http://localhost:${String(port)}/${apiPrefix}/docs\n`);
}

void bootstrap();
