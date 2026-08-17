import {
  appointmentStatusSchema,
  medicalRecordCreateSchema,
  prescriptionCreateSchema,
  clinicSettingsResponseSchema,
  loginResponseSchema,
  type ClinicSettingsResponse,
  type LoginResponse,
  type patientCreateSchema,
} from '@pediatric-erp/schemas';
import { z } from 'zod';

// ── Response shape schemas ────────────────────────────────────────────────────
// DRY: built with Zod, no manual interfaces.

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const patientResponseSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.coerce.date(),
  biologicalSex: z.string(),
  documentType: z.string(),
  documentNumber: z.string(),
  bloodGroup: z.string().nullish(),
  healthInsurance: z.string().nullish(),
  healthInsurancePlan: z.string().nullish(),
  healthInsuranceNumber: z.string().nullish(),
  guardianFullName: z.string(),
  guardianPhone: z.string(),
  guardianEmail: z.string().nullish(),
  guardianRelationship: z.string(),
  birthWeightGrams: z.number().nullish(),
  gestationalWeeks: z.number().nullish(),
  apgarScore: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullish(),
});

export type PatientResponse = z.infer<typeof patientResponseSchema>;

export const doctorOptionSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  specialty: z.string().nullish(),
  medicalLicense: z.string().nullish(),
});
export type DoctorOption = z.infer<typeof doctorOptionSchema>;

const doctorResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  specialty: z.string().nullish(),
  medicalLicense: z.string().nullish(),
});

/**
 * Patient projection nested inside an Appointment.
 *
 * The NestJS API intentionally returns a LEAN patient payload on
 * appointment lists (id, identity + guardian basics) — NOT the full
 * `PatientResponse`. Using the full schema here makes Zod reject every
 * appointment payload (missing biologicalSex/documentNumber/createdAt…),
 * which silently empties the upcoming/today tables. This schema mirrors
 * the API's `select` exactly.
 */
const appointmentPatientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.coerce.date(),
  guardianFullName: z.string(),
  guardianRelationship: z.string(),
});

export const appointmentResponseSchema = z.object({
  id: z.string(),
  dateTime: z.coerce.date(),
  type: z.string(),
  notes: z.string().nullish(),
  status: appointmentStatusSchema,
  patientId: z.string(),
  doctorId: z.string(),
  patient: appointmentPatientSchema,
  doctor: doctorResponseSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullish(),
});

export type AppointmentResponse = z.infer<typeof appointmentResponseSchema>;

// Medical Record response includes doctor details
export const medicalRecordResponseSchema = z.object({
  id: z.string(),
  diagnosis: z.string(),
  notes: z.string(),
  treatment: z.string().nullish(),
  prescription: z.string().nullish(),
  patientId: z.string(),
  doctorId: z.string(),
  doctor: doctorResponseSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullish(),
});

export type MedicalRecordResponse = z.infer<typeof medicalRecordResponseSchema>;

const patientSummarySchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
});

export const globalMedicalRecordResponseSchema = medicalRecordResponseSchema.extend({
  patient: patientSummarySchema,
});

export type GlobalMedicalRecordResponse = z.infer<typeof globalMedicalRecordResponseSchema>;

// Analytics response schemas
export const nextAppointmentPatientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  age: z.string(),
});

export const nextAppointmentSchema = z
  .object({
    id: z.string(),
    dateTime: z.coerce.date(),
    time: z.string(),
    type: z.string(),
    patient: nextAppointmentPatientSchema,
  })
  .nullable();

export const appointmentFunnelSchema = z.object({
  total: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  waiting: z.number().int().nonnegative(),
});

export const dashboardAnalyticsSchema = z.object({
  nextAppointment: nextAppointmentSchema,
  appointmentFunnel: appointmentFunnelSchema,
  unsignedRecords: z.number().int().nonnegative(),
  canceledToday: z.number().int().nonnegative(),
});

export type DashboardAnalytics = z.infer<typeof dashboardAnalyticsSchema>;

// Re-export Zod schema for use in form validation (client components)
export { medicalRecordCreateSchema, prescriptionCreateSchema };

// ── Data Fetching ─────────────────────────────────────────────────────────────

const rawBaseUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
const baseUrl = rawBaseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

/**
 * URL absoluta del backend NestJS (ej: `http://localhost:3001/api/v1`).
 * **Solo para Server Components / Route Handlers** — el cliente usa
 * `CLIENT_API_URL` porque no puede leer la cookie httpOnly.
 */
export const API_URL = `${baseUrl}/api/v1`;

/**
 * URL del proxy interno para llamadas desde el cliente.
 * Resuelve el problema de las cookies httpOnly: el navegador NO puede leer
 * el JWT ni inyectarlo en headers, así que toda llamada autenticada desde
 * Client Components pasa por `/api/proxy/v1/...` (Route Handler en
 * `app/api/proxy/[...path]/route.ts`) que reenvía al backend real con el
 * `Authorization: Bearer <token>` correcto.
 *
 * Exportada para que los Client Components usen el mismo punto de entrada
 * que las funciones helper aquí definidas.
 */
export const CLIENT_API_URL = '/api/proxy/v1';

/**
 * Name of the browser cookie that stores the JWT access token.
 * Must match TOKEN_COOKIE_NAME in lib/auth.ts and middleware.ts.
 */
export const TOKEN_COOKIE_NAME = 'token';

/**
 * Builds fetch headers with the optional JWT Bearer token.
 * Used by server-side fetchers that receive the token from next/headers cookies.
 */
function authHeaders(accessToken?: string): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

/**
 * POST /api/v1/auth/login — DEPRECATED.
 *
 * @deprecated El flujo de autenticación ahora pasa por el BFF Route Handler
 * `POST /api/auth/login` (ver `app/api/auth/login/route.ts`) que setea la
 * cookie httpOnly server-side. Esta función queda obsoleta — los Client
 * Components deben llamar al endpoint interno en lugar de hablar directo
 * con el backend NestJS. Se conserva temporalmente para no romper imports
 * legacy; eliminarla en el siguiente PR de limpieza.
 */
export async function login(
  input: LoginInput,
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Login failed: ${String(res.status)} ${errorText}`);
  }

  const json: unknown = await res.json();
  const parsed = loginResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid response from auth API');
  }

  return parsed.data;
}

/**
 * Fetches dashboard operational analytics metrics from NestJS API.
 * Server-side safe (cache: 'no-store').
 */
export async function getDashboardAnalytics(
  accessToken?: string,
): Promise<DashboardAnalytics | null> {
  try {
    const res = await fetch(`${API_URL}/analytics/dashboard`, {
      cache: 'no-store',
      headers: authHeaders(accessToken),
    });

    if (!res.ok) {
      console.error(`[api] GET /analytics/dashboard failed: ${String(res.status)}`);
      return null;
    }

    const json: unknown = await res.json();
    const parsed = dashboardAnalyticsSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[api] Analytics response validation failed:', parsed.error.flatten());
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching analytics:', error);
    return null;
  }
}

/**
 * Fetches today's active appointments from the NestJS API.
 * Server-side only (App Router).
 */
export async function getTodaysAppointments(
  accessToken?: string,
): Promise<AppointmentResponse[]> {
  try {
    const res = await fetch(`${API_URL}/appointments/today`, {
      cache: 'no-store',
      headers: authHeaders(accessToken),
    });

    if (!res.ok) {
      console.error(`[api] GET /appointments/today failed: ${String(res.status)} ${res.statusText}`);
      return [];
    }

    const json: unknown = await res.json();
    const parsed = z.array(appointmentResponseSchema).safeParse(json);

    if (!parsed.success) {
      console.error('[api] Response validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching appointments:', error);
    return [];
  }
}

/**
 * Fetches a single patient by ID.
 * Returns null if not found or on network error.
 */
export async function getPatient(
  id: string,
  accessToken?: string,
): Promise<PatientResponse | null> {
  try {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      cache: 'no-store',
      headers: authHeaders(accessToken),
    });

    if (!res.ok) {
      console.error(`[api] GET /patients/${id} failed: ${String(res.status)}`);
      return null;
    }

    const json: unknown = await res.json();
    const parsed = patientResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[api] Patient validation failed:', parsed.error.flatten());
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching patient:', error);
    return null;
  }
}

/**
 * Paginated response returned by the backend:
 * `{ data: page items, total: total count matching the filters }`.
 */
export type PaginatedPatients = {
  data: PatientResponse[];
  total: number;
};

const paginatedPatientsSchema = z.object({
  data: z.array(patientResponseSchema),
  total: z.number().int().nonnegative(),
});

export type GetPatientsOptions = {
  /** Free-text search query (matched against name, DNI, guardian). */
  q?: string;
  /** 1-indexed page number. */
  page?: number;
  /** Page size (defaults to 20 server-side). */
  pageSize?: number;
};

/**
 * Fetches a page of active patients from the NestJS API.
 * Server-side only (App Router).
 *
 * Acepta `q` (búsqueda) y `page`/`pageSize` (paginación) como query params
 * que se concatenan al URL final. El proxy (`/api/proxy/v1/...`) los
 * reenvía tal cual al backend NestJS, que ahora filtra y pagina
 * server-side devolviendo `{ data, total }`.
 */
export async function getPatients(
  accessToken?: string,
  options: GetPatientsOptions = {},
): Promise<PaginatedPatients> {
  const params = new URLSearchParams();
  if (options.q?.trim()) {
    params.set('q', options.q.trim());
  }
  if (options.page !== undefined && options.page > 0) {
    params.set('page', String(options.page));
  }
  if (options.pageSize !== undefined && options.pageSize > 0) {
    params.set('pageSize', String(options.pageSize));
  }
  const queryString = params.toString();
  const url = `${API_URL}/patients${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: authHeaders(accessToken),
    });

    if (!res.ok) {
      console.error(`[api] GET ${url} failed: ${String(res.status)}`);
      return { data: [], total: 0 };
    }

    const json: unknown = await res.json();
    const parsed = paginatedPatientsSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[api] Patients list validation failed:', parsed.error.flatten());
      return { data: [], total: 0 };
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching patients:', error);
    return { data: [], total: 0 };
  }
}

