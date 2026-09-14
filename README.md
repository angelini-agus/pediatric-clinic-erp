# pediatric-clinic-erp

ERP médico pediátrico para consultorio (mercado argentino, Ley 26.529): turnos,
historia clínica, prescripciones y landing pública.

## Stack

| App / Paquete            | Tecnología                             | Puerto |
| ------------------------ | -------------------------------------- | ------ |
| `apps/api`               | NestJS 10 + Fastify 4 + Prisma + Zod   | 3001   |
| `apps/web`               | Next.js 14 (App Router) + Tailwind     | 3000   |
| `apps/landing`           | Astro 5 + islas React + Tailwind       | 4321   |
| `packages/db`            | Prisma ORM (schema, migraciones, seed) | —      |
| `packages/schemas`       | Zod schemas compartidos (DTOs y env)   | —      |
| `packages/eslint-config` | Config ESLint/Prettier compartida      | —      |

Infra local: PostgreSQL 16 vía `docker-compose.yml` (puerto 5432) + Adminer
opcional (perfil `tools`, puerto 8080).

## Requisitos

- Node >= 22.12 (lo exige `apps/landing`)
- pnpm 9 (`corepack enable`)
- Docker Desktop (para Postgres local)

## Puesta en marcha

```bash
# 1. Dependencias
pnpm install

# 2. Variables de entorno (copiar los .env.example)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/landing/.env.example apps/landing/.env.local

# 3. Base de datos (Docker Desktop debe estar corriendo)
docker compose up -d postgres

# 4. Prisma: generar cliente y aplicar migraciones
pnpm --filter @pediatric-erp/db db:generate
pnpm --filter @pediatric-erp/db db:migrate:dev
pnpm --filter @pediatric-erp/db db:seed   # opcional: datos de prueba

# 5. Levantar todo (turbo: api + web + landing)
pnpm dev
```

## Scripts (raíz)

| Comando             | Qué hace                                   |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | Levanta todas las apps en paralelo (turbo) |
| `pnpm build`        | Build de producción de todas las apps      |
| `pnpm lint`         | ESLint en todos los paquetes               |
| `pnpm type-check`   | Chequeo de tipos (tsc / astro check)       |
| `pnpm format`       | Prettier --write sobre el repo             |
| `pnpm format:check` | Verifica formato sin escribir              |
| `pnpm clean`        | Limpia artefactos de build y node_modules  |

## Estructura

```
apps/
  api/       NestJS: auth (JWT), pacientes, turnos, historia clínica,
             prescripciones (PDF), analytics, settings, auditoría.
  web/       Next.js: dashboard del personal + BFF (/api/auth/*, /api/proxy/*).
  landing/   Astro: sitio público SEO-first (Miradas — Consultorios de Pediatría Integral).
packages/
  db/        Prisma schema + migraciones + seed.
  schemas/   Zod: env, auth, patient, appointment, medical-record, etc.
  eslint-config/  Configs flat compartidas (base / nest / next).
docker/      init.sql de Postgres.
```

## Notas

- **Seguridad**: todos los endpoints del API requieren JWT (guard global);
  los datos clínicos están restringidos por rol (`DOCTOR/ADMIN/SUPER_ADMIN`).
  La web guarda el token en cookie httpOnly vía BFF; nunca en `localStorage`.
- **Datos sensibles**: los `.env` no se commitean. Si una credencial se
  expone, hay que rotarla (no alcanza con sacarla del código).
- **Landing**: la URL del ERP se configura con `PUBLIC_ERP_URL` (default
  `http://localhost:3000`).
- **Formato y lint**: Prettier + ESLint flat config en las tres apps; correr
  `pnpm lint` y `pnpm format:check` antes de commitear.
