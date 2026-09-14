import { expect, test as setup } from '@playwright/test';

import { AUTH_STORAGE_STATE, E2E_TEST_EMAIL, E2E_TEST_PASSWORD } from './helpers';

/**
 * Setup worker: authenticates ONCE via the real UI (BFF /api/auth/login →
 * httpOnly cookie) and persists the session to disk for the
 * `authenticated-chromium` project (golden path reuse).
 */
setup('authenticate as seeded admin', async ({ page }) => {
  await page.goto('/login');

  await page.getByTestId('login-email').fill(E2E_TEST_EMAIL);
  await page.getByTestId('login-password').fill(E2E_TEST_PASSWORD);
  await page.getByTestId('login-submit').click();

  // Successful login redirects to the dashboard.
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByTestId('header-user-menu')).toBeVisible();

  await page.context().storageState({ path: AUTH_STORAGE_STATE });
});
