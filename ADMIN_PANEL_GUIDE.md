# 🔧 Admin Panel Documentation

## Overview
The ProjectX Admin Panel provides comprehensive management capabilities for your All-in-One Project & Order Management Platform. This guide covers all administrative functions and access controls.

## 🔐 Admin Access

### Getting Admin Role
By default, new users are assigned the `user` role. To become an admin:

1. **Manual Database Update** (Initial Setup):
```sql
-- In your Supabase SQL Editor
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@domain.com';
```

2. **Available Roles**:
- `admin` - Full system access
- `finance` - Financial operations and invoicing
- `team_lead` - Team and task management
- `moderator` - Content moderation and user support
- `user` - Standard user access
- `client` - Client-specific limited access

### Admin Login
1. Visit: `/login`
2. Use your enhanced authentication options:
   - **Magic Link**: Email-based passwordless login
   - **Google One Tap**: One-click Google sign-in
   - **Standard Login**: Email + password
3. After login, admin users see additional navigation options

## 📊 Admin Dashboard Features

### Navigation Menu (Admin Only)
- **Orders Management** (`/admin/orders`)
- **Invoice System** (`/admin/invoices`) 
- **Task Management** (`/admin/tasks`)
- **User Management** (`/admin/users`)
- **File Management** (`/admin/files`)
- **System Settings** (`/admin/settings`)

## 🛠️ Core Admin Functions

### 1. Orders Management (`/admin/orders`)

**Features:**
- View all orders across the system
- Filter by status, date, client, amount
- Update order status workflow:
  - Draft → Processing → Shipped → Delivered → Completed
- Assign orders to team members
- Generate invoices from orders
- Export order data

**Order Statuses:**
- `draft` - Initial order creation
- `processing` - Order being prepared
- `shipped` - Order dispatched
- `delivered` - Order received by client
- `completed` - Order fully finished
- `cancelled` - Order cancelled

**Permissions:**
- Admin: Full access to all orders
- Finance: View financial details, generate invoices
- Team Lead: Assign and manage team orders
- User: View assigned orders only

### 2. Invoice System (`/admin/invoices`)

**Features:**
- Auto-generate invoices from orders
- Manual invoice creation
- Zoho Invoice API integration
- PDF generation and download
- Send invoices via email
- Track payment status
- Invoice templates customization

**Invoice Workflow:**
1. Create from order or manually
2. Review and edit details
3. Send to client via email
4. Track payment status
5. Generate PDF receipts

**Zoho Integration Setup:**
```bash
# Add to .env.local
ZOHO_INVOICE_CLIENT_ID=your_client_id
ZOHO_INVOICE_CLIENT_SECRET=your_secret
ZOHO_INVOICE_REFRESH_TOKEN=your_token
ZOHO_ORGANIZATION_ID=your_org_id
```

### 3. Task Management (`/admin/tasks`)

**Features:**
- Kanban board interface
- Create and assign tasks
- Set priorities and deadlines
- Track progress across projects
- Task dependencies
- Time tracking
- File attachments to tasks

**Task Statuses:**
- `todo` - Not started
- `in_progress` - Being worked on
- `review` - Awaiting review
- `done` - Completed

**Task Priorities:**
- `low` - Can be done later
- `medium` - Normal priority
- `high` - Important, needs attention
- `urgent` - Critical, immediate action

### 4. User Management (`/admin/users`)

**Features:**
- View all user profiles
- Edit user roles and permissions
- Activate/deactivate users
- Reset user passwords
- View user activity logs
- Bulk user operations

**User Status Management:**
- `active` - Normal user access
- `inactive` - Temporarily disabled
- `suspended` - Access revoked

### 5. File Management (`/admin/files`)

**Features:**
- View all uploaded files
- Organize files by projects/orders
- Set file permissions
- Delete unused files
- Monitor storage usage
- Download file archives

### 6. System Settings (`/admin/settings`)

**Features:**
- Platform configuration
- Email templates
- Notification settings
- Payment gateway settings
- API key management
- Backup and maintenance

## 🔔 Notification System

### Notification Types
- Task assignments
- Order status changes
- Payment confirmations
- Invoice generation
- System alerts

### Admin Notification Controls
- Configure notification templates
- Set notification rules
- Manage email delivery
- Monitor notification logs

## 📈 Analytics & Reporting

### Available Reports
- Order performance metrics
- Revenue analytics
- Task completion rates
- User activity reports
- System usage statistics

### Export Options
- CSV export for all data tables
- PDF reports generation
- Automated email reports
- API data access

## 🔒 Security & Permissions

### Role-Based Access Control (RBAC)
- Granular permissions per role
- Feature-level access control
- Data visibility restrictions
- Action-based permissions

### Security Features
- Row Level Security (RLS) in database
- Session management
- Audit logging
- File access controls
- API rate limiting

## 🚀 Quick Start Guide

### First-Time Admin Setup
1. **Database Setup**: Use `database-schema-fixed.sql`
2. **Admin Role**: Update your user role to admin
3. **Environment Variables**: Configure API keys
4. **Storage Bucket**: Create `attachments` bucket in Supabase
5. **Test Login**: Login with enhanced auth form

### Daily Admin Tasks
1. Review new orders and assign them
2. Check task progress on Kanban board
3. Process invoice generation and delivery
4. Monitor user activity and system health
5. Respond to notifications and alerts

### Weekly Admin Tasks
1. Generate performance reports
2. Review and update user roles
3. Clean up unused files and data
4. Update system settings as needed
5. Backup critical data

## 🔧 Troubleshooting

### Common Issues

**Issue**: Can't access admin panel
- **Solution**: Check user role in database, ensure `role = 'admin'`

**Issue**: Orders not showing
- **Solution**: Check RLS policies, ensure proper database permissions

**Issue**: Invoice generation fails
- **Solution**: Verify Zoho API credentials in environment variables

**Issue**: File uploads not working
- **Solution**: Check Supabase storage bucket permissions

**Issue**: Notifications not sending
- **Solution**: Verify email configuration and SMTP settings

### Support Contacts
- **Technical Issues**: Check database logs and console errors
- **Feature Requests**: Document in GitHub issues
- **Critical Problems**: Contact system administrator

## 📚 Advanced Configuration

### Custom Role Creation
```sql
-- Create custom role with specific permissions
INSERT INTO user_profiles (id, email, role, permissions) 
VALUES (
  'user_id', 
  'custom@example.com', 
  'custom_role',
  '{"orders": ["read", "create"], "tasks": ["read"]}'
);
```

### API Integration
- REST API endpoints available for all admin functions
- Webhook support for external integrations
- Real-time data sync capabilities

### Performance Optimization
- Database indexing for large datasets
- Caching for frequently accessed data
- Background job processing for heavy operations

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Support**: Check QUICK_SETUP.md for additional troubleshooting

---

## Quick Reference Commands

```bash
# Check admin role
SELECT email, role FROM user_profiles WHERE role = 'admin';

# Reset user password (in admin panel)
UPDATE auth.users SET encrypted_password = crypt('new_password', gen_salt('bf'));

# View system activity
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
```

Your admin panel is now fully configured and ready for production use! 🎉