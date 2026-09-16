import fs from 'node:fs';
import path from 'node:path';

import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Screenshot capture pass for the root README.
 *
 * Everything runs against the LOCAL stack with seeded demo data
 * (packages/db/prisma/seed.ts) — never against production.
 *
 * Output: <repo-root>/screenshots/
 *   landing/  hero | journey | testimonials | booking  × desktop + mobile
 *   erp/      dashboard, portal requests, appointments, consultations,
 *             patient record, patient portal (desktop only)
 */

const LANDING_URL = 'http://localhost:4321';
const SHOTS_DIR = path.resolve(__dirname, '../../../screenshots');

const STAFF_EMAIL = 'ricardo.silva@pediatric-erp.com';
const STAFF_PASSWORD = 'admin123';
const PATIENT_EMAIL = 'sofia.gonzalez@example.com';

// ── Helpers ─────────────────────────────────────────────────────────────────

function shotPath(...parts: string[]): string {
  const target = path.join(SHOTS_DIR, ...parts);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  return target;
}

/** Waits for web fonts + a settle window (load/reveal animations). */
async function settle(page: Page, ms = 700): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}

/** Waits for a test-id with a generous timeout (Next dev compiles on demand). */
async function waitForTestId(page: Page, testId: string): Promise<void> {
  await page.getByTestId(testId).waitFor({ state: 'visible', timeout: 60_000 });
}

/** Hides fixed chrome (floating navbar, WhatsApp button) for section shots. */
async function hideFixedChrome(page: Page): Promise<void> {
  await page.addStyleTag({
    content: 'header.fixed, a.fixed[href*="wa.me"] { display: none !important; }',
  });
}

/** Hides the Next.js dev-mode indicator so screenshots look production-clean. */
async function hideNextDevIndicator(page: Page): Promise<void> {
  await page.context().addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = 'nextjs-portal { display: none !important; }';
    document.documentElement.appendChild(style);
  });
}

/** Logs in through the real UI (BFF → httpOnly cookie). */
async function login(page: Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(STAFF_PASSWORD);
  await page.getByTestId('login-submit').click();
}

async function captureLandingSections(page: Page, suffix: 'desktop' | 'mobile'): Promise<void> {
  const sections: { id: string; name: string }[] = [
    { id: 'main-content', name: 'hero' },
    { id: 'acompanamiento', name: 'journey' },
    { id: 'testimonios', name: 'testimonials' },
    { id: 'turnos', name: 'booking' },
  ];

  for (const section of sections) {
    const locator: Locator = page.locator(`#${section.id}`);
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);

    // Hero (desktop): viewport shot so the floating navbar is included.
    if (section.name === 'hero' && suffix === 'desktop') {
      await page.screenshot({
        path: shotPath('landing', `${section.name}-${suffix}.jpg`),
        type: 'jpeg',
        quality: 88,
      });
      await hideFixedChrome(page);
      continue;
    }

    // Mobile hero: element shot — fixed chrome would otherwise bleed into it.
    if (section.name === 'hero') {
      await hideFixedChrome(page);
    }

    await locator.screenshot({
      path: shotPath('landing', `${section.name}-${suffix}.jpg`),
      type: 'jpeg',
      quality: 88,
    });
  }
}

// ── Landing ─────────────────────────────────────────────────────────────────

test.describe('Landing screenshots', () => {
  test('desktop sections (1440×900)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(LANDING_URL, { waitUntil: 'load' });
    await settle(page, 2000);
    await captureLandingSections(page, 'desktop');
  });

  test('mobile sections (390×844)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(LANDING_URL, { waitUntil: 'load' });
    await settle(page, 2000);
    await captureLandingSections(page, 'mobile');
    await context.close();
  });
});

// ── ERP — staff (desktop) ───────────────────────────────────────────────────

test.describe('ERP screenshots', () => {
  test('staff screens (1440×900)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await hideNextDevIndicator(page);

    await login(page, STAFF_EMAIL);
    await expect(page).toHaveURL(/dashboard/);

    // 1. Dashboard — daily operations board
    await page.goto('/dashboard');
    await waitForTestId(page, 'todays-bookings-table');
    await settle(page, 1500);
    await page.screenshot({ path: shotPath('erp', 'dashboard.png') });

    // 2. Dashboard — patient portal requests inbox
    await page.goto('/dashboard?view=solicitudes');
    await waitForTestId(page, 'pending-requests-table');
    await settle(page);
    await page.screenshot({ path: shotPath('erp', 'portal-requests.png') });

    // 3. Appointments — agenda table
    await page.goto('/appointments');
    await waitForTestId(page, 'appointments-table');
    await settle(page);
    await page.screenshot({ path: shotPath('erp', 'appointments.png') });

    // 4. Appointments — new booking dialog
    await page.getByTestId('btn-new-appointment').click();
    await waitForTestId(page, 'appointment-form');
    await settle(page);
    await page.screenshot({ path: shotPath('erp', 'appointment-dialog.png') });

    // 5. Consultations — daily worklist + embedded consultation panel
    await page.goto('/consultations');
    await page.getByText('Consultas Médicas').waitFor({ state: 'visible', timeout: 60_000 });
    // Open the in-progress consultation (Valentina Pérez) to show the panel.
    await page.getByRole('button', { name: /Valentina Pérez/ }).click();
    await page.getByText('Últimas evoluciones').waitFor({ state: 'visible', timeout: 60_000 });
    await settle(page, 1500);
    await page.screenshot({ path: shotPath('erp', 'consultations.png') });

    // 6. Patient record — profile + evolution timeline (Mateo González)
    await page.goto('/patients?q=Mateo');
    const recordLink = page.getByRole('link', { name: /ver historia clínica/i }).first();
    await expect(recordLink).toBeVisible({ timeout: 60_000 });
    const recordHref = await recordLink.getAttribute('href');
    if (recordHref === null) {
      throw new Error('Patient record link has no href');
    }
    await page.goto(recordHref);
    await expect(page).toHaveURL(/\/patients\/.+/, { timeout: 60_000 });
    await page
      .getByText('Historial Clínico (Evoluciones)')
      .waitFor({ state: 'visible', timeout: 60_000 });
    await settle(page, 1200);
    await page.screenshot({ path: shotPath('erp', 'patient-record.png') });
  });

  test('patient portal (1440×900)', async ({ browser }) => {
    // Separate context: the patient session must not inherit the staff cookie.
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    await context.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = 'nextjs-portal { display: none !important; }';
      document.documentElement.appendChild(style);
    });

    await login(page, PATIENT_EMAIL);
    await page.waitForURL(/\/portal/, { timeout: 60_000 });

    // 7. Portal — "Mis turnos" (next appointment + request form + history)
    await page.getByText('Próximo turno').waitFor({ state: 'visible', timeout: 60_000 });
    await settle(page, 1000);
    await page.screenshot({ path: shotPath('erp', 'portal-appointments.png') });

    // 8. Portal — contact & location (published only behind login)
    await page.goto('http://localhost:3000/portal/contact');
    await page.getByText('Contacto y ubicación').waitFor({ state: 'visible', timeout: 60_000 });
    await settle(page);
    await page.screenshot({ path: shotPath('erp', 'portal-contact.png') });

    await context.close();
  });
});
