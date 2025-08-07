# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server with turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

### Package Management
Project uses npm with lock files for both npm (`package-lock.json`) and pnpm (`pnpm-lock.yaml`). Use npm commands by default.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 RC with Radix UI components and Tailwind CSS
- **Authentication**: Dual setup with Supabase Auth (primary) and Firebase Auth (secondary/commented)
- **Database**: Supabase with TypeScript type generation
- **Payments**: Razorpay integration
- **E-commerce**: WooCommerce REST API integration
- **State Management**: React Context (AuthContext)
- **Forms**: React Hook Form with Zod validation
- **Monitoring**: Sentry error tracking

### Project Structure

#### App Router Structure
- `(Public)/` - Public pages (landing page)
- `(user-panel)/` - User dashboard and authenticated pages
  - `/dashboard` - Main user dashboard
  - `/projects` - User's projects with dynamic [id] routes
  - `/profile`, `/referrals`, `/settings` - User management pages
- `(adminpanel)/` - Admin-only pages
  - `/admin` - Admin dashboard with user and project management
- `api/` - API routes for payments (createOrder, verifyOrder)
- `auth/` - Authentication callbacks and confirmations
- `login/` - Login page with Google Sign-in

#### Component Organization
- `components/ui/` - Reusable UI components (Radix UI + Tailwind)
- `components/layouts/` - Layout components (Navbar, Sidebar, UserNav)
- `components/dashboard/` - Dashboard-specific components
- `components/admin/` - Admin panel components
- `components/projects/` - Project-related components with delivery management
- `components/payment/` - Razorpay payment integration

### Authentication & Authorization

#### Primary: Supabase Auth
- Client setup in `src/lib/supabase.ts`
- Server-side middleware in `src/utils/supabase/middleware.ts`
- Protected routes via middleware that redirects unauthenticated users to `/login`
- Role-based access with `UserRole` type: "user" | "admin" | "moderator"

#### Secondary: Firebase (Mostly Commented)
- Configuration exists in `src/lib/firebase.ts` but appears to be transitioning away from Firebase
- When working with auth, focus on Supabase implementation

#### Middleware Protection
- All routes except `/login` and `/auth/*` require authentication
- Middleware handles session management and redirects automatically

### Key Features
- **Multi-role System**: User, admin, and moderator roles with different navigation
- **Project Management**: Projects with delivery tracking and metrics
- **Payment Processing**: Razorpay integration for order creation and verification
- **Referral System**: User referral tracking and management
- **WooCommerce Integration**: E-commerce functionality via REST API

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- Firebase environment variables (if enabling Firebase features)
- Razorpay keys for payment processing
- WooCommerce API credentials

### Development Notes
- Uses TypeScript throughout with strict type checking
- Tailwind CSS with custom component library
- Image optimization configured for Google user avatars
- Error boundary implementation for project components
- Toast notifications via Sonner
- Form validation using Zod schemas
- Role-based component rendering with `RoleBasedComponent`

### Navigation Structure
Navigation is role-based and configured in `src/config/navigation.ts`:
- **User Navigation**: Dashboard, Projects, Referrals, Earnings, Team, Settings
- **Admin Navigation**: Admin Dashboard, User Management, Projects Overview, System Logs, Security, Settings