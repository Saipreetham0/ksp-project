# Database Migration Guide

## Overview
This guide helps you migrate from the basic project management system to the enhanced All-in-One Project & Order Management Platform with full PRD compliance.

## Pre-Migration Checklist

- [ ] **Backup existing data** - Create a full database backup
- [ ] **Test environment setup** - Deploy to staging first
- [ ] **Environment variables configured** - Set up Zoho API credentials
- [ ] **Supabase Storage bucket created** - For file attachments

## Migration Steps

### Step 1: Database Schema Migration

Execute the SQL commands in `database-schema.sql` in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard > SQL Editor
# Copy and paste the contents of database-schema.sql
# Execute the entire script
```

### Step 2: Data Migration

```sql
-- Migrate existing projects to orders table
INSERT INTO orders (
  user_id, title, description, type, technology, timeline, team_size, 
  amount, status, payment_status, delivery_status, created_at, updated_at
)
SELECT 
  user_id,
  title,
  description,
  type,
  technology,
  timeline,
  team_size,
  amount,
  CASE 
    WHEN status = 'pending' THEN 'draft'
    WHEN status = 'approved' THEN 'processing'
    WHEN status = 'completed' THEN 'completed'
    ELSE 'draft'
  END as status,
  CASE 
    WHEN payment_status = 'paid' THEN 'paid'
    WHEN payment_status = 'pending' THEN 'pending'
    ELSE 'pending'
  END as payment_status,
  'pending' as delivery_status,
  created_at,
  NOW() as updated_at
FROM projects
WHERE id IS NOT NULL;

-- Create user profiles for existing users
INSERT INTO user_profiles (
  id, email, full_name, role, status, created_at, updated_at
)
SELECT DISTINCT
  auth.users.id,
  auth.users.email,
  COALESCE(auth.users.raw_user_meta_data->>'full_name', auth.users.email) as full_name,
  'user' as role,
  'active' as status,
  auth.users.created_at,
  NOW() as updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;

-- Set admin role for specific users (replace with actual admin emails)
UPDATE user_profiles 
SET role = 'admin', permissions = '{"orders_view_all": true, "orders_create": true, "orders_update_all": true, "invoices_view_all": true, "invoices_create": true, "users_view_all": true, "users_update_roles": true}'
WHERE email IN ('admin@yourdomain.com', 'your-email@domain.com');
```

### Step 3: Environment Variables

Add these to your `.env.local` file:

```bash
# Zoho Invoice Integration
ZOHO_INVOICE_CLIENT_ID=your_zoho_client_id
ZOHO_INVOICE_CLIENT_SECRET=your_zoho_client_secret
ZOHO_INVOICE_REFRESH_TOKEN=your_refresh_token
ZOHO_ORGANIZATION_ID=your_organization_id

# Zoho Payments (optional)
ZOHO_PAYMENT_CLIENT_ID=your_payment_client_id
ZOHO_PAYMENT_CLIENT_SECRET=your_payment_secret
```

### Step 4: Supabase Storage Setup

1. Go to Supabase Dashboard > Storage
2. Create a new bucket called `attachments`
3. Set the bucket to public if you want public file access
4. Configure Row Level Security policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Allow users to view their own files and public files
CREATE POLICY "Users can view allowed attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM attachments 
      WHERE attachments.file_path = name 
      AND attachments.access_level = 'public'
    )
  )
);
```

### Step 5: Update Navigation

Update your navigation configuration to use the new enhanced roles:

```typescript
// In your navigation components, import the new role system
import { getRoleNavigation } from '@/lib/enhanced-roles';

// Use role-based navigation
const navigation = getRoleNavigation(userRole);
```

## Post-Migration Tasks

### 1. User Role Assignment

Manually assign roles to existing users:

```sql
-- Set finance role
UPDATE user_profiles 
SET role = 'finance', permissions = '{"orders_view_all": true, "invoices_view_all": true, "invoices_create": true, "payments_view_all": true, "payments_record": true}'
WHERE email IN ('finance@yourdomain.com');

-- Set team lead role
UPDATE user_profiles 
SET role = 'team_lead', permissions = '{"orders_view_all": true, "tasks_view_all": true, "tasks_assign": true, "users_view_all": true}'
WHERE email IN ('teamlead@yourdomain.com');
```

### 2. Create Initial Notifications

```sql
-- Welcome notification for all users
INSERT INTO notifications (user_id, title, message, type)
SELECT 
  id,
  'Welcome to the Enhanced Platform!',
  'We have upgraded our platform with new features including task management, invoice generation, and file attachments.',
  'info'
FROM user_profiles;
```

### 3. Test Critical Features

- [ ] **Order Creation**: Create a new order and verify workflow
- [ ] **Invoice Generation**: Generate an invoice for an order
- [ ] **Task Assignment**: Create and assign tasks
- [ ] **File Upload**: Upload attachments to orders/tasks
- [ ] **Notifications**: Verify notifications are working
- [ ] **Role Access**: Test different user roles

### 4. Performance Optimization

```sql
-- Create additional indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attachments_related_entities ON attachments(related_order_id, related_task_id, related_invoice_id);
```

## Rollback Plan

If migration fails, restore from backup:

1. Drop new tables:
```sql
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
```

2. Restore from backup
3. Investigate issues and retry migration

## Verification Queries

```sql
-- Check migration success
SELECT 'orders' as table_name, COUNT(*) as count FROM orders
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles;

-- Check role distribution
SELECT role, COUNT(*) as count 
FROM user_profiles 
GROUP BY role;

-- Check order status distribution
SELECT status, COUNT(*) as count 
FROM orders 
GROUP BY status;
```

## Support

If you encounter issues during migration:

1. Check Supabase logs for errors
2. Verify environment variables are set correctly
3. Ensure all required packages are installed
4. Test API endpoints manually
5. Check browser console for client-side errors

## New Features Available After Migration

1. **Enhanced Order Management**
   - Full order lifecycle (Draft → Processing → Shipped → Delivered → Completed)
   - Team member assignment
   - File attachments
   - Delivery tracking

2. **Invoice Management**
   - Zoho Invoice integration
   - Automatic invoice generation
   - PDF download and email sending
   - Payment status tracking

3. **Task Management**
   - Kanban board interface
   - Task assignment and tracking
   - Progress monitoring
   - Due date management

4. **File Attachments**
   - Upload files to orders, tasks, and invoices
   - Access control (private, team, public)
   - Multiple file type support

5. **Notification System**
   - Real-time notifications
   - Email notifications (when configured)
   - Activity tracking

6. **Enhanced User Roles**
   - Finance role for invoice management
   - Team Lead role for project management
   - Client role for limited access
   - Granular permission system

Migration completed successfully! 🎉