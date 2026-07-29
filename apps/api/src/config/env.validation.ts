import { envSchema } from '@pediatric-erp/schemas';
import type { Env } from '@pediatric-erp/schemas';

/**
 * Environment variable validation function for @nestjs/config.
 *
 * Used in ConfigModule.forRoot({ validate: validateEnv }).
 * If any variable fails Zod validation, the app throws an error
 * on startup and does NOT continue.
 *
 * RULE: This file must NOT contain business logic.
 * Only validates and parses environment variables using the schema
 * centralized in @pediatric-erp/schemas.
 *
 * @param config - Raw environment variables (process.env)
 * @returns Parsed and typed environment variables
 * @throws Error if any variable fails validation
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.errors
      .map((err) => `  → ${err.path.join('.')}: ${err.message}`)
      .join('\n');

    throw new Error(
      `\n❌ Invalid environment variables:\n${formatted}\n\n` +
        `Please check .env.example file for all required variables.\n`,
    );
  }

  return result.data;
}

