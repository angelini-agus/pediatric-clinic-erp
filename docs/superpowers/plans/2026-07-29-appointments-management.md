# Appointments Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Agenda page at `/appointments` with a glassmorphism table of upcoming appointments and a "+ Nuevo Turno" modal with patient-select combobox, datetime picker, and doctor select.

**Architecture:** 4 tasks, all sequential (each task depends on the previous):

1. **API: `GET /api/v1/appointments/upcoming`** — new NestJS endpoint + `lib/api.ts` fetcher
2. **API: `GET /api/v1/doctors`** — new NestJS endpoint to list users with role DOCTOR for the form's doctor dropdown
3. **Web: `AppointmentsPage`** — Server Component with glassmorphism table reusing existing `Badge`, `Table`, and `AppointmentStatusSelector`
4. **Web: `NewAppointmentDialog` + `NewAppointmentForm`** — Client Component modal with patient select (fetched client-side), datetime-local, type input, doctor select, inline toast, `router.refresh()`

**Tech Stack:** NestJS (API), Next.js 14 App Router (web), React Hook Form 7, @hookform/resolvers, Zod 3, Tailwind CSS 3 with custom design tokens, Lucide React — all already installed.

## Global Constraints

- All UI copy in **Spanish**; all identifiers/code/API routes in **English**
- Glassmorphism style: `bg-white/75 backdrop-blur-xl` — match `TodaysBookingCard` exactly
- Reuse existing `Badge`, `Table*`, `AppointmentStatusSelector` components — do NOT duplicate them
- API base URL: `process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1'` — match `lib/api.ts` pattern
- `doctorId` is **required** by `appointmentCreateSchema` — the form must include a doctor select populated from `GET /api/v1/doctors`
- POST body must include: `dateTime` (ISO string), `type`, `patientId`, `doctorId`, `status: 'SCHEDULED'`
- No shadcn/ui — build all UI with Tailwind + React state, matching `new-medical-record-form.tsx` / `new-patient-dialog.tsx` patterns
- TypeScript strict — no `any`, no unused imports
- NestJS: NEVER use hard `delete` — but this plan only adds `GET` endpoints so the soft-delete rule is not triggered
- Each task ends with a `git commit`

---

## File Structure

```
apps/api/src/appointments/
  appointments.controller.ts    [MODIFY] Add findUpcoming GET handler
  appointments.service.ts       [MODIFY] Add findUpcoming() method

apps/api/src/
  doctors/
    doctors.module.ts           [NEW] NestJS module for doctor listing
    doctors.controller.ts       [NEW] GET /api/v1/doctors endpoint
    doctors.service.ts          [NEW] PrismaService query for DOCTOR-role users
  app.module.ts                 [MODIFY] Register DoctorsModule

apps/web/lib/
  api.ts                        [MODIFY] Add getUpcomingAppointments() + getDoctors() fetchers

apps/web/app/(dashboard)/appointments/
  page.tsx                      [NEW] Server Component — AgendaPage

apps/web/components/appointments/
  new-appointment-form.tsx      [NEW] Client Component — form body
  new-appointment-dialog.tsx    [NEW] Client Component — modal wrapper
```

---

## Task 1: API — `GET /api/v1/appointments/upcoming` endpoint

**Files:**

- Modify: `apps/api/src/appointments/appointments.service.ts`
- Modify: `apps/api/src/appointments/appointments.controller.ts`
- Modify: `apps/web/lib/api.ts`

**Interfaces:**

- Produces:
  - `AppointmentsService.findUpcoming(): Promise<AppointmentWithDetails[]>` — returns appointments with `dateTime >= now`, ordered ASC, `deletedAt: null`, includes patient + doctor
  - `GET /api/v1/appointments/upcoming` → `200 AppointmentWithDetails[]`
  - `getUpcomingAppointments(): Promise<AppointmentResponse[]>` in `lib/api.ts`

- [ ] **Step 1: Add `findUpcoming()` to the service**

In `apps/api/src/appointments/appointments.service.ts`, add this method after `findToday()` (after line 75):

```typescript
  /**
   * Returns all upcoming active appointments (dateTime >= now),
   * including patient details and doctor metadata, ordered chronologically.
   *
   * STRICT PRISMA RULE: Filters by `dateTime >= now` AND `deletedAt: null`.
   */
  async findUpcoming(): Promise<AppointmentWithDetails[]> {
    const now = new Date();
    return this.prisma.client.appointment.findMany({
      where: {
        dateTime: { gte: now },
        deletedAt: null,
      },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            medicalLicense: true,
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    });
  }
```

