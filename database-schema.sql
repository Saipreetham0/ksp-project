-- Enhanced Database Schema for Project & Order Management Platform
-- Run these SQL commands in your Supabase SQL Editor

-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- 1. Enhanced Orders Table (evolution of projects table)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('order_seq')::TEXT, 4, '0'),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- mini, major, custom
  technology VARCHAR(255),
  timeline INTEGER, -- in days
  team_size INTEGER,
  amount DECIMAL(10,2) DEFAULT 0,
  
  -- Enhanced order-specific fields
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded')),
  delivery_status VARCHAR(50) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'in_transit', 'delivered', 'not_applicable')),
  
  -- Team and attachments
  team_members JSONB DEFAULT '[]'::JSONB, -- Array of user IDs assigned to this order
  attachments JSONB DEFAULT '[]'::JSONB, -- Array of file attachments
  metadata JSONB DEFAULT '{}'::JSONB, -- Additional order metadata
  
  -- Delivery information
  delivery_address JSONB, -- Delivery address if applicable
  estimated_delivery DATE,
  actual_delivery DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT orders_amount_positive CHECK (amount >= 0)
);

-- 2. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'INV-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('invoice_seq')::TEXT, 4, '0'),
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Zoho Integration fields
  zoho_invoice_id VARCHAR(100), -- Zoho Invoice ID
  zoho_organization_id VARCHAR(100),
  
  -- Invoice details
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Invoice status and dates
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  invoice_date DATE DEFAULT CURRENT_DATE,
  paid_date DATE,
  
  -- Files and communications
  pdf_url VARCHAR(500), -- URL to PDF file
  pdf_file_path VARCHAR(500), -- Local file path if stored locally
  sent_emails JSONB DEFAULT '[]'::JSONB, -- Track email communications
  
  -- Customer information
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  billing_address JSONB,
  
  -- Line items
  line_items JSONB NOT NULL DEFAULT '[]'::JSONB,
  
  -- Notes and metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT invoices_amount_positive CHECK (amount >= 0 AND total_amount >= 0)
);

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Task details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
  
  -- Assignment and timing
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  due_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  
  -- Task metadata
  tags JSONB DEFAULT '[]'::JSONB,
  attachments JSONB DEFAULT '[]'::JSONB,
  dependencies JSONB DEFAULT '[]'::JSONB, -- Array of task IDs this task depends on
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completion_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'task', 'payment', 'order', 'invoice')),
  
  -- Status and metadata
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Related entities
  related_order_id INTEGER REFERENCES orders(id),
  related_task_id INTEGER REFERENCES tasks(id),
  related_invoice_id INTEGER REFERENCES invoices(id),
  
  -- Delivery channels
  email_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  push_sent BOOLEAN DEFAULT FALSE,
  
  -- Action data
  action_url VARCHAR(500), -- URL for action button
  action_label VARCHAR(100), -- Label for action button
  
  metadata JSONB DEFAULT '{}'::JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enhanced User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  
  -- Enhanced role system
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator', 'finance', 'client', 'team_lead')),
  permissions JSONB DEFAULT '{}'::JSONB, -- Granular permissions
  
  -- Contact information
  phone_number VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Organization info
  organization VARCHAR(255),
  department VARCHAR(100),
  position VARCHAR(100),
  
  -- Preferences
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  language VARCHAR(10) DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "push": true,
    "sms": false,
    "task_assigned": true,
    "payment_received": true,
    "order_status_changed": true,
    "invoice_sent": true
  }'::JSONB,
  
  -- Status and metadata
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. File Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  
  -- File information
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500), -- Public URL if applicable
  file_size INTEGER NOT NULL, -- Size in bytes
  mime_type VARCHAR(100) NOT NULL,
  
  -- Storage information
  storage_provider VARCHAR(50) DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 's3', 'cloudinary', 'local')),
  bucket_name VARCHAR(100),
  
  -- Ownership and access
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  access_level VARCHAR(20) DEFAULT 'private' CHECK (access_level IN ('public', 'private', 'team', 'organization')),
  
  -- Related entities
  related_order_id INTEGER REFERENCES orders(id),
  related_task_id INTEGER REFERENCES tasks(id),
  related_invoice_id INTEGER REFERENCES invoices(id),
  
  -- Metadata
  description TEXT,
  tags JSONB DEFAULT '[]'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Activity Log Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  
  -- Actor information
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  
  -- Activity details
  action VARCHAR(100) NOT NULL, -- created, updated, deleted, sent, etc.
  entity_type VARCHAR(50) NOT NULL, -- order, invoice, task, user, etc.
  entity_id INTEGER,
  
  -- Changes tracking
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

CREATE INDEX IF NOT EXISTS idx_tasks_order_id ON tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_attachments_related_order ON attachments(related_order_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);

-- Create Row Level Security Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own orders" ON orders FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'finance'))
);

-- Invoices policies
CREATE POLICY "Users can view invoices for their orders" ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = invoices.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Finance users can manage all invoices" ON invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'finance'))
);

-- Tasks policies
CREATE POLICY "Users can view tasks assigned to them or their orders" ON tasks FOR SELECT USING (
  assigned_to = auth.uid() OR 
  EXISTS (SELECT 1 FROM orders WHERE orders.id = tasks.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Team members can manage tasks" ON tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead'))
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();