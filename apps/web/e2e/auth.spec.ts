import { expect, test } from '@playwright/test';

import { E2E_TEST_EMAIL, E2E_TEST_PASSWORD } from './helpers';

/**
 * Security & Authentication golden paths.
 *
 * These tests run in the `public-chromium` project (NO pre-seeded session),
 * because the middleware redirects /login → /dashboard when a token exists.
 */

test.describe('Autenticación (Security & Auth)', () => {
  test('fallido: credenciales inválidas → 401 capturado y error renderizado sin crash', async ({
    page,
  }) => {
    await page.goto('/login');

    // Credenciales incorrectas (el backend responde 401 INVALID_CREDENTIALS).
    await page.getByTestId('login-email').fill('hacker@e2e.test');
    await page.getByTestId('login-password').fill('wrong-password-123');
    await page.getByTestId('login-submit').click();

    // Resiliencia: el frontend captura el 401 del backend y renderiza el
    // mensaje en la UI (state.kind === 'error') sin crashear.
    const errorBanner = page.getByTestId('login-error');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(/credenciales inválidas/i);

    // Sin redirección: seguimos en /login y el formulario sigue operativo.
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('login-submit')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeEnabled();
  });

  test('exitoso: credenciales válidas → redirección a /dashboard con Header autenticado', async ({
    page,
  }) => {
    await page.goto('/login');

    // Credenciales del seed (admin@admin.com / admin123).
    await page.getByTestId('login-email').fill(E2E_TEST_EMAIL);
    await page.getByTestId('login-password').fill(E2E_TEST_PASSWORD);
    await page.getByTestId('login-submit').click();

    // Redirección post-login al dashboard (middleware + router.push).
    await expect(page).toHaveURL(/.*dashboard/);

    // Header muestra la UI autenticada (menú de usuario con identidad).
    await expect(page.getByTestId('header-user-menu')).toBeVisible();
  });
});
