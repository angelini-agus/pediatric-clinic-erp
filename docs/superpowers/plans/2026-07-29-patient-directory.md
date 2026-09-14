# Patient Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "+ Nuevo Paciente" button with a modal form to the existing `/patients` page, enabling inline patient creation without full-page navigation.

**Architecture:** The existing `PatientsPage` (Server Component) already fetches and renders `PatientsGrid`. This plan layers a Client Component modal (`NewPatientDialog`) above the grid — a self-contained dialog with React Hook Form + zodResolver, an inline toast, and `router.refresh()` on success. The page header is modified to mount the button; no API/server-side changes are needed.

**Tech Stack:** Next.js 14 App Router, React Hook Form 7, @hookform/resolvers (zodResolver), Zod 3, Tailwind CSS 3 (custom design system), Lucide React icons — all already installed.

## Global Constraints

- All UI copy in **Spanish**; all identifiers/code in **English**
- Glassmorphism style: `bg-white/60 backdrop-blur-xl` pattern, matching existing cards
- Use only packages already in `apps/web/package.json` — no new dependencies
- Form validation schema covers four UI fields: `fullName` (split into firstName/lastName before POST), `birthDate`, `tutorName`, `contactInfo`
- API base URL from `process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1'` (match pattern in `lib/api.ts`)
- POST body to `/api/v1/patients` must include ALL required fields for `patientCreateSchema`: `firstName`, `lastName`, `documentType` (default `'DNI'`), `documentNumber` (default `'00000000'`), `dateOfBirth`, `biologicalSex` (default `'OTHER'`), `guardianFullName`, `guardianPhone`, `guardianRelationship` (default `'OTHER'`)
- No shadcn/ui — build Dialog and Toast with Tailwind + React state, matching `new-medical-record-form.tsx` pattern
- Tailwind tokens used: `brand`, `animate-fade-in`, `animate-slide-up`, `shadow-card-shell` — all defined in `tailwind.config.ts`
- TypeScript strict — no `any`, no unused imports
- Each task ends with `git commit`

---

## File Structure

```
apps/web/
├── components/patients/
│   ├── new-patient-form.tsx       [NEW] Form body (RHF + zodResolver + inline toast)
│   └── new-patient-dialog.tsx     [NEW] Modal wrapper (button + backdrop + panel)
└── app/(dashboard)/patients/
    └── page.tsx                   [MODIFY] Add NewPatientDialog import in header
```

**Rationale:**

- `new-patient-form.tsx` owns form data, validation, submission, toast, `router.refresh()`
- `new-patient-dialog.tsx` owns `isOpen` state, backdrop, Escape-key handling
- Mirrors existing `NewMedicalRecordForm` pattern; each file stays under 200 lines

---

## Task 1: `NewPatientForm` — Form body component

**Files:**

- Create: `apps/web/components/patients/new-patient-form.tsx`

**Interfaces:**

- Consumes: nothing from other tasks
- Produces: `export function NewPatientForm({ onSuccess }: NewPatientFormProps)` — calls `onSuccess()` after successful POST (800ms delay to show success toast)

