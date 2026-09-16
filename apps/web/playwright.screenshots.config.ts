import { defineConfig, devices } from '@playwright/test';

/**
 * Screenshot capture config — NOT part of the e2e suite.
 *
 * Runs the capture pass that produces the images used by the root README:
 *   - Landing: desktop (1440×900) + mobile (390×844) section pairs.
 *   - ERP: staff and patient portal screens at desktop (1440×900).
 *
 * Usage (from apps/web):
 *   pnpm exec playwright test -c playwright.screenshots.config.ts
 *
 * Preconditions:
 *   - docker compose up -d postgres
 *   - pnpm --filter @pediatric-erp/db db:migrate:deploy
 *   - pnpm --filter @pediatric-erp/db db:seed
 *   - pnpm --filter @pediatric-erp/web exec playwright install chromium
 *
 * The three dev servers are booted (or reused) automatically via webServer.
 * Output: <repo-root>/screenshots/...
 */
const WEB_URL = 'http://localhost:3000';
const LANDING_URL = 'http://localhost:4321';
const API_HEALTH_URL = 'http://localhost:3001/api/v1/health';

export default defineConfig({
  testDir: './e2e-screenshots',
  // Sequential: shared dev servers + login rate-limiting (ThrottlerGuard).
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // Dev-mode servers compile routes on demand — first paint can be slow.
  timeout: 180_000,
  reporter: [['list']],
  outputDir: 'test-results-screenshots',
  use: {
    baseURL: WEB_URL,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'capture',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @pediatric-erp/api dev',
      url: API_HEALTH_URL,
      timeout: 180_000,
      reuseExistingServer: true,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'pnpm --filter @pediatric-erp/web dev',
      url: `${WEB_URL}/login`,
      timeout: 180_000,
      reuseExistingServer: true,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'pnpm --filter @pediatric-erp/landing dev',
      url: LANDING_URL,
      timeout: 180_000,
      reuseExistingServer: true,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
