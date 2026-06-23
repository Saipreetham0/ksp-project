-- ============================================================================
-- KSP ELECTRONICS - COMPLETE DATABASE SCHEMA
-- All-in-One Project & Order Management Platform
-- Uses user_id consistently throughout (NO client_id)
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CREATE SEQUENCES
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS task_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS payment_number_seq START 1000;

-- ============================================================================
-- 1. USER PROFILES TABLE
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  display_name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Role System
  role VARCHAR(50) NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'team_member', 'finance', 'client')),
  permissions JSONB DEFAULT '[]'::JSONB,
  
  -- Organization Details
  company VARCHAR(255),
  department VARCHAR(100),
  position VARCHAR(100),
  bio TEXT,
  
  -- Settings
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  
  -- Notification Preferences
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "push": true,
    "order_updates": true,
    "payment_alerts": true,
    "task_assignments": true,
    "invoice_reminders": true
  }'::JSONB,
  
  -- Status & Activity
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. ORDERS TABLE (Main Projects/Orders)
-- ============================================================================
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'ORD-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0'),
  
  -- Client Information (using user_id consistently)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Order Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'custom', -- mini, major, custom
  technology VARCHAR(255),
  
  -- Project Details
  project_type VARCHAR(50),
  complexity_level VARCHAR(20) DEFAULT 'medium' CHECK (complexity_level IN ('simple', 'medium', 'complex')),
  timeline INTEGER, -- in days
  timeline_days INTEGER,
  team_size INTEGER,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  primary_assignee UUID REFERENCES auth.users(id),
  team_members UUID[] DEFAULT '{}',
  assigned_team_members UUID[] DEFAULT '{}',
  
  -- Status Management
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'advance_paid', 'partially_paid', 'fully_paid', 'paid', 'overdue', 'refunded')),
  delivery_status VARCHAR(50) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'in_transit', 'delivered', 'not_applicable')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Financial Information
  amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  order_value DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Time Tracking
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Important Dates
  order_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  start_date DATE,
  estimated_delivery DATE,
  actual_delivery DATE,
  completed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Content & Metadata
  requirements TEXT,
  deliverables TEXT,
  client_feedback TEXT,
  internal_notes TEXT,
  notes TEXT,
  tags JSONB DEFAULT '[]'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  attachments JSONB DEFAULT '[]'::JSONB,
  
  -- Delivery Information
  delivery_address JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT orders_amount_positive CHECK (amount >= 0),
  CONSTRAINT orders_total_amount_positive CHECK (total_amount >= 0)
);

-- ============================================================================
-- 3. TASKS TABLE
-- ============================================================================
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  task_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'TSK-' || LPAD(nextval('task_number_seq')::TEXT, 6, '0'),
  
  -- Task Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Task Status
  status VARCHAR(30) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Time Tracking
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2) DEFAULT 0,
  due_date DATE,
  
  -- Progress
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completion_notes TEXT,
  
  -- Task Relationships
  parent_task_id BIGINT REFERENCES tasks(id),
  dependencies BIGINT[] DEFAULT '{}',
  
  -- Metadata
  tags JSONB DEFAULT '[]'::JSONB,
  attachments JSONB DEFAULT '[]'::JSONB,
  
  -- Timestamps
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. INVOICES TABLE
-- ============================================================================
CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'INV-' || LPAD(nextval('invoice_number_seq')::TEXT, 6, '0'),
  
  -- Client Information (using user_id consistently)
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id BIGINT REFERENCES orders(id),
  
  -- Invoice Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Financial Information
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  tax_percentage DECIMAL(5,2) DEFAULT 18.00,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Invoice Items
  line_items JSONB DEFAULT '[]'::JSONB,
  
  -- Status
  status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'
  )),
  
  -- Important Dates
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Zoho Integration
  zoho_invoice_id VARCHAR(100),
  zoho_status VARCHAR(50),
  zoho_permalink TEXT,
  
  -- Payment Information
  payment_terms VARCHAR(100) DEFAULT 'Net 30',
  payment_method VARCHAR(50),
  
  -- Timestamps
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  payment_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'PAY-' || LPAD(nextval('payment_number_seq')::TEXT, 6, '0'),
  payment_id VARCHAR(50) UNIQUE NOT NULL DEFAULT 'PAY-' || LPAD(nextval('payment_number_seq')::TEXT, 6, '0'),
  
  -- Related Records (using user_id consistently)
  invoice_id BIGINT REFERENCES invoices(id),
  order_id BIGINT REFERENCES orders(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Payment Details
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Payment Information
  method VARCHAR(50) NOT NULL CHECK (method IN (
    'cash', 'bank_transfer', 'upi', 'credit_card', 'debit_card', 
    'cheque', 'online', 'razorpay', 'payu', 'other'
  )),
  
  type VARCHAR(30) DEFAULT 'full' CHECK (type IN (
    'advance', 'partial', 'full', 'refund', 'adjustment'
  )),
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
  )),
  
  -- Payment Gateway Information
  transaction_id VARCHAR(255),
  gateway_response JSONB,
  
  -- Dates
  payment_date DATE DEFAULT CURRENT_DATE,
  processed_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  reference_number VARCHAR(100),
  
  -- Audit
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Timestamps
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. ATTACHMENTS TABLE
-- ============================================================================
CREATE TABLE attachments (
  id BIGSERIAL PRIMARY KEY,
  
  -- File Information
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  -- Storage Information
  storage_provider VARCHAR(50) DEFAULT 'supabase',
  bucket_name VARCHAR(100) DEFAULT 'attachments',
  
  -- Access Control
  access_level VARCHAR(20) DEFAULT 'private' CHECK (access_level IN ('public', 'private', 'team')),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Related Records
  related_order_id BIGINT REFERENCES orders(id),
  related_task_id BIGINT REFERENCES tasks(id),
  related_invoice_id BIGINT REFERENCES invoices(id),
  
  -- Metadata
  description TEXT,
  tags JSONB DEFAULT '[]'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Notification Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN (
    'info', 'success', 'warning', 'error', 'order', 'payment', 'task', 'invoice', 'order_updated'
  )),
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Related Records
  related_order_id BIGINT REFERENCES orders(id),
  related_task_id BIGINT REFERENCES tasks(id),
  related_invoice_id BIGINT REFERENCES invoices(id),
  related_payment_id BIGINT REFERENCES payments(id),
  
  -- Action Information
  action_url TEXT,
  action_label VARCHAR(100),
  
  -- Metadata
  data JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ============================================================================
