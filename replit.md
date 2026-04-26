# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **paikari** (`/`) — পাইকারি69bd.com, a mobile-first Bangla-first wholesale ecommerce app for Bangladesh. React + Vite + TypeScript + Tailwind. Customer storefront (home, categories, search, product detail with tier pricing, cart, BD checkout with bKash/Nagad/Rocket/Bank/COD, OTP auth, account+orders) and a full admin control panel under `/admin` with a navy sidebar layout: Dashboard (8 KPI cards + recent orders + low stock), Orders, Products CRUD, Inventory (stock in/out/damaged/adjust + log), Reviews (approve/reject/feature), Payments (UddoktaPay gateway + manual numbers + transaction log), SMS (provider config + 6 templates + send-test + log), Roles (4 roles with members).
- **api-server** (`/api`) — Express 5 backend serving the catalog, orders, OTP auth, and admin endpoints. JSON file storage at `data/store.json` (seeded with 16 wholesale products across 8 categories + sample reviews + default settings on first run). Admin endpoints split into `routes/admin.ts` (legacy stats/products/orders) and `routes/adminPlus.ts` (dashboard, reviews, inventory, settings, sms, transactions, order notes).

API surface is defined in `lib/api-spec/openapi.yaml`; React Query hooks and Zod schemas are generated to `lib/api-client-react` and `lib/api-zod`.
