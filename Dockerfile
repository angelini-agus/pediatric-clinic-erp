# =============================================================================
# Production image — @pediatric-erp/api (NestJS 10 + Fastify + Prisma 6)
#
# Build context: REPOSITORY ROOT. Required, because the API consumes the
# workspace packages @pediatric-erp/db and @pediatric-erp/schemas.
#
#   docker build -t pediatric-erp-api:latest .
#
# Configuration is 100% environment-driven — no secret is ever baked in:
#   DATABASE_URL, JWT_SECRET, CORS_ORIGIN, NODE_ENV, PORT, LOG_LEVEL,
#   THROTTLE_TTL_SECONDS, THROTTLE_LIMIT
#
# At startup the container applies pending Prisma migrations and then starts
# the compiled API. Platform health check path: GET /api/v1/health
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1 — base: Node 20 (Alpine) + pnpm pinned to the root packageManager
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# The Prisma query engine and the migration/schema engine link against OpenSSL.
RUN apk add --no-cache openssl

# Never prompt when corepack downloads the pnpm version pinned in package.json.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2 — deps: full workspace install (dev deps are required to build)
# -----------------------------------------------------------------------------
FROM base AS deps

# Manifests + lockfile first, so this layer is cached until dependencies change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/landing/package.json apps/landing/
COPY packages/db/package.json packages/db/
COPY packages/schemas/package.json packages/schemas/
COPY packages/eslint-config/package.json packages/eslint-config/

# HUSKY=0: the root "prepare" script runs husky, which needs a git repo
# (the .git directory is not part of the build context).
# PRISMA_SKIP_POSTINSTALL_GENERATE=1: the client is generated explicitly below,
# from packages/db/prisma/schema.prisma — the postinstall hook cannot find it
# in a pnpm monorepo.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    HUSKY=0 PRISMA_SKIP_POSTINSTALL_GENERATE=1 pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 3 — builder: generate the Prisma client and build the API dependency graph
# -----------------------------------------------------------------------------
FROM deps AS builder

COPY . .

# The generated Prisma client is required before tsc runs (the API imports its
# types through @pediatric-erp/db).
RUN pnpm --filter @pediatric-erp/db db:generate

# Builds @pediatric-erp/schemas -> @pediatric-erp/db -> @pediatric-erp/api in
# dependency order (turbo.json: build dependsOn ["^build", "^db:generate"]).
RUN pnpm turbo run build --filter=@pediatric-erp/api...

# Prisma CLI version resolved by the lockfile (stays in sync automatically).
RUN node -p "require('/app/packages/db/node_modules/prisma/package.json').version" > /app/.prisma-cli-version

# Stage the generated client (generated code + native query engine) for runtime.
RUN set -eu; \
    client_nm="$(node -p 'const path=require("path");const p=require.resolve("@prisma/client/package.json",{paths:["/app/packages/db"]});path.resolve(path.dirname(p),"../..")')"; \
    mkdir -p /app/prisma-client; \
    cp -R "$client_nm/.prisma/." /app/prisma-client/

# -----------------------------------------------------------------------------
# Stage 4 — runtime: production deps only, non-root user, migrations + API
# -----------------------------------------------------------------------------
FROM base AS runtime

ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app

# Manifests are needed by `pnpm install` and at runtime: the workspace packages
# resolve through their "exports" maps (packages/db, packages/schemas).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/landing/package.json apps/landing/
COPY packages/db/package.json packages/db/
COPY packages/schemas/package.json packages/schemas/
COPY packages/eslint-config/package.json packages/eslint-config/

# Production dependencies only, limited to the API dependency graph.
# The "..." suffix is REQUIRED: without it pnpm does not create the node_modules
# links of the workspace packages (@pediatric-erp/db would not resolve
# @prisma/client at runtime). It also pulls their devDependencies (eslint et al);
# that is the price of correct linking with a frozen lockfile.
# --ignore-scripts: no postinstall is needed here — the Prisma client is copied
# from the builder stage and the Prisma CLI is installed separately below.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    HUSKY=0 PRISMA_SKIP_POSTINSTALL_GENERATE=1 \
    pnpm install --frozen-lockfile --prod --ignore-scripts --filter "@pediatric-erp/api..."

# Compiled artifacts.
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/schemas/dist ./packages/schemas/dist

# Prisma schema + migrations: required by `prisma migrate deploy` on startup.
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma

# Generated Prisma client, placed next to the installed @prisma/client package.
COPY --from=builder /app/prisma-client /tmp/prisma-client
RUN set -eu; \
    client_nm="$(node -p 'const path=require("path");const p=require.resolve("@prisma/client/package.json",{paths:["/app/packages/db"]});path.resolve(path.dirname(p),"../..")')"; \
    mkdir -p "$client_nm/.prisma"; \
    cp -R /tmp/prisma-client/. "$client_nm/.prisma/"; \
    rm -rf /tmp/prisma-client

# Prisma CLI — used by the entrypoint to apply migrations at startup.
# npm itself is removed afterwards: it is not needed at runtime.
COPY --from=builder /app/.prisma-cli-version /tmp/prisma-cli-version
RUN npm install -g --no-fund --no-audit "prisma@$(cat /tmp/prisma-cli-version)" \
 && npm cache clean --force \
 && rm -rf /root/.npm /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /tmp/prisma-cli-version

# Entrypoint: `prisma migrate deploy` (fail fast) then the compiled API.
COPY docker/entrypoint.sh /app/docker/entrypoint.sh
RUN chmod +x /app/docker/entrypoint.sh

USER node

EXPOSE 3001

ENTRYPOINT ["sh", "/app/docker/entrypoint.sh"]