-- 8. ACTIVITY LOGS TABLE
-- ============================================================================
CREATE TABLE activity_logs (
  id BIGSERIAL PRIMARY KEY,
  
  -- Actor
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Action Details
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NOT NULL,
  
  -- Description
  description TEXT NOT NULL,
  
  -- Data Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. SYSTEM SETTINGS TABLE
-- ============================================================================
CREATE TABLE system_settings (
  id BIGSERIAL PRIMARY KEY,
  
  -- Setting Details
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  
  -- Metadata
  category VARCHAR(50) DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- User Profiles Indexes
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Orders Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_priority ON orders(priority);
CREATE INDEX idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_due_date ON orders(due_date);

-- Tasks Indexes
CREATE INDEX idx_tasks_order_id ON tasks(order_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Invoices Indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Payments Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- Attachments Indexes
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_related_order_id ON attachments(related_order_id);
CREATE INDEX idx_attachments_related_task_id ON attachments(related_task_id);

-- Notifications Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Activity Logs Indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- System Settings Indexes
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Orders Policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Team members can view assigned orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    auth.uid() = ANY(team_members) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'team_member', 'finance')
    )
  );

CREATE POLICY "Team members can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'team_member')
    )
  );

-- Tasks Policies
CREATE POLICY "Users can view related tasks" ON tasks
  FOR SELECT USING (
    auth.uid() = assigned_to OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = tasks.order_id AND orders.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'team_member')
    )
  );

CREATE POLICY "Team can manage tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'team_member')
    ) OR
    auth.uid() = assigned_to OR
    auth.uid() = created_by
  );

-- Invoices Policies
CREATE POLICY "Users can view related invoices" ON invoices
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'finance')
    )
  );

CREATE POLICY "Finance can manage invoices" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'finance')
    )
  );

-- Payments Policies
CREATE POLICY "Users can view related payments" ON payments
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'finance')
    )
  );

CREATE POLICY "Finance can manage payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'finance')
    )
  );

-- Attachments Policies
CREATE POLICY "Users can upload attachments" ON attachments
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can view accessible attachments" ON attachments
  FOR SELECT USING (
    auth.uid() = uploaded_by OR
    access_level = 'public' OR
    (access_level = 'team' AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'team_member', 'finance')
    )) OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = attachments.related_order_id AND orders.user_id = auth.uid()
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Activity Logs Policies
CREATE POLICY "Users can view own activity" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can create activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- System Settings Policies
CREATE POLICY "Everyone can view public settings" ON system_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at 
  BEFORE UPDATE ON attachments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_order_id BIGINT DEFAULT NULL,
  p_task_id BIGINT DEFAULT NULL,
  p_invoice_id BIGINT DEFAULT NULL,
  p_payment_id BIGINT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  notification_id BIGINT;
