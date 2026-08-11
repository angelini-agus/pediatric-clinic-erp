import { z } from 'zod';

/**
 * User roles (mirror of Prisma UserRole enum).
 * Single source of truth for auth payloads.
 */
export const AUTH_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'DOCTOR',
  'SECRETARY',
  'PATIENT',
] as const;
export const authRoleSchema = z.enum(AUTH_ROLES);
export type AuthRole = z.infer<typeof authRoleSchema>;

/**
 * POST /api/v1/auth/login request body.
 */
export const loginSchema = z.object({
  email: z.string().email().max(200).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required').max(200),
});
export type Login = z.infer<typeof loginSchema>;

/**
 * Authenticated user returned to the client (never includes the password).
 */
export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  role: authRoleSchema,
});
export type AuthUser = z.infer<typeof authUserSchema>;

/**
 * POST /api/v1/auth/login success response.
 */
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;