/**
 * Creates a new pediatric patient.
 * POST /api/v1/patients
 *
 * Client-side safe: va por el proxy interno (`CLIENT_API_URL`). El navegador
 * adjunta la cookie httpOnly y el Route Handler inyecta `Authorization`.
 *
 * @throws Error si la API responde con error de validación o de red.
 */
export async function createPatient(
  data: z.infer<typeof patientCreateSchema>,
): Promise<PatientResponse> {
  const res = await fetch(`${CLIENT_API_URL}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to create patient: ${String(res.status)} ${errorText}`,
    );
  }

  const json: unknown = await res.json();
  const parsed = patientResponseSchema.safeParse(json);

  if (!parsed.success) {
    console.error('[api] Create patient validation failed:', parsed.error.flatten());
    throw new Error('Invalid response from patients API');
  }

  return parsed.data;
}

/**
 * Fetches the full clinical history for a patient.
 * Returns empty array on error.
 */
export async function getMedicalRecords(
  patientId: string,
  accessToken?: string,
): Promise<MedicalRecordResponse[]> {
  try {
    const res = await fetch(
      `${API_URL}/patients/${patientId}/records`,
      { cache: 'no-store', headers: authHeaders(accessToken) },
    );

    if (!res.ok) {
      console.error(`[api] GET /patients/${patientId}/records failed: ${String(res.status)}`);
      return [];
    }

    const json: unknown = await res.json();
    const parsed = z.array(medicalRecordResponseSchema).safeParse(json);

    if (!parsed.success) {
      console.error('[api] Medical records validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching medical records:', error);
    return [];
  }
}

/**
 * Fetches all clinical histories globally across all patients.
 * GET /api/v1/medical-records
 * Returns empty array on error.
 */
export async function getAllMedicalRecords(
  accessToken?: string,
): Promise<GlobalMedicalRecordResponse[]> {
  try {
    const res = await fetch(`${API_URL}/medical-records`, {
      cache: 'no-store',
      headers: authHeaders(accessToken),
    });

    if (!res.ok) {
      console.error(`[api] GET /medical-records failed: ${String(res.status)}`);
      return [];
    }

    const json: unknown = await res.json();
    const parsed = z.array(globalMedicalRecordResponseSchema).safeParse(json);

    if (!parsed.success) {
      console.error('[api] Global medical records validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching global medical records:', error);
    return [];
  }
}

/**
 * Appends a new immutable clinical evolution entry for a patient.
 * POST /api/v1/patients/:patientId/records
 *
 * Client-side safe: usa el proxy interno (`CLIENT_API_URL`) — el navegador
 * envía la cookie httpOnly automáticamente (same-origin) y el proxy la
 * convierte en `Authorization: Bearer <token>` para el backend.
 */
export async function createMedicalRecord(
  patientId: string,
  data: {
    diagnosis: string;
    notes: string;
    treatment?: string;
    prescription?: string;
    doctorId?: string;
  },
): Promise<MedicalRecordResponse> {
  const res = await fetch(`${CLIENT_API_URL}/patients/${patientId}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create medical record: ${String(res.status)} ${errorText}`);
  }

  const json: unknown = await res.json();
  const parsed = medicalRecordResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid response from medical records API');
  }

  return parsed.data;
}

