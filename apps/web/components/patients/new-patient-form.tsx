'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  BIOLOGICAL_SEXES,
  BLOOD_GROUPS,
  DOCUMENT_TYPES,
  GUARDIAN_RELATIONSHIPS,
  patientCreateSchema,
} from '@pediatric-erp/schemas';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { Resolver } from 'react-hook-form';
import type { z } from 'zod';



/**
 * Tipo del formulario = output type del schema (`z.infer`). Coincide con
 * `PatientCreate` (que es lo que la API espera).
 *
 * El `.default('DNI')` del schema produce un mismatch menor entre el input
 * type (donde `documentType` es opcional) y el output type (donde es
 * requerido). Esto no es problema en runtime: el formulario siempre
 * provee `documentType` (lo preseteamos a 'DNI' en `defaultValues`), pero
 * rompe los tipos del `Resolver` de react-hook-form con
 * `exactOptionalPropertyTypes: true`. Por eso casteamos el resolver abajo.
 */
type NewPatientFormValues = z.infer<typeof patientCreateSchema>;

import { createPatient } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Local UI label maps ───────────────────────────────────────────────────────

const SEX_LABELS: Record<string, string> = {
  MALE: 'Masculino',
  FEMALE: 'Femenino',
  OTHER: 'Otro',
};

const DOCUMENT_LABELS: Record<string, string> = {
  DNI: 'DNI',
  PASSPORT: 'Pasaporte',
  OTHER: 'Otro',
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  MOTHER: 'Madre',
  FATHER: 'Padre',
  LEGAL_GUARDIAN: 'Tutor Legal',
  OTHER: 'Otro',
};

// ── Props ─────────────────────────────────────────────────────────────────────

type NewPatientFormProps = {
  onCreated?: (patientId: string) => void;
};

// ── Styling helpers ───────────────────────────────────────────────────────────

const triggerClass = (hasError: boolean): string =>
  cn(
    'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80',
    'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
    hasError
      ? 'border-rose-300 focus:ring-rose-200'
      : 'border-slate-200',
  );

const labelClass = 'text-xs font-semibold text-slate-600 uppercase tracking-wider';

const helpClass = 'text-[11px] text-slate-400 mt-0.5';