- [ ] **Step 2: Add `GET /upcoming` route to the controller**

In `apps/api/src/appointments/appointments.controller.ts`, add this handler **before** the `@Post()` handler (insert after line 60, before line 62):

```typescript
  /**
   * GET /api/v1/appointments/upcoming
   * Returns all future (dateTime >= now) active appointments with patient + doctor data.
   */
  @Get('upcoming')
  @ApiOperation({
    summary: 'List upcoming appointments',
    description:
      'Returns all non-deleted appointments scheduled from now onwards, ordered by dateTime ascending.',
  })
  @ApiOkResponse({
    description: 'Upcoming appointments with patient and doctor details.',
  })
  findUpcoming(): Promise<AppointmentWithDetails[]> {
    return this.appointmentsService.findUpcoming();
  }
```

> **IMPORTANT:** The `@Get('upcoming')` route MUST be declared before `@Post()`. In NestJS, route specificity is determined by declaration order for same-path patterns. Since `upcoming` is a sub-path of the collection and the controller already has `@Get('today')` first, placing `findUpcoming()` after `findToday()` and before `create()` keeps the correct order.

- [ ] **Step 3: Add `getUpcomingAppointments()` to `apps/web/lib/api.ts`**

Add this function at the end of the file (after `getMedicalRecords`):

```typescript
/**
 * Fetches all upcoming appointments (dateTime >= now) from the NestJS API.
 * Server-side only (App Router).
 */
export async function getUpcomingAppointments(): Promise<AppointmentResponse[]> {
  try {
    const res = await fetch(`${API_URL}/appointments/upcoming`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[api] GET /appointments/upcoming failed: ${res.status} ${res.statusText}`);
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
```

- [ ] **Step 4: Verify the API TypeScript build**

```bash
cd apps/api && npx tsc --noEmit 2>&1 | head -40
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/appointments/appointments.service.ts apps/api/src/appointments/appointments.controller.ts apps/web/lib/api.ts
git commit -m "feat(api,web): add GET /appointments/upcoming endpoint and getUpcomingAppointments() fetcher"
```

---

## Task 2: API — `GET /api/v1/doctors` endpoint + `getDoctors()` fetcher

**Files:**

- Create: `apps/api/src/doctors/doctors.module.ts`
- Create: `apps/api/src/doctors/doctors.controller.ts`
- Create: `apps/api/src/doctors/doctors.service.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/web/lib/api.ts`

**Interfaces:**

- Produces:
  - `DoctorsService.findAll(): Promise<{ id: string; fullName: string; specialty: string | null; medicalLicense: string | null }[]>`
  - `GET /api/v1/doctors` → `200` array of doctor objects (subset of User fields)
  - `getDoctors(): Promise<DoctorOption[]>` in `lib/api.ts` where `DoctorOption = { id: string; fullName: string; specialty: string | null }`
  - `export type DoctorOption` from `lib/api.ts`

- [ ] **Step 1: Create `apps/api/src/doctors/doctors.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/** Minimal doctor shape for client-side selects. */
export type DoctorListItem = {
  id: string;
  fullName: string;
  specialty: string | null;
  medicalLicense: string | null;
};

/**
 * DoctorsService — read-only queries for user/doctor lookup.
 * Only returns users with role DOCTOR and deletedAt: null.
 */
