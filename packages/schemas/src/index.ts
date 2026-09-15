/**
 * @pediatric-erp/schemas
 *
 * Single entry point for all Zod schemas in the monorepo.
 *
 * FUNDAMENTAL RULE: Zod is the SINGLE source of truth for validation.
 * - For types: use z.infer<typeof schema>
 * - For Prisma types: use Prisma.<Model>GetPayload<{...}> or Awaited<ReturnType<typeof fn>>
 * - FORBIDDEN: class-validator, class-transformer, duplicate interfaces
 */

// Environment variables
export { envSchema } from './env.schema.js';
export type { Env } from './env.schema.js';

// Patient
export {
  BIOLOGICAL_SEXES,
  biologicalSexSchema,
  type BiologicalSex,
  BLOOD_GROUPS,
  bloodGroupSchema,
  type BloodGroup,
  DOCUMENT_TYPES,
  documentTypeSchema,
  type DocumentType,
  GUARDIAN_RELATIONSHIPS,
  guardianRelationshipSchema,
  type GuardianRelationship,
  patientCreateSchema,
  type PatientCreate,
  patientUpdateSchema,
  type PatientUpdate,
} from './patient.schema.js';

// Appointment
export {
  APPOINTMENT_STATUSES,
  appointmentStatusSchema,
  type AppointmentStatus,
  appointmentCreateSchema,
  type AppointmentCreate,
  appointmentUpdateStatusSchema,
  type AppointmentUpdateStatus,
  appointmentUpdateSchema,
  type AppointmentUpdate,
} from './appointment.schema.js';

// Medical Record
export { medicalRecordCreateSchema, type MedicalRecordCreate } from './medical-record.schema.js';

// Prescription
export { prescriptionCreateSchema, type PrescriptionCreate } from './prescription.schema.js';

// ClinicSettings
export {
  clinicSettingsUpdateSchema,
  type ClinicSettingsUpdate,
  clinicSettingsResponseSchema,
  type ClinicSettingsResponse,
} from './settings.schema.js';

// Auth (JWT)
export {
  AUTH_ROLES,
  authRoleSchema,
  type AuthRole,
  loginSchema,
  type Login,
  registerSchema,
  type Register,
  STAFF_ROLES,
  staffCreateSchema,
  type StaffCreate,
  changePasswordSchema,
  type ChangePassword,
  authUserSchema,
  type AuthUser,
  loginResponseSchema,
  type LoginResponse,
} from './auth.schema.js';
