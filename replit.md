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

- **paikari** (`/`) — পাইকারি69bd.com, a mobile-first Bangla-first wholesale ecommerce app for Bangladesh. React + Vite + TypeScript + Tailwind. Customer storefront: home (with featured reviews carousel + WhatsApp CTA), categories, search, product detail with tier pricing, cart, BD checkout with bKash/Nagad sandbox flow + Rocket/Bank/COD, OTP auth, full account hub (`/account/:tab` — profile, orders, addresses, wishlist, notifications), wishlist (`/wishlist` with guest localStorage→sync-on-login), product cards with heart toggle. Facebook Pixel + WhatsApp click tracking gated by admin toggles. WhatsApp auto-order CTAs prefill cart messages to the merchant number. Admin control panel under `/admin` with navy sidebar: Dashboard, Orders (search + status/payment filters + drawer with payment-status update + internal notes UI), Products CRUD, Inventory, Reviews (approve/reject/feature), Users (search + status filter + VIP), Payments, SMS, Storefront (Pixel ID + tracking toggles + WhatsApp/merchant numbers + FB page URL + GA ID), Roles.
- **api-server** (`/api`) — Express 5 backend serving the catalog, orders, OTP auth, accounts, payments, and admin endpoints. JSON file storage at `data/store.json` (seeded with 16 wholesale products across 8 categories + sample reviews + default storefront settings on first run). Routes: `routes/admin.ts` + `routes/adminPlus.ts` (dashboard, reviews, inventory, settings, sms, transactions, order notes, payment-status, featured reviews, storefront settings PUT), `routes/account.ts` (profile/addresses/wishlist/notifications), `routes/payments.ts` (bKash Create/Execute, Nagad Initialize/Complete sandbox), `routes/adminUsers.ts` (list/search/VIP).

API surface is defined in `lib/api-spec/openapi.yaml`; React Query hooks and Zod schemas are generated to `lib/api-client-react` and `lib/api-zod`.