@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all active doctors (role = DOCTOR, deletedAt = null).
   * Ordered by fullName ascending for predictable UI ordering.
   */
  async findAll(): Promise<DoctorListItem[]> {
    return this.prisma.client.user.findMany({
      where: { role: 'DOCTOR', deletedAt: null },
      select: {
        id: true,
        fullName: true,
        specialty: true,
        medicalLicense: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }
}
```

- [ ] **Step 2: Create `apps/api/src/doctors/doctors.controller.ts`**

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DoctorsService, type DoctorListItem } from './doctors.service.js';

/**
 * DoctorsController — read-only endpoints for doctor/user lookup.
 *
 * Base path: /api/v1/doctors
 *
 * Endpoints:
 *  GET /api/v1/doctors - List all active doctors (200)
 */
@ApiTags('doctors')
@Controller({ path: 'doctors', version: '1' })
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  /**
   * GET /api/v1/doctors
   * Lists all active users with role DOCTOR.
   */
  @Get()
  @ApiOperation({
    summary: 'List active doctors',
    description:
      'Returns all active (deletedAt: null) users with role DOCTOR, ordered by fullName.',
  })
  @ApiOkResponse({ description: 'List of active doctors.' })
  findAll(): Promise<DoctorListItem[]> {
    return this.doctorsService.findAll();
  }
}
```

- [ ] **Step 3: Create `apps/api/src/doctors/doctors.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { DoctorsController } from './doctors.controller.js';
import { DoctorsService } from './doctors.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule {}
```

- [ ] **Step 4: Register `DoctorsModule` in `apps/api/src/app.module.ts`**

Find the existing `imports` array in `AppModule` and add `DoctorsModule`. Read the current `app.module.ts` first to identify the exact insertion point, then add:

```typescript
import { DoctorsModule } from './doctors/doctors.module.js';
```

And add `DoctorsModule` to the `imports` array alongside the existing modules.

- [ ] **Step 5: Add `DoctorOption` type + `getDoctors()` to `apps/web/lib/api.ts`**

Add after the `patientResponseSchema` block (around line 35), the new schema and type:

```typescript
export const doctorOptionSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  specialty: z.string().nullish(),
  medicalLicense: z.string().nullish(),
});
export type DoctorOption = z.infer<typeof doctorOptionSchema>;
```

Then add the fetcher function at the end of the file:

```typescript
/**
 * Fetches all active doctors from the NestJS API.
 * Used by NewAppointmentForm to populate the doctor select.
 * Client-side safe (called from useEffect).
 */
export async function getDoctors(): Promise<DoctorOption[]> {
  try {
    const res = await fetch(`${API_URL}/doctors`, { cache: 'no-store' });

    if (!res.ok) {
      console.error(`[api] GET /doctors failed: ${res.status}`);
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
```

> **Note:** `API_URL` is already defined as a module-level const in `lib/api.ts` — do not redefine it.

- [ ] **Step 6: Verify both TypeScript builds**

```bash
cd apps/api && npx tsc --noEmit 2>&1 | head -40
cd apps/web && npx tsc --noEmit 2>&1 | head -40
```

Expected: no output from either.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/doctors/ apps/api/src/app.module.ts apps/web/lib/api.ts
git commit -m "feat(api,web): add GET /doctors endpoint with DoctorsModule and getDoctors() fetcher"
```

---

## Task 3: Web — `AgendaPage` Server Component

**Files:**

- Create: `apps/web/app/(dashboard)/appointments/page.tsx`

**Interfaces:**

- Consumes:
  - `getUpcomingAppointments()` from `@/lib/api` (Task 1)
  - `AppointmentStatusSelector` from `@/components/dashboard/appointment-status-selector`
  - `Badge`, `badgeVariants` from `@/components/ui/badge`
  - `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`
  - `NewAppointmentDialog` from `@/components/appointments/new-appointment-dialog` (Task 4 — created before wiring)
- Produces: `export default async function AgendaPage()` — Server Component at route `/appointments`

- [ ] **Step 1: Create `apps/web/app/(dashboard)/appointments/page.tsx`**

```tsx
import Link from 'next/link';
import { CalendarDays, Clock, CalendarOff, CalendarPlus } from 'lucide-react';
import { getUpcomingAppointments, type AppointmentResponse } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/components/ui/badge';
import { AppointmentStatusSelector } from '@/components/dashboard/appointment-status-selector';
import { NewAppointmentDialog } from '@/components/appointments/new-appointment-dialog';

// ── Disable caching for live data ─────────────────────────────────────────────
export const dynamic = 'force-dynamic';

// ── Helpers ───────────────────────────────────────────────────────────────────

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

const STATUS_TO_VARIANT: Record<AppointmentResponse['status'], BadgeVariant> = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

const STATUS_LABEL: Record<AppointmentResponse['status'], string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En Curso',
  COMPLETED: 'Completado',
  CANCELED: 'Cancelado',
};

function formatDateTime(date: Date): { date: string; time: string } {
  return {
    date: date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }),
    time: date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

function formatAge(dateOfBirth: Date): string {
  const now = new Date();
  const months =
    (now.getFullYear() - dateOfBirth.getFullYear()) * 12 +
    (now.getMonth() - dateOfBirth.getMonth());
  if (months < 24) return `${months} m`;
  return `${Math.floor(months / 12)} años`;
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
      <CalendarOff className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
      <p className="text-sm font-medium text-slate-500">No hay turnos próximos</p>
      <p className="text-xs text-slate-400">Los turnos agendados desde hoy aparecerán aquí.</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

/**
 * AgendaPage — Server Component.
 * Route: /appointments
 *
 * Fetches and displays all upcoming appointments (dateTime >= now)
 * in a glassmorphism table with status badges and inline status selector.
 */
export default async function AgendaPage() {
  const appointments = await getUpcomingAppointments();

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="h-5 w-5 text-brand" />
            Agenda de Turnos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Turnos próximos agendados en la clínica</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>
              {appointments.length} {appointments.length === 1 ? 'Turno' : 'Turnos'}
            </span>
          </div>
          <NewAppointmentDialog />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="relative overflow-hidden bg-white/75 backdrop-blur-xl rounded-2xl shadow-sm p-5">
        {/* Decorative blobs */}
        <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-indigo-400/25 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-violet-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {appointments.length === 0 ? (
            <EmptyState />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="w-[90px] text-slate-400">Hora</TableHead>
                  <TableHead className="text-slate-400">Paciente</TableHead>
                  <TableHead className="text-slate-400">Tutor Responsable</TableHead>
                  <TableHead className="text-slate-400">Motivo / Tipo</TableHead>
                  <TableHead className="text-slate-400">Médico</TableHead>
                  <TableHead className="text-right text-slate-400">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => {
                  const { date, time } = formatDateTime(appt.dateTime);
                  const age = formatAge(appt.patient.dateOfBirth);
                  return (
                    <TableRow
                      key={appt.id}
                      className="border-slate-50 hover:bg-slate-50/80 transition-colors"
                    >
                      <TableCell className="text-slate-600 text-xs font-medium capitalize">
                        {date}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">{time}</TableCell>
                      <TableCell>
                        <Link href={`/patients/${appt.patient.id}`} className="group block">
                          <div className="font-medium text-slate-900 group-hover:underline group-hover:text-brand transition-colors cursor-pointer">
                            {appt.patient.firstName} {appt.patient.lastName}
                          </div>
                          <div className="text-xs text-slate-400">{age}</div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {appt.patient.guardianFullName}
                      </TableCell>
                      <TableCell className="text-slate-700 text-xs font-medium">
                        {appt.type}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        Dr. {appt.doctor.fullName}
                      </TableCell>
                      <TableCell className="text-right">
                        <AppointmentStatusSelector
                          appointmentId={appt.id}
                          currentStatus={appt.status}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript (ignore missing `new-appointment-dialog` — it's created in Task 4)**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep -v "new-appointment-dialog" | head -40
```

Expected: no output except possibly the missing import from Task 4 (which will be fixed then).

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(dashboard)/appointments/page.tsx"
git commit -m "feat(web): add AgendaPage Server Component with glassmorphism table and upcoming appointments"
```

---

## Task 4: Web — `NewAppointmentForm` + `NewAppointmentDialog` Client Components

**Files:**

- Create: `apps/web/components/appointments/new-appointment-form.tsx`
- Create: `apps/web/components/appointments/new-appointment-dialog.tsx`

**Interfaces:**

- Consumes:
  - `getDoctors`, `type DoctorOption` from `@/lib/api` (Task 2)
  - `getPatients`, `type PatientResponse` from `@/lib/api` (already exists)
- Produces:
  - `export function NewAppointmentForm({ onSuccess }: { onSuccess: () => void })`
  - `export function NewAppointmentDialog()` — self-contained, no props

**Form fields:**

- `patientId` — `<select>` populated via `fetch('/api/v1/patients')` in a `useEffect` on mount
- `doctorId` — `<select>` populated via `fetch('/api/v1/doctors')` in the same `useEffect`
- `dateTime` — `<input type="datetime-local">` (combines date + time, no external library needed)
- `type` — `<input type="text">` (appointment reason/type)
- `notes` — `<textarea>` (optional)

**POST payload:**

```json
{
  "patientId": "<string>",
  "doctorId": "<string>",
  "dateTime": "<ISO 8601 string>",
  "type": "<string>",
  "notes": "<string | undefined>",
  "status": "SCHEDULED"
}
```

- [ ] **Step 1: Create `apps/web/components/appointments/new-appointment-form.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PatientResponse, DoctorOption } from '@/lib/api';

// ── Form schema ───────────────────────────────────────────────────────────────

const newAppointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Seleccioná un paciente'),
  doctorId: z.string().min(1, 'Seleccioná un médico'),
  dateTime: z
    .string()
    .min(1, 'La fecha y hora son obligatorias')
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Fecha y hora inválidas' })
    .refine((v) => new Date(v) > new Date(), {
      message: 'La fecha y hora deben ser futuras',
    }),
  type: z
    .string()
    .trim()
    .min(1, 'El motivo del turno es obligatorio')
    .max(100, 'El motivo no puede superar 100 caracteres'),
  notes: z.string().trim().max(1000).optional(),
});

type NewAppointmentFormValues = z.infer<typeof newAppointmentFormSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface NewAppointmentFormProps {
  onSuccess: () => void;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

type ToastState = { type: 'success' | 'error'; message: string } | null;

// ── Component ─────────────────────────────────────────────────────────────────

export function NewAppointmentForm({ onSuccess }: NewAppointmentFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewAppointmentFormValues>({
    resolver: zodResolver(newAppointmentFormSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      dateTime: '',
      type: '',
      notes: '',
    },
  });

  const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

  // Load patients and doctors in parallel on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch(`${API_URL}/patients`),
          fetch(`${API_URL}/doctors`),
        ]);
        const [patientsJson, doctorsJson]: [unknown, unknown] = await Promise.all([
          patientsRes.json(),
          doctorsRes.json(),
        ]);
        if (!cancelled) {
          setPatients(Array.isArray(patientsJson) ? (patientsJson as PatientResponse[]) : []);
          setDoctors(Array.isArray(doctorsJson) ? (doctorsJson as DoctorOption[]) : []);
        }
      } catch {
        // Silently fail — empty selects are still usable
      } finally {
        if (!cancelled) setIsLoadingOptions(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [API_URL]);

  const onSubmit = async (data: NewAppointmentFormValues) => {
    setToast(null);
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: data.patientId,
          doctorId: data.doctorId,
          dateTime: new Date(data.dateTime).toISOString(),
          type: data.type,
          notes: data.notes || undefined,
          status: 'SCHEDULED',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err as { message?: string }).message ?? 'Error al agendar el turno.';
        setToast({ type: 'error', message: msg });
        return;
      }

      reset();
      setToast({ type: 'success', message: 'Turno agendado con éxito.' });
      router.refresh();
      setTimeout(() => {
        setToast(null);
        onSuccess();
      }, 800);
    } catch {
      setToast({ type: 'error', message: 'Error de conexión con el servidor.' });
    }
  };

  // Shared input classes
  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80',
      'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
      hasError ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
    );

  const labelClass = 'text-xs font-semibold text-slate-600 uppercase tracking-wider';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Paciente */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-patientId" className={labelClass}>
          Paciente <span className="text-rose-500">*</span>
        </label>
        <select
          id="na-patientId"
          {...register('patientId')}
          disabled={isLoadingOptions}
          className={cn(inputClass(!!errors.patientId), 'disabled:opacity-50 disabled:cursor-wait')}
        >
          <option value="">
            {isLoadingOptions ? 'Cargando pacientes...' : 'Seleccioná un paciente'}
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
        {errors.patientId && <p className="text-xs text-rose-500">{errors.patientId.message}</p>}
      </div>

      {/* Médico */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-doctorId" className={labelClass}>
          Médico <span className="text-rose-500">*</span>
        </label>
        <select
          id="na-doctorId"
          {...register('doctorId')}
          disabled={isLoadingOptions}
          className={cn(inputClass(!!errors.doctorId), 'disabled:opacity-50 disabled:cursor-wait')}
        >
          <option value="">
            {isLoadingOptions ? 'Cargando médicos...' : 'Seleccioná un médico'}
          </option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.fullName}
              {d.specialty ? ` — ${d.specialty}` : ''}
            </option>
          ))}
        </select>
        {errors.doctorId && <p className="text-xs text-rose-500">{errors.doctorId.message}</p>}
      </div>

      {/* Fecha y Hora */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-dateTime" className={labelClass}>
          Fecha y Hora <span className="text-rose-500">*</span>
        </label>
        <input
          id="na-dateTime"
          type="datetime-local"
          {...register('dateTime')}
          className={inputClass(!!errors.dateTime)}
        />
        {errors.dateTime && <p className="text-xs text-rose-500">{errors.dateTime.message}</p>}
      </div>

      {/* Motivo del Turno */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-type" className={labelClass}>
          Motivo del Turno <span className="text-rose-500">*</span>
        </label>
        <input
          id="na-type"
          type="text"
          placeholder="Ej: Control de Rutina, Vacunación, Cuadro Febril..."
          {...register('type')}
          className={cn(inputClass(!!errors.type), 'placeholder:text-slate-300')}
        />
        {errors.type && <p className="text-xs text-rose-500">{errors.type.message}</p>}
      </div>

      {/* Notas (opcional) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-notes" className={labelClass}>
          Notas <span className="text-slate-300 font-normal normal-case">(opcional)</span>
        </label>
        <textarea
          id="na-notes"
          rows={2}
          placeholder="Observaciones adicionales..."
          {...register('notes')}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
        />
      </div>

      {/* Inline toast */}
      {toast && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium border',
            toast.type === 'success'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-rose-600 bg-rose-50 border-rose-200',
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          )}
          {toast.message}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            reset();
            setToast(null);
            onSuccess();
          }}
          className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          id="na-submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand-600 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Agendar Turno'
          )}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create `apps/web/components/appointments/new-appointment-dialog.tsx`**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import { NewAppointmentForm } from './new-appointment-form';

// ── Component ─────────────────────────────────────────────────────────────────

export function NewAppointmentDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = useCallback(() => setIsOpen(false), []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        id="btn-new-appointment"
        onClick={open}
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-600 active:scale-[0.98]"
      >
        <CalendarPlus className="h-4 w-4" />
        Nuevo Turno
      </button>

      {/* Backdrop + Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="na-dialog-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Dialog panel — taller than patient dialog due to more fields */}
          <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl shadow-card-shell border border-slate-200/60 animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 id="na-dialog-title" className="text-base font-bold text-slate-900">
                  Nuevo Turno
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Agendá un turno médico pediátrico</p>
              </div>
              <button
                type="button"
                id="btn-close-new-appointment"
                onClick={close}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="px-6 py-5 overflow-y-auto no-scrollbar">
              <NewAppointmentForm onSuccess={close} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Verify full TypeScript build — web**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -40
```

Expected: no output.

- [ ] **Step 4: Run a Next.js build to catch module/import errors**

```bash
cd apps/web && npx next build 2>&1 | tail -25
```

Expected: build succeeds with `/appointments` in the route table. No red error lines.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/appointments/ "apps/web/app/(dashboard)/appointments/page.tsx"
git commit -m "feat(web): add NewAppointmentDialog + NewAppointmentForm with patient/doctor selects, datetime picker, and inline toast"
```

---

## Verification Plan

### Automated Tests

```bash
# API TypeScript
cd apps/api && npx tsc --noEmit

# Web TypeScript
cd apps/web && npx tsc --noEmit

# Web build (full route compile)
cd apps/web && npx next build
```

### Manual Verification

1. Navigate to `http://localhost:3000/appointments`
2. Confirm "Agenda de Turnos" header with count pill and "+ Nuevo Turno" button
3. If no upcoming appointments exist: glassmorphism card with empty state ("No hay turnos próximos")
4. If appointments exist: table rows with date, time, patient (linked to profile), guardian, type, doctor, status badge
5. Click status badge → `AppointmentStatusSelector` dropdown opens; change status → PATCH fires, router refreshes
6. Click "+ Nuevo Turno" → modal opens with slide-up animation and backdrop blur
7. Both selects ("Paciente", "Médico") show "Cargando..." then populate with real data from the API
8. Submit empty → 4 validation errors in Spanish
9. Fill all required fields, submit → spinner, "Turno agendado con éxito." toast, modal closes, table refreshes
10. Press Escape or click backdrop → modal closes
11. Network DevTools: `POST /api/v1/appointments` → 201 Created with correct body; `GET /api/v1/doctors` → 200 with doctor list