const errorClass = 'text-xs text-rose-500 mt-1';

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className={helpClass}>{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * NewPatientForm — formulario completo de alta de pacientes pediátricos.
 *
 * Implementado con:
 *   - `react-hook-form` (re-renders minimizados por field).
 *   - `zodResolver` conectado a `patientCreateSchema` (mismo schema que el
 *     backend valida → contract-first, sin drift entre cliente y servidor).
 *
 * Estilo: glassmorphism unificado con focus ring `brand/30` y errores
 * `rose-300` (alineado con el resto del ERP).
 */
export function NewPatientForm({ onCreated }: NewPatientFormProps = {}): React.JSX.Element {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPatientFormValues>({
    // Cast explícito: el resolver de Zod genera una firma con `documentType`
    // opcional (input) mientras `NewPatientFormValues` lo quiere requerido.
    // En runtime ambos tipos son idénticos cuando `documentType` siempre
    // está presente en el form.
    resolver: zodResolver(patientCreateSchema) as Resolver<NewPatientFormValues>,
    defaultValues: {
      firstName: '',
      lastName: '',
      documentType: 'DNI',
      documentNumber: '',
      dateOfBirth: undefined as unknown as Date,
      biologicalSex: undefined as unknown as NewPatientFormValues['biologicalSex'],
      bloodGroup: null,
      healthInsurance: null,
      healthInsurancePlan: null,
      healthInsuranceNumber: null,
      guardianFullName: '',
      guardianPhone: '',
      guardianEmail: null,
      guardianRelationship: undefined as unknown as NewPatientFormValues['guardianRelationship'],
      birthWeightGrams: null,
      gestationalWeeks: null,
      apgarScore: null,
    },
  });

  const onValid = async (values: NewPatientFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      const created = await createPatient(values);
      if (onCreated) {
        onCreated(created.id);
      } else {
        router.push(`/patients/${created.id}`);
        router.refresh();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido al crear el paciente.';
      setSubmitError(message);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(onValid)(e)}
      data-testid="patient-form"
      className="space-y-8"
      noValidate
    >
      {/* ── Submission banner (top-level error) ─────────────────────── */}
      {submitError && (
        <div
          role="alert"
          data-testid="patient-form-error"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 backdrop-blur-sm px-4 py-3 text-sm text-rose-700"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">No pudimos guardar el paciente</p>
            <p className="text-xs mt-0.5 text-rose-600/90">{submitError}</p>
          </div>
        </div>
      )}

      {/* ── Personal Data ──────────────────────────────────────────── */}
      <Section title="Datos Personales" description="Identidad y documentación del paciente.">
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName" className={labelClass}>
            Nombre <span className="text-rose-500">*</span>
          </label>
          <input
            id="firstName"
            data-testid="patient-firstName"
            type="text"
            placeholder="Sofía"
            {...register('firstName')}
            className={triggerClass(Boolean(errors.firstName))}
          />
          {errors.firstName?.message && (
            <p className={errorClass}>{errors.firstName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className={labelClass}>
            Apellido <span className="text-rose-500">*</span>
          </label>
          <input
            id="lastName"
            data-testid="patient-lastName"
            type="text"
            placeholder="González"
            {...register('lastName')}
            className={triggerClass(Boolean(errors.lastName))}
          />
          {errors.lastName?.message && (
            <p className={errorClass}>{errors.lastName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="documentType" className={labelClass}>
            Tipo de Documento
          </label>
          <select
            id="documentType"
            data-testid="patient-documentType"
            {...register('documentType')}
            className={triggerClass(Boolean(errors.documentType))}
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {DOCUMENT_LABELS[t] ?? t}
              </option>
            ))}
          </select>
          {errors.documentType?.message && (
            <p className={errorClass}>{errors.documentType.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="documentNumber" className={labelClass}>
            Número de Documento <span className="text-rose-500">*</span>
          </label>
          <input
            id="documentNumber"
            data-testid="patient-documentNumber"
            type="text"
            placeholder="45123456"
            {...register('documentNumber')}
            className={triggerClass(Boolean(errors.documentNumber))}
          />
          {errors.documentNumber?.message && (
            <p className={errorClass}>{errors.documentNumber.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="dateOfBirth" className={labelClass}>
            Fecha de Nacimiento <span className="text-rose-500">*</span>
          </label>
          <input
            id="dateOfBirth"
            data-testid="patient-dateOfBirth"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            {...register('dateOfBirth')}
            className={triggerClass(Boolean(errors.dateOfBirth))}
          />
          {errors.dateOfBirth?.message && (
            <p className={errorClass}>{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="biologicalSex" className={labelClass}>
            Sexo Biológico <span className="text-rose-500">*</span>
          </label>
          <select
            id="biologicalSex"
            data-testid="patient-biologicalSex"
            {...register('biologicalSex')}
            className={triggerClass(Boolean(errors.biologicalSex))}
          >
            <option value="">Seleccioná una opción</option>
            {BIOLOGICAL_SEXES.map((s) => (
              <option key={s} value={s}>
                {SEX_LABELS[s] ?? s}
              </option>
            ))}
          </select>
          {errors.biologicalSex?.message && (
            <p className={errorClass}>{errors.biologicalSex.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="bloodGroup" className={labelClass}>
            Grupo Sanguíneo <span className="text-slate-300 font-normal normal-case">(opcional)</span>
          </label>
          <select
            id="bloodGroup"
            data-testid="patient-bloodGroup"
            {...register('bloodGroup')}
            className={triggerClass(Boolean(errors.bloodGroup))}
          >
            <option value="">Sin especificar</option>
            {BLOOD_GROUPS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {errors.bloodGroup?.message && (
            <p className={errorClass}>{errors.bloodGroup.message}</p>
          )}
        </div>
      </Section>

      {/* ── Guardian ──────────────────────────────────────────────── */}
      <Section
        title="Tutor Responsable"
        description="Persona adulta a cargo del paciente (contacto principal)."
      >
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="guardianFullName" className={labelClass}>
            Nombre Completo del Tutor <span className="text-rose-500">*</span>
          </label>
          <input
            id="guardianFullName"
            data-testid="patient-guardianFullName"
            type="text"
            placeholder="María González"
            {...register('guardianFullName')}
            className={triggerClass(Boolean(errors.guardianFullName))}
          />
          {errors.guardianFullName?.message && (
            <p className={errorClass}>{errors.guardianFullName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="guardianRelationship" className={labelClass}>
            Vínculo <span className="text-rose-500">*</span>
          </label>
          <select
            id="guardianRelationship"
            data-testid="patient-guardianRelationship"
            {...register('guardianRelationship')}
            className={triggerClass(Boolean(errors.guardianRelationship))}
          >
            <option value="">Seleccioná una opción</option>
            {GUARDIAN_RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>
                {RELATIONSHIP_LABELS[r] ?? r}
              </option>
            ))}
          </select>
          {errors.guardianRelationship?.message && (
            <p className={errorClass}>{errors.guardianRelationship.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="guardianPhone" className={labelClass}>
            Teléfono <span className="text-rose-500">*</span>
          </label>
          <input
            id="guardianPhone"
            data-testid="patient-guardianPhone"
            type="tel"
            placeholder="+54 11 5555-5555"
            {...register('guardianPhone')}
            className={triggerClass(Boolean(errors.guardianPhone))}
          />
          {errors.guardianPhone?.message && (
            <p className={errorClass}>{errors.guardianPhone.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="guardianEmail" className={labelClass}>
            Email <span className="text-slate-300 font-normal normal-case">(opcional)</span>
          </label>
          <input
            id="guardianEmail"
            data-testid="patient-guardianEmail"
            type="email"
            placeholder="tutor@ejemplo.com"
            {...register('guardianEmail')}
            className={triggerClass(Boolean(errors.guardianEmail))}
          />
          {errors.guardianEmail?.message && (
            <p className={errorClass}>{errors.guardianEmail.message}</p>
          )}
        </div>
      </Section>

      {/* ── Health Insurance ───────────────────────────────────────── */}
      <Section
        title="Cobertura Médica"
        description="Obra social o prepaga. Todos los campos son opcionales."
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="healthInsurance" className={labelClass}>
            Obra Social / Prepaga
          </label>
          <input
            id="healthInsurance"
            data-testid="patient-healthInsurance"
            type="text"
            placeholder="OSDE"
            {...register('healthInsurance')}
            className={triggerClass(Boolean(errors.healthInsurance))}
          />
          {errors.healthInsurance?.message && (
            <p className={errorClass}>{errors.healthInsurance.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="healthInsurancePlan" className={labelClass}>
            Plan
          </label>
          <input
            id="healthInsurancePlan"
            data-testid="patient-healthInsurancePlan"
            type="text"
            placeholder="210"
            {...register('healthInsurancePlan')}
            className={triggerClass(Boolean(errors.healthInsurancePlan))}
          />
          {errors.healthInsurancePlan?.message && (
            <p className={errorClass}>{errors.healthInsurancePlan.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="healthInsuranceNumber" className={labelClass}>
            Nro. de Afiliado
          </label>
          <input
            id="healthInsuranceNumber"
            data-testid="patient-healthInsuranceNumber"
            type="text"
            placeholder="123456789012"
            {...register('healthInsuranceNumber')}
            className={triggerClass(Boolean(errors.healthInsuranceNumber))}
          />
          {errors.healthInsuranceNumber?.message && (
            <p className={errorClass}>{errors.healthInsuranceNumber.message}</p>
          )}
        </div>
      </Section>

      {/* ── Perinatal Background ──────────────────────────────────── */}
      <Section
        title="Antecedentes Perinatales"
        description="Datos clínicos del nacimiento. Requeridos por Ley 26.529."
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="birthWeightGrams" className={labelClass}>
            Peso al Nacer (gramos)
          </label>
          <input
            id="birthWeightGrams"
            data-testid="patient-birthWeightGrams"
            type="number"
            min={300}
            max={7000}
            step={1}
            placeholder="3250"
            {...register('birthWeightGrams', { valueAsNumber: true })}
            className={triggerClass(Boolean(errors.birthWeightGrams))}
          />
          <p className={helpClass}>Rango válido: 300g – 7000g</p>
          {errors.birthWeightGrams?.message && (
            <p className={errorClass}>{errors.birthWeightGrams.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="gestationalWeeks" className={labelClass}>
            Semanas Gestacionales
          </label>
          <input
            id="gestationalWeeks"
            data-testid="patient-gestationalWeeks"
            type="number"
            min={20}
            max={45}
            step={1}
            placeholder="39"
            {...register('gestationalWeeks', { valueAsNumber: true })}
            className={triggerClass(Boolean(errors.gestationalWeeks))}
          />
          <p className={helpClass}>Rango válido: 20 – 45 semanas</p>
          {errors.gestationalWeeks?.message && (
            <p className={errorClass}>{errors.gestationalWeeks.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="apgarScore" className={labelClass}>
            Apgar
          </label>
          <input
            id="apgarScore"
            data-testid="patient-apgarScore"
            type="text"
            placeholder="9/10"
            maxLength={10}
            {...register('apgarScore')}
            className={triggerClass(Boolean(errors.apgarScore))}
          />
          {errors.apgarScore?.message && (
            <p className={errorClass}>{errors.apgarScore.message}</p>
          )}
        </div>
      </Section>

      {/* ── Actions ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-xl px-3 py-2 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Link>
        <button
          id="save-patient-btn"
          type="submit"
          data-testid="patient-submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Registrar Paciente
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/**
 * Tiny icon used for success states (e.g., when extending the form with
 * a confirmation step). Kept here to avoid pulling extra lucide-react
 * imports from parent components that don't otherwise need them.
 */
export const NewPatientFormSuccessIcon = CheckCircle2;
