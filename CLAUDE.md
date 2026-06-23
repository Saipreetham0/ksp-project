# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — dev server (Next.js with `--turbopack`)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (`next lint`)

There is no test runner configured in this repo — there are no test files and no `test` script.

### Package management
Both `package-lock.json` and `pnpm-lock.yaml` are committed. `pnpm-workspace.yaml` exists but this is a single-package repo. Default to `npm`. React/React-DOM are pinned to a 19 RC build, and `@types/react`/`@types/react-dom` are remapped via `overrides` to RC type packages — keep those overrides intact when touching dependencies or installs will break type-checking.

## Architecture

Next.js 15 App Router + React 19 RC, TypeScript, Tailwind, Radix UI. Path alias `@/*` → `src/*`.

### Authentication & middleware (the important part)
Auth is **Supabase Auth** (the project was migrated from Firebase in commit `eda6b9c`; large blocks of commented-out Firebase code still litter files like `src/middlewares/withAuth.ts` and `src/app/middleware.ts` — ignore them).

Three Supabase client entry points, do not mix them up:
- `src/utils/supabase/client.ts` — browser singleton (`createClient()`), use in Client Components.
- `src/utils/supabase/server.ts` — async server client backed by `next/headers` cookies, use in Server Components, Route Handlers, and Server Actions (`await createClient()`).
- `src/utils/supabase/middleware.ts` — `updateSession()`, refreshes the auth cookie on every request.

The active Next.js middleware lives at **`src/app/middleware.ts`** (not the conventional `src/middleware.ts`), and it just delegates to `updateSession()`. That function does coarse route gating: it redirects unauthenticated users away from paths prefixed `/dashboard`, `/admin`, `/user-panel`, `/private`, `/adminpanel`, and redirects authenticated users off `/login`. It does **not** enforce roles.

### Authorization (roles)
There are **two parallel role systems** — be deliberate about which you use:
- Legacy 3-role (`user`/`moderator`/`admin`): `src/lib/roles.ts`.
- Current 6-role: `src/types/auth.ts` defines `UserRole`, `ROLE_HIERARCHY` (admin 100, finance 80, team_lead 70, moderator 60, user 40, client 20), `DEFAULT_PERMISSIONS`, `canAccessRole`, and `hasPermission`. Prefer this system (the `src/types/auth.ts` helpers) for new code.

Authorization is **enforced per-route, not centrally**. API route handlers call `supabase.auth.getUser()`, then read the user's `role`/`permissions` from the `user_profiles` table and branch inline (e.g. clients/users are scoped to their own `user_id`, while admin/finance/team_lead see all). The expectation is that Supabase Row-Level Security backs this up at the DB layer. When adding an endpoint, replicate this pattern — auth check → load profile → role/ownership filter.

`AuthProvider` (`src/app/context/AuthContext.tsx`, consumed via `useAuth()`) only exposes the raw Supabase `user` and a `loading` flag; it blocks rendering children until the session resolves. Role/permission hooks live in `src/hooks/` (`useRole`, `useAuth`, `useAuthSession`).

### Routing layout
App Router with route groups: `(Public)`, `(user-panel)`, `(adminpanel)`. Note that many top-level feature folders (`src/app/orders`, `/invoices`, `/tasks`, `/payments`, `/users`, `/reports`, `/files`, `/submit`, `/dashboard`) sit **outside** the route groups in addition to the grouped versions — there is overlap/duplication between e.g. `src/app/orders` and `src/app/(adminpanel)/admin/orders`. Check both when locating a page.

API route handlers live under `src/app/api/**/route.ts`: `orders`, `invoices` (incl. `[id]/pdf`, `[id]/send`, `send`), `tasks`, `notifications`, `attachments`, plus Razorpay `createOrder`/`verifyOrder`.

### Integrations
- **Payments**: Razorpay (`razorpay` SDK; `api/createOrder` + `api/verifyOrder`). Keys: `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_SECRET_ID`. UPI display via `NEXT_PUBLIC_UPI_ID`.
- **Invoicing / Zoho**: `src/lib/zoho-invoice.ts` and `src/lib/zoho-integration.ts`. Note the Zoho env vars referenced in code are **not** present in the committed `.env` — Zoho features will be inert without them.
- **WooCommerce**: `src/lib/woocommerce.ts` (`WOOCOMMERCE_*`, `NEXT_PUBLIC_WORDPRESS_SITE_URL`).
- **Monitoring**: Sentry (`@sentry/nextjs`) is a dependency.
- Drag-and-drop (Kanban) uses `@hello-pangea/dnd`; charts use `recharts`; forms use React Hook Form + Zod.

### Database schema — caution
There are **six** overlapping SQL files at the repo root: `database-schema.sql`, `database-schema-fixed.sql`, and `supabase-{complete,corrected,fixed,minimal-migration}-schema.sql`. They are not consistent with each other. Before relying on any of them, confirm which one matches the live Supabase project rather than assuming the schema docs in this file. Core tables referenced by code: `user_profiles`, `orders`, `invoices`, `tasks`, `notifications`, `attachments`, `activity_logs`. TypeScript shapes live in `src/types/database.ts`.

### Config notes
- `next.config.ts` uses CommonJS `module.exports` despite the `.ts` extension; it only configures remote image hosts (`lh3.googleusercontent.com`, `gstatic.com`).
- ESLint (`.eslintrc.json`) downgrades `no-explicit-any`, `no-unused-vars` (ignores `_`-prefixed args), and `react-hooks/exhaustive-deps` to **warnings**, so `npm run lint` passing does not guarantee these are clean.

## Other docs
`ADMIN_PANEL_GUIDE.md`, `DATABASE_MIGRATION.md`, `DEPLOYMENT.md`, `QUICK_SETUP.md`, `FEATURE_GAP_ANALYSIS.md`, and `project-order-management-platform.md` (the PRD) exist but predate parts of the current code — treat them as background, verify against source.
