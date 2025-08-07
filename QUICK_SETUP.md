# 🚀 Quick Setup Guide

## Fix for Database Error

The error you encountered (`relation "order_seq" does not exist`) has been fixed! 

## Step-by-Step Setup

### 1. **Database Setup** (5 minutes)

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. **Delete the old schema file** and use the new one:
   - Use `database-schema-fixed.sql` instead of `database-schema.sql`
3. **Copy and paste the entire contents** of `database-schema-fixed.sql`
4. **Click "Run"** 

✅ You should see success messages like:
```
✅ Database schema created successfully!
📊 Tables created: orders, invoices, tasks, notifications, user_profiles, attachments, activity_logs
🔒 Row-level security policies applied
📈 Performance indexes created
🎉 Ready for production!
```

### 2. **Supabase Storage Setup** (2 minutes)

1. Go to **Supabase Dashboard** → **Storage**
2. **Create a new bucket** called `attachments`
3. Make it **public** if you want public file access
4. Done! ✅

### 3. **Environment Variables** (2 minutes)

Add these to your `.env.local` file:

```bash
# Core (you already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Zoho Integration (optional - add later)
ZOHO_INVOICE_CLIENT_ID=your_client_id
ZOHO_INVOICE_CLIENT_SECRET=your_secret  
ZOHO_INVOICE_REFRESH_TOKEN=your_token
ZOHO_ORGANIZATION_ID=your_org_id

# Payment (you already have these)
# Your existing Razorpay keys
```

### 4. **Test the Setup** (3 minutes)

```bash
npm run build
npm run dev
```

Visit your app and:
- ✅ Login should work 
- ✅ Dashboard should load
- ✅ No database errors

## What's New After Setup

### **Enhanced Features Available:**

1. **📋 Orders Module**
   - Visit `/admin/orders` (if admin) or create new orders
   - Full workflow: Draft → Processing → Shipped → Delivered → Completed

2. **💰 Invoice System**
   - Auto-generate invoices from orders
   - PDF download capabilities
   - Zoho integration (when API keys added)

3. **✅ Task Management**
   - Kanban board interface
   - Assign tasks to team members
   - Track progress and deadlines

4. **📎 File Attachments**
   - Upload files to orders, tasks, invoices
   - Drag & drop interface

5. **🔔 Notifications**
   - Real-time notification center
   - Activity tracking

6. **👥 Enhanced Roles**
   - 6 role types: Admin, Finance, Team Lead, Moderator, User, Client
   - Granular permissions

## Troubleshooting

### If you see errors:

**❌ "relation does not exist"**
- Use `database-schema-fixed.sql` instead of the old file
- Make sure you run the entire script at once

**❌ Build errors**
- Run `npm run build` to check for issues
- Check that all imports are working

**❌ Permission errors**  
- Make sure user profiles are created in the database
- Check that RLS policies are applied

## Quick Commands

```bash
# Check if everything is working
npm run build

# Start development
npm run dev

# Check database (in Supabase SQL Editor)
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

## Next Steps

1. **Add your first admin user** (in Supabase SQL Editor):
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@domain.com';
```

2. **Test key features**:
   - Create an order
   - Generate an invoice  
   - Create a task
   - Upload a file

3. **Set up Zoho** (optional):
   - Get Zoho API credentials
   - Add environment variables
   - Test invoice generation

You're all set! 🎉

**The database error is now fixed - use `database-schema-fixed.sql` and you should have no issues.**