/**
 * Fetches all upcoming appointments (dateTime >= now) from the NestJS API.
 * Server-side only (App Router).
 */
export async function getUpcomingAppointments(
  accessToken?: string,
): Promise<AppointmentResponse[]> {
  try {
    const res = await fetch(`${API_URL}/appointments/upcoming`, {
      cache: 'no-store',
      headers: authHeaders(accessToken),
    });

    if (!res.ok) {
      console.error(`[api] GET /appointments/upcoming failed: ${String(res.status)} ${res.statusText}`);
      return [];
    }

    const json: unknown = await res.json();
    const parsed = z.array(appointmentResponseSchema).safeParse(json);

    if (!parsed.success) {
      console.error('[api] Upcoming appointments validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching upcoming appointments:', error);
    return [];
  }
}

/**
 * Fetches all active doctors from the NestJS API.
 * Used by NewAppointmentForm to populate the doctor select.
 *
 * Client-side safe: va por el proxy interno (`CLIENT_API_URL`) — el navegador
 * no puede leer la cookie httpOnly, así que dejamos que el Route Handler
 * la inyecte como `Authorization: Bearer <token>`.
 */
export async function getDoctors(): Promise<DoctorOption[]> {
  try {
    const res = await fetch(`${CLIENT_API_URL}/doctors`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[api] GET /doctors failed: ${String(res.status)}`);
      return [];
    }

    const json: unknown = await res.json();
    const parsed = z.array(doctorOptionSchema).safeParse(json);

    if (!parsed.success) {
      console.error('[api] Doctors validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching doctors:', error);
    return [];
  }
}

// Re-export for use in client components
export { clinicSettingsResponseSchema };
export type { ClinicSettingsResponse };

/**
 * Fetches the current clinic settings singleton from the NestJS API.
 * Returns null if not yet configured or on error.
 * Server-side safe (cache: 'no-store').
 */
export async function getClinicSettings(
  accessToken?: string,
): Promise<ClinicSettingsResponse | null> {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      cache: 'no-store',
      headers: authHeaders(accessToken),
    });

    if (!res.ok) {
      return null;
    }

    const json: unknown = await res.json();
    if (json === null) return null;

    const parsed = clinicSettingsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[api] ClinicSettings validation failed:', parsed.error.flatten());
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching clinic settings:', error);
    return null;
  }
}

/**
 * Patches (upserts) clinic settings. Called from Client Component via browser fetch.
 * Returns the updated settings or throws on error.
 *
 * Client-side safe: va por el proxy interno (`CLIENT_API_URL`).
 */
export async function updateClinicSettings(
  data: {
    fullName?: string | undefined;
    licenseNumber?: string | undefined;
    specialty?: string | undefined;
    clinicName?: string | undefined;
  },
): Promise<ClinicSettingsResponse> {
  const res = await fetch(`${CLIENT_API_URL}/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update settings: ${String(res.status)} ${errorText}`);
  }

  const json: unknown = await res.json();
  const parsed = clinicSettingsResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid response from settings API');
  }

  return parsed.data;
}