- [ ] **Step 1: Create `apps/web/components/patients/new-patient-form.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Form schema ───────────────────────────────────────────────────────────────

const newPatientFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'El nombre completo es obligatorio')
    .max(200, 'El nombre no puede superar 200 caracteres')
    .refine((v) => v.trim().includes(' '), {
      message: 'Ingresá nombre y apellido separados por un espacio',
    }),
  birthDate: z
    .string()
    .min(1, 'La fecha de nacimiento es obligatoria')
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Fecha inválida' })
    .refine((v) => new Date(v) <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),
  tutorName: z.string().trim().min(2, 'El nombre del tutor es obligatorio').max(200),
  contactInfo: z.string().trim().min(6, 'El teléfono/contacto es obligatorio').max(30),
});

type NewPatientFormValues = z.infer<typeof newPatientFormSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface NewPatientFormProps {
  onSuccess: () => void;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

type ToastState = { type: 'success' | 'error'; message: string } | null;

// ── Helper ────────────────────────────────────────────────────────────────────

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ') || firstName;
  return { firstName, lastName };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NewPatientForm({ onSuccess }: NewPatientFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewPatientFormValues>({
    resolver: zodResolver(newPatientFormSchema),
    defaultValues: { fullName: '', birthDate: '', tutorName: '', contactInfo: '' },
  });

  const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

  const onSubmit = async (data: NewPatientFormValues) => {
    setToast(null);
    try {
      const { firstName, lastName } = splitFullName(data.fullName);
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          documentType: 'DNI',
          documentNumber: '00000000',
          dateOfBirth: new Date(data.birthDate).toISOString(),
          biologicalSex: 'OTHER',
          guardianFullName: data.tutorName,
          guardianPhone: data.contactInfo,
          guardianRelationship: 'OTHER',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err as { message?: string }).message ?? 'Error al registrar el paciente.';
        setToast({ type: 'error', message: msg });
        return;
      }

      reset();
      setToast({ type: 'success', message: 'Paciente registrado con éxito.' });
      router.refresh();
      setTimeout(() => {
        setToast(null);
        onSuccess();
      }, 800);
    } catch {
      setToast({ type: 'error', message: 'Error de conexión con el servidor.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Nombre completo */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="np-fullName"
          className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
        >
          Nombre completo <span className="text-rose-500">*</span>
        </label>
        <input
          id="np-fullName"
          type="text"
          placeholder="Ej: Valentina García"
          {...register('fullName')}
          className={cn(
            'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300',
            'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
            errors.fullName ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
          )}
        />
        {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName.message}</p>}
      </div>

      {/* Fecha de nacimiento */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="np-birthDate"
          className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
        >
          Fecha de nacimiento <span className="text-rose-500">*</span>
        </label>
        <input
          id="np-birthDate"
          type="date"
          max={new Date().toISOString().split('T')[0]}
          {...register('birthDate')}
          className={cn(
            'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80',
            'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
            errors.birthDate ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
          )}
        />
        {errors.birthDate && <p className="text-xs text-rose-500">{errors.birthDate.message}</p>}
      </div>

      {/* Nombre del tutor */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="np-tutorName"
          className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
        >
          Nombre del tutor <span className="text-rose-500">*</span>
        </label>
        <input
          id="np-tutorName"
          type="text"
          placeholder="Ej: María García"
          {...register('tutorName')}
          className={cn(
            'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300',
            'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
            errors.tutorName ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
          )}
        />
        {errors.tutorName && <p className="text-xs text-rose-500">{errors.tutorName.message}</p>}
      </div>

      {/* Teléfono / Contacto */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="np-contactInfo"
          className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
        >
          Teléfono / Contacto <span className="text-rose-500">*</span>
        </label>
        <input
          id="np-contactInfo"
          type="tel"
          placeholder="Ej: +54 11 5555-0000"
          {...register('contactInfo')}
          className={cn(
            'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300',
            'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
            errors.contactInfo ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
          )}
        />
        {errors.contactInfo && (
          <p className="text-xs text-rose-500">{errors.contactInfo.message}</p>
        )}
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
          id="np-submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand-600 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Registrar Paciente'
          )}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles with no errors**

Run from repo root:

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -40
```

