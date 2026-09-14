import { expect, test } from '@playwright/test';

import {
  dayPickerAriaLabel,
  futureAppointmentSlot,
  SEEDED_DOCTOR_OPTION,
  uniqueDni,
  uniqueEmail,
  uniqueTimestamp,
} from './helpers';

/**
 * Golden Path (Camino Crítico) — flujo operativo core del ERP:
 *
 *   1. Alta de paciente pediátrico completo (formulario /patients/new).
 *   2. Agenda de turno: paciente recién creado + médico del seed + fecha/hora.
 *   3. Verificación del turno registrado en la tabla de turnos.
 *
 * Corre en el proyecto `authenticated-chromium` (sesión pre-seed de
 * auth.setup.ts → storageState). Todos los selectores usan `data-testid`
 * (anti-fragile, inmunes a cambios de clases CSS o textos volátiles).
 *
 * TODOS los datos únicos usan `Date.now()` → Previene violaciones de
 * Unique Constraint (Prisma P2002) en ejecuciones repetidas.
 */
test.describe('Golden Path — Alta de paciente + Agenda de turno', () => {
  test('crea un paciente pediátrico y registra su turno en la agenda', async ({ page }) => {
    // ── Datos únicos del run (P2002-safe) ────────────────────────────────
    const ts = uniqueTimestamp();
    const firstName = `E2E${ts}`;
    const lastName = `Paciente${ts}`;
    const patientName = `${firstName} ${lastName}`;
    const dni = uniqueDni(ts);
    const guardianEmail = uniqueEmail(ts);
    const appointmentReason = `Control Trimestral E2E ${ts}`;

    // ═══════════════════════════════════════════════════════════════════
    // 1. ALTA DE PACIENTE (/patients/new)
    // ═══════════════════════════════════════════════════════════════════
    await page.goto('/patients/new');
    await expect(page.getByTestId('patient-form')).toBeVisible();
    // Datos personales
    await page.getByTestId('patient-firstName').fill(firstName);
    await page.getByTestId('patient-lastName').fill(lastName);
    await page.getByTestId('patient-documentNumber').fill(dni);
    await page.getByTestId('patient-dateOfBirth').fill('2021-05-10');
    await page.getByTestId('patient-biologicalSex').selectOption('FEMALE');
    await page.getByTestId('patient-bloodGroup').selectOption('O+');

    // Tutor responsable
    await page.getByTestId('patient-guardianFullName').fill(`Tutor ${firstName}`);
    await page.getByTestId('patient-guardianRelationship').selectOption('MOTHER');
    await page.getByTestId('patient-guardianPhone').fill('+54 9 11 5555-0101');
    await page.getByTestId('patient-guardianEmail').fill(guardianEmail);

    // Cobertura médica
    await page.getByTestId('patient-healthInsurance').fill('OSDE');

    // Antecedentes perinatales
    await page.getByTestId('patient-birthWeightGrams').fill('3250');
    await page.getByTestId('patient-gestationalWeeks').fill('39');
    await page.getByTestId('patient-apgarScore').fill('9/10');

    // Submit → redirección al perfil del paciente recién creado.
    await page.getByTestId('patient-submit').click();
    await expect(page).toHaveURL(/\/patients\/[\w-]+$/);
    await expect(page.getByRole('heading', { name: new RegExp(patientName) })).toBeVisible();

    // ═══════════════════════════════════════════════════════════════════
    // 2. AGENDA DE TURNO (/appointments → dialog "Nuevo Turno")
    // ═══════════════════════════════════════════════════════════════════
    await page.goto('/appointments');
    await page.getByTestId('btn-new-appointment').click();
    await expect(page.getByTestId('appointment-form')).toBeVisible();

    // Paciente recién creado (label exacto = firstName + lastName).
    await page.getByTestId('appointment-patient-select').selectOption({ label: patientName });

    // Médico del seed (Dr. Ricardo Silva — Pediatra).
    await page
      .getByTestId('appointment-doctor-select')
      .selectOption({ label: SEEDED_DOCTOR_OPTION });

    // Fecha: hoy (18:00) si aún es temprano, si no mañana (10:00).
    const slot = futureAppointmentSlot();
    await page.getByTestId('appointment-date').click();
    await page.getByRole('button', { name: dayPickerAriaLabel(slot.date) }).click();

    // Hora: esperar a que termine la verificación de disponibilidad (el
    // placeholder del trigger cambia de "Verificando..." a "Seleccioná") y
    // elegir el PRIMER SLOT LIBRE — los ocupados quedan deshabilitados.
    // NO hardcodear 10:00: corridas anteriores del propio test lo reservan.
    await page.getByTestId('appointment-time').click();
    await expect(page.getByTestId('appointment-time')).toContainText(/seleccion/i, {
      timeout: 10_000,
    });
    const freeTimeSlot = page
      .locator('[data-testid^="appointment-time-option-"]:not([data-disabled])')
      .first();
    await expect(freeTimeSlot).toBeVisible();
    await freeTimeSlot.click();

    // Motivo + notas opcionales.
    await page.getByTestId('appointment-type').fill(appointmentReason);
    await page.getByTestId('appointment-notes').fill('Turno generado por suite E2E Playwright.');

    // Submit → toast de éxito → el dialog se cierra.
    await page.getByTestId('appointment-submit').click();
    await expect(page.getByTestId('appointment-toast')).toContainText(/turno agendado con éxito/i);
    await expect(page.getByTestId('appointment-form')).toBeHidden();

    // ═══════════════════════════════════════════════════════════════════
    // 3. VERIFICACIÓN: turno registrado en la tabla de turnos
    // ═══════════════════════════════════════════════════════════════════
    const agendaTable = page.getByTestId('appointments-table');
    await expect(agendaTable).toContainText(patientName);
    await expect(agendaTable).toContainText(appointmentReason);

    // Si el turno cayó HOY, además debe aparecer en "Turnos de Hoy" del
    // dashboard (tabla del panel principal).
    if (slot.isToday) {
      await page.goto('/dashboard');
      await expect(page.getByTestId('todays-bookings-table')).toContainText(patientName);
    }
  });
});
