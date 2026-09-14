import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for @pediatric-erp/web.
 *
 * ── Golden Path coverage ───────────────────────────────────────────────────
 *  1. Security & Authentication  → e2e/auth.spec.ts (401 resilience + login)
 *  2. Critical operational flow  → e2e/critical-path.spec.ts (patient + turno)
 *
 * ── Architecture ───────────────────────────────────────────────────────────
 *  - baseURL: the Next.js app (port 3000). The NestJS API is reached by the
 *    app itself (NEXT_PUBLIC_API_URL, port 3001).
 *  - webServer: `pnpm dev` from the monorepo root — turbo boots BOTH the
 *    NestJS API and the Next.js web app automatically before the tests.
 *    If the servers are already running, they are reused (fast local loop).
 *  - Two projects + auth.setup: the "authenticated" project consumes a
 *    storageState produced by a dedicated setup worker, so the critical
 *    path never repeats the login ceremony. Login rate-limiting
 *    (ThrottlerGuard 5 req/min) stays intact: 3 logins max per run
 *    (1 setup + 1 failed + 1 successful auth.spec case).
 *
 * ── Preconditions ─────────────────────────────────────────────────────────
 *  - docker compose up -d (PostgreSQL, ver docker-compose.yml)
 *  - pnpm --filter @pediatric-erp/db prisma migrate deploy
 *  - pnpm --filter @pediatric-erp/db prisma db seed
 *    (creates admin@admin.com / admin123 + Dr. Ricardo Silva)
 *  - pnpm --filter @pediatric-erp/web exec playwright install chromium
 */
const BASE_URL = process.env['E2E_BASE_URL'] ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  // Sequential execution: the critical path depends on data created by the
  // patient flow, and login is rate-limited per IP (ThrottlerGuard).
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  // Retries are disabled on purpose: login is rate-limited (5 req/min), so a
  // retry within the same window would just re-trigger a 429. Keep the suite
  // deterministic instead (0 retries) and rely on robust waits in the tests.
  retries: 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      // Logs in ONCE and persists the httpOnly session cookie to disk.
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Public-facing flows: must run WITHOUT a pre-existing session
      // (the middleware redirects /login → /dashboard when authenticated).
      name: 'public-chromium',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      // Golden path: session reused from the setup worker.
      name: 'authenticated-chromium',
      testIgnore: [/auth\.spec\.ts/, /auth\.setup\.ts/],
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  // Two webServers (array form): each polls its own readiness URL BEFORE the
  // tests run. This avoids the cold-boot race where the login test hits the
  // API while NestJS is still compiling (503 -> flaky "stays on /login").
  //
  // Local dev: servers are reused if already running (reuseExistingServer),
  // otherwise each is spawned individually. CI: same individual commands.
  webServer: [
    {
      // NestJS API (3001) — polled via its Terminus health endpoint.
      command: 'pnpm --filter @pediatric-erp/api dev',
      url: 'http://localhost:3001/api/v1/health',
      timeout: 180_000,
      reuseExistingServer: !process.env['CI'],
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      // Next.js app (3000) — polled via /login.
      command: 'pnpm --filter @pediatric-erp/web dev',
      url: `${BASE_URL}/login`,
      timeout: 180_000,
      reuseExistingServer: !process.env['CI'],
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