BEGIN
  INSERT INTO notifications (
    user_id, title, message, type,
    related_order_id, related_task_id, related_invoice_id, related_payment_id,
    action_url, action_label
  ) VALUES (
    p_user_id, p_title, p_message, p_type,
    p_order_id, p_task_id, p_invoice_id, p_payment_id,
    p_action_url, p_action_label
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to setup admin profile
CREATE OR REPLACE FUNCTION setup_admin_profile(admin_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles 
  SET role = 'admin', 
      permissions = '["all"]'::JSONB,
      status = 'active'
  WHERE email = admin_email;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'User with email % not found', admin_email;
  ELSE
    RAISE NOTICE 'User % has been made admin', admin_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id BIGINT,
  p_description TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  log_id BIGINT;
BEGIN
  INSERT INTO activity_logs (
    user_id, action, entity_type, entity_id, description, old_values, new_values
  ) VALUES (
    p_user_id, p_action, p_entity_type, p_entity_id, p_description, p_old_values, p_new_values
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('company_name', '"KSP Electronics"', 'Company name', 'general', true),
  ('company_email', '"info@kspelectronics.com"', 'Company email', 'general', true),
  ('company_phone', '"+91-9876543210"', 'Company phone', 'general', true),
  ('company_address', '"Bengaluru, Karnataka, India"', 'Company address', 'general', true),
  ('default_currency', '"INR"', 'Default currency', 'financial', false),
  ('tax_percentage', '18.00', 'Default tax percentage', 'financial', false),
  ('advance_percentage', '50.00', 'Default advance percentage', 'financial', false),
  ('order_approval_required', 'false', 'Whether orders need approval', 'orders', false),
  ('max_file_size_mb', '10', 'Maximum file upload size in MB', 'system', false),
  ('allowed_file_types', '["pdf","doc","docx","zip","jpg","jpeg","png","txt","md"]', 'Allowed file types for upload', 'system', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS (Add them explicitly for clarity)
-- ============================================================================

-- These are already created above, but listing them for documentation:
-- orders.user_id -> auth.users.id
-- orders.assigned_to -> auth.users.id  
-- tasks.order_id -> orders.id
-- tasks.assigned_to -> auth.users.id
-- tasks.created_by -> auth.users.id
-- invoices.user_id -> auth.users.id
-- invoices.order_id -> orders.id
-- payments.user_id -> auth.users.id
-- payments.invoice_id -> invoices.id
-- payments.order_id -> orders.id
-- attachments.related_order_id -> orders.id
-- notifications.user_id -> auth.users.id

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$ 
BEGIN 
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ============================================================================';
  RAISE NOTICE '✅ KSP ELECTRONICS DATABASE SCHEMA CREATED SUCCESSFULLY!';
  RAISE NOTICE '🎉 ============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 CREATED TABLES:';
  RAISE NOTICE '   • user_profiles - User management with roles';
  RAISE NOTICE '   • orders - Main projects/orders table'; 
  RAISE NOTICE '   • tasks - Task management for projects';
  RAISE NOTICE '   • invoices - Invoice management';
  RAISE NOTICE '   • payments - Payment tracking';
  RAISE NOTICE '   • attachments - File attachments';
  RAISE NOTICE '   • notifications - User notifications';
  RAISE NOTICE '   • activity_logs - Audit trail';
  RAISE NOTICE '   • system_settings - System configuration';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 SECURITY FEATURES:';
  RAISE NOTICE '   • Row Level Security (RLS) enabled on all tables';
  RAISE NOTICE '   • Role-based access control (admin, team_member, finance, client)';
  RAISE NOTICE '   • Comprehensive policies for data access';
  RAISE NOTICE '   • Auto user profile creation on signup';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ PERFORMANCE FEATURES:';
  RAISE NOTICE '   • Optimized indexes on all key columns';
  RAISE NOTICE '   • Efficient foreign key relationships';
  RAISE NOTICE '   • Proper data types and constraints';
  RAISE NOTICE '';
  RAISE NOTICE '🛠️  HELPER FUNCTIONS:';
  RAISE NOTICE '   • create_notification() - Create user notifications';
  RAISE NOTICE '   • setup_admin_profile() - Make user admin';
  RAISE NOTICE '   • log_activity() - Log user activities';
  RAISE NOTICE '   • handle_new_user() - Auto profile creation';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 NEXT STEPS:';
  RAISE NOTICE '   1. Sign up your first user';
  RAISE NOTICE '   2. Make them admin: SELECT setup_admin_profile(''your@email.com'');';
  RAISE NOTICE '   3. Start using your KSP Electronics platform!';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 READY FOR: Student Dashboard, Project Submissions, Order Management, Invoicing!';
  RAISE NOTICE '';
END $$;