Expected: no output. Fix any errors before proceeding.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/patients/new-patient-form.tsx
git commit -m "feat(web): add NewPatientForm with RHF + zodResolver and inline toast"
```

---

## Task 2: `NewPatientDialog` — Modal wrapper component

**Files:**

- Create: `apps/web/components/patients/new-patient-dialog.tsx`

**Interfaces:**

- Consumes: `NewPatientForm` from Task 1 — `import { NewPatientForm } from './new-patient-form'`
- Produces: `export function NewPatientDialog()` — self-contained, no props

- [ ] **Step 1: Create `apps/web/components/patients/new-patient-dialog.tsx`**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, X } from 'lucide-react';
import { NewPatientForm } from './new-patient-form';

// ── Component ─────────────────────────────────────────────────────────────────

export function NewPatientDialog() {
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

  // Prevent body scroll when modal is open
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
        id="btn-new-patient"
        onClick={open}
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-600 active:scale-[0.98]"
      >
        <UserPlus className="h-4 w-4" />
        Nuevo Paciente
      </button>

      {/* Backdrop + Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="np-dialog-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-card-shell border border-slate-200/60 animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 id="np-dialog-title" className="text-base font-bold text-slate-900">
                  Nuevo Paciente
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Completá los datos del paciente pediátrico
                </p>
              </div>
              <button
                type="button"
                id="btn-close-new-patient"
                onClick={close}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form body */}
            <div className="px-6 py-5">
              <NewPatientForm onSuccess={close} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles with no errors**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -40
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/patients/new-patient-dialog.tsx
git commit -m "feat(web): add NewPatientDialog modal with backdrop blur, Escape key, and slide-up animation"
```

---

## Task 3: Wire `NewPatientDialog` into the patients page

**Files:**

- Modify: `apps/web/app/(dashboard)/patients/page.tsx`

**Interfaces:**

- Consumes: `NewPatientDialog` from Task 2 — `import { NewPatientDialog } from '@/components/patients/new-patient-dialog'`
- Produces: updated `PatientsPage` with button in header row

**Current file** (`apps/web/app/(dashboard)/patients/page.tsx`):

```tsx
import { getPatients } from '@/lib/api';
import { PatientsGrid } from '@/components/patients/patients-grid';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="h-5 w-5 text-brand" />
            Pacientes Pediátricos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Listado completo de pacientes registrados y sus tutores
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm">
          <span>
            {patients.length} {patients.length === 1 ? 'Paciente' : 'Pacientes Registrados'}
          </span>
        </div>
      </div>

      {/* Grid with Live Search */}
      <PatientsGrid initialPatients={patients} />
    </div>
  );
}
```

**Target file** — add `NewPatientDialog` import and wrap the right-side header section in a flex group:

```tsx
import { getPatients } from '@/lib/api';
import { PatientsGrid } from '@/components/patients/patients-grid';
import { NewPatientDialog } from '@/components/patients/new-patient-dialog';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="h-5 w-5 text-brand" />
            Pacientes Pediátricos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Listado completo de pacientes registrados y sus tutores
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm">
            <span>
              {patients.length} {patients.length === 1 ? 'Paciente' : 'Pacientes Registrados'}
            </span>
          </div>
          <NewPatientDialog />
        </div>
      </div>

      {/* Grid with Live Search */}
      <PatientsGrid initialPatients={patients} />
    </div>
  );
}
```

- [ ] **Step 1: Overwrite `apps/web/app/(dashboard)/patients/page.tsx`** with the target file above.

- [ ] **Step 2: Verify TypeScript compiles clean**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -40
```

Expected: no output.

- [ ] **Step 3: Run a Next.js build to catch any import/module errors**

```bash
cd apps/web && npx next build 2>&1 | tail -25
```

Expected: build succeeds with route table showing `/patients`. No red error lines.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(dashboard)/patients/page.tsx"
git commit -m "feat(web): wire NewPatientDialog into PatientsPage header alongside count pill"
```

---

## Verification Plan

### Automated Tests

TypeScript compilation and Next.js build are the primary automated gates (no component tests exist in this project).

```bash
# Type-check
cd apps/web && npx tsc --noEmit

# Build check
cd apps/web && npx next build
```

### Manual Verification

1. `http://localhost:3000/patients` — confirm "+ Nuevo Paciente" button top-right
2. Click button → modal opens with glass panel, slide-up animation, backdrop blur
3. Submit empty form → four validation errors in Spanish appear
4. Fill all fields and submit → spinner, then "Paciente registrado con éxito." toast, modal closes, grid updates
5. Press Escape or click backdrop → modal closes without submitting
6. Network DevTools: POST `/api/v1/patients` → 201 Created
