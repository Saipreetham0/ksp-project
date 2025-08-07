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
- **Authentication**: Supabase Auth with enhanced role system
- **Database**: Supabase PostgreSQL with comprehensive schema
- **Payments**: Razorpay + Zoho Payments integration
- **Invoicing**: Zoho Invoice API integration with PDF generation
- **File Storage**: Supabase Storage for attachments
- **State Management**: React Context with enhanced auth state
- **Forms**: React Hook Form with Zod validation
- **Monitoring**: Activity logging and notification system

### Enhanced Project Structure

#### App Router Structure
- `(Public)/` - Public landing pages
- `(user-panel)/` - Standard user dashboard
  - `/dashboard` - User dashboard with notifications
  - `/projects` - User's orders/projects
  - `/referrals`, `/settings` - User management
- `(adminpanel)/` - Admin interface
  - `/admin` - Admin dashboard with comprehensive analytics
  - `/admin/orders` - Complete order management
  - `/admin/users` - User and role management
  - `/admin/invoices` - Invoice management
  - `/admin/tasks` - Task management system

#### API Structure
- `api/orders/` - Enhanced order management with full CRUD
- `api/invoices/` - Invoice generation, PDF, email sending
- `api/tasks/` - Task management with assignment and tracking
- `api/notifications/` - Notification system
- `api/attachments/` - File upload and management

#### Component Organization
- `components/ui/` - Radix UI components with Tailwind
- `components/layouts/` - Enhanced layouts with role-based navigation
- `components/orders/` - Complete order management components
- `components/invoices/` - Invoice creation, viewing, and management
- `components/tasks/` - Kanban board and task management
- `components/notifications/` - Notification center and alerts
- `components/attachments/` - File upload and management

### Enhanced Authentication & Authorization

#### Supabase Auth with Role System
- Enhanced user profiles with granular permissions
- Six role types: admin, finance, team_lead, moderator, user, client
- Role-based route protection and component access
- Permission-based API access control

#### Role Hierarchy (highest to lowest):
1. **Admin** (100) - Full system access
2. **Finance** (80) - Invoice, payment, financial reports
3. **Team Lead** (70) - Task management, team coordination
4. **Moderator** (60) - Order management, content moderation
5. **User** (40) - Standard user, can create orders
6. **Client** (20) - View-only access to own orders/invoices

#### Enhanced Features
- Row-level security policies in database
- Activity logging for all actions
- Real-time notifications
- File attachment system with access control

### Complete Feature Set (PRD Compliant)

#### 1. Orders Module ✅
- Full order lifecycle: Draft → Processing → Shipped → Delivered → Completed
- Team member assignment and collaboration
- File attachments (documents, images, etc.)
- Delivery address and tracking
- Order status management with notifications

#### 2. Invoice Module ✅
- Zoho Invoice API integration
- Automatic invoice generation from orders
- PDF generation and download
- Email sending capabilities
- Payment status linking and tracking
- Manual and recurring invoice creation

#### 3. Task Management ✅
- Kanban board interface (To-Do → In Progress → Review → Done)
- Task assignment with due dates and priorities
- Progress tracking and time estimation
- Task dependencies and relationships
- Team productivity analytics

#### 4. Payment Processing ✅
- Razorpay integration (existing)
- Payment recording and verification
- Due date reminders
- Payment history and analytics
- Integration with invoice system

#### 5. User Management ✅
- Enhanced role-based access control
- User invitation system (ready for email integration)
- Activity logging and audit trails
- Permission management interface

#### 6. File Management ✅
- Supabase Storage integration
- File attachments for orders, tasks, invoices
- Access level control (private, team, public)
- Multiple file type support (images, PDFs, documents)

#### 7. Notification System ✅
- Real-time in-app notifications
- Email notifications (infrastructure ready)
- Activity-based automatic notifications
- Notification center with filtering

#### 8. Dashboard & Analytics ✅
- Role-based dashboard views
- Order metrics and analytics
- Task completion tracking
- Revenue and payment analytics
- User activity monitoring

### Database Schema

Comprehensive database with 8+ tables:
- `orders` - Enhanced order management
- `invoices` - Invoice tracking with Zoho integration
- `tasks` - Task management with assignment
- `notifications` - Notification system
- `user_profiles` - Enhanced user management
- `attachments` - File storage and access control
- `activity_logs` - Audit trail system
- Row-level security policies for data protection

### Environment Variables Required

#### Core System
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

#### Zoho Integration
- `ZOHO_INVOICE_CLIENT_ID` - Zoho Invoice API client ID
- `ZOHO_INVOICE_CLIENT_SECRET` - Zoho Invoice API secret
- `ZOHO_INVOICE_REFRESH_TOKEN` - Refresh token for API access
- `ZOHO_ORGANIZATION_ID` - Zoho organization ID

#### Payment Processing
- Razorpay keys (existing setup)

### Development & Deployment Notes

#### Migration Process
- Full database migration script provided in `database-schema.sql`
- Migration guide in `DATABASE_MIGRATION.md`
- Backward compatibility maintained for existing features

#### Testing
- All API endpoints implement proper error handling
- Role-based access control tested
- File upload security measures in place
- Activity logging for debugging and auditing

#### Production Readiness
- Build process verified and optimized
- ESLint configuration updated for new codebase
- Environment variable validation
- Comprehensive error handling and user feedback

### Key Implementation Files

#### Database & Types
- `database-schema.sql` - Complete database schema
- `src/types/database.ts` - Comprehensive TypeScript types
- `src/types/auth.ts` - Enhanced authentication types

#### Core Systems
- `src/lib/zoho-invoice.ts` - Zoho API integration
- `src/lib/enhanced-roles.ts` - Role management system
- `src/utils/supabase/` - Supabase client configurations

#### Feature Modules
- `src/app/api/orders/` - Order management APIs
- `src/app/api/invoices/` - Invoice system APIs
- `src/app/api/tasks/` - Task management APIs
- `src/components/orders/` - Order management UI
- `src/components/tasks/TaskBoard.tsx` - Kanban interface
- `src/components/notifications/NotificationCenter.tsx` - Notification UI

The system now fully implements the PRD requirements with a production-ready, scalable architecture supporting complete project and order lifecycle management.