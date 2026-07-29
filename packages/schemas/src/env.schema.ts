import { z } from 'zod';

/**
 * Validation schema for apps/api environment variables.
 *
 * RULE: This schema is the SINGLE source of truth for env vars.
 * Any new environment variable must be added here first.
 * Used in NestJS with @nestjs/config: validate option.
 */
export const envSchema = z.object({
  // --- Environment ---
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // --- Server ---
  PORT: z.coerce.number().int().positive().default(3001),
  API_PREFIX: z.string().default('api'),

  // --- Database ---
  DATABASE_URL: z
    .string()
    .url()
    .describe(
      'PostgreSQL connection string. Format: postgresql://user:password@host:port/dbname',
    ),

  // --- Authentication / JWT ---
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long for security')
    .describe('Secret for signing JWT tokens'),
  JWT_EXPIRES_IN: z.string().default('7d').describe('JWT expiration duration. E.g.: 7d, 1h'),

  // --- CORS ---
  CORS_ORIGIN: z
    .string()
    .url()
    .default('http://localhost:3000')
    .describe('Allowed origin for CORS (frontend URL)'),

  // --- Rate Limiting ---
  THROTTLE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce
    .number()
    .int()
    .positive()
    .default(30)
    .describe('Maximum requests per THROTTLE_TTL_SECONDS'),

  // --- Logging ---
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

/**
 * Inferred type from the environment variables schema.
 * Use z.infer — DO NOT duplicate as an interface.
 */
export type Env = z.infer<typeof envSchema>;

