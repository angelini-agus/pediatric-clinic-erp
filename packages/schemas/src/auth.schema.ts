import { z } from 'zod';

/**
 * User roles (mirror of Prisma UserRole enum).
 * Single source of truth for auth payloads.
 */
export const AUTH_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'SECRETARY', 'PATIENT'] as const;
export const authRoleSchema = z.enum(AUTH_ROLES);
export type AuthRole = z.infer<typeof authRoleSchema>;

/**
 * POST /api/v1/auth/login request body.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .max(200)
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required').max(200),
});
export type Login = z.infer<typeof loginSchema>;

/**
 * POST /api/v1/auth/register request body — patient self-registration.
 *
 * Reglas:
 *  - `email`: normalizado (trim + lowercase) antes de persistir.
 *  - `password`: mínimo 8 caracteres para evitar contraseñas triviales.
 *    El backend se encarga de hashear con bcrypt antes de guardar.
 *  - `confirmPassword`: debe coincidir con `password` — se valida con
 *    `.refine()` para mantener el feedback de error en español.
 *
 * SECURITY: este schema NO acepta `role`. El registro público siempre
 * crea pacientes (role = PATIENT). El alta de staff pasa por
 * `staffCreateSchema` + endpoint admin-only.
 */
const registerFieldsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'El nombre completo es obligatorio')
    .max(200, 'El nombre no puede superar los 200 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .max(200)
    .transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(200, 'La contraseña no puede superar los 200 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
});

export const registerSchema = registerFieldsSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  },
);
export type Register = z.infer<typeof registerSchema>;

/**
 * Staff roles an admin can assign when creating a professional account.
 *
 * Excluded on purpose:
 *  - PATIENT: se auto-registra vía el registro público.
 *  - SUPER_ADMIN: solo se provisiona out-of-band (seed/DB).
 */
export const STAFF_ROLES = ['ADMIN', 'DOCTOR', 'SECRETARY'] as const;

/**
 * POST /api/v1/auth/staff request body — admin-only staff creation.
 *
 * Same fields as patient registration plus the role to assign. The role
 * is validated against STAFF_ROLES so PATIENT/SUPER_ADMIN can never be
 * created through this endpoint.
 */
export const staffCreateSchema = registerFieldsSchema.extend({
  role: z.enum(STAFF_ROLES, {
    errorMap: () => ({ message: 'Rol inválido. Valores permitidos: ADMIN, DOCTOR, SECRETARY' }),
  }),
});
export type StaffCreate = z.infer<typeof staffCreateSchema>;

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
