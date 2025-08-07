// Enhanced Database Types for Project & Order Management Platform

// Base types
export type OrderStatus = 'draft' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'partially_paid' | 'refunded';
export type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'not_applicable';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'admin' | 'user' | 'moderator' | 'finance' | 'client' | 'team_lead';
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'task' | 'payment' | 'order' | 'invoice';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type AccessLevel = 'public' | 'private' | 'team' | 'organization';

// Address interface
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactNumber?: string;
}

// Team member assignment
export interface TeamMember {
  user_id: string;
  role: string;
  assigned_at: string;
  permissions?: string[];
}

// File attachment
export interface FileAttachment {
  id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

// Order interface (enhanced from Project)
export interface Order {
  id: number;
  order_number: string;
  user_id: string;
  title: string;
  description?: string;
  type: string; // mini, major, custom
  technology?: string;
  timeline?: number; // in days
  team_size?: number;
  amount: number;
  
  // Status fields
  status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_status?: DeliveryStatus;
  
  // Enhanced fields
  team_members: TeamMember[];
  attachments: FileAttachment[];
  metadata: Record<string, any>;
  
  // Delivery information
  delivery_address?: Address;
  estimated_delivery?: string;
  actual_delivery?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Invoice line item
export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  tax_rate?: number;
  tax_amount?: number;
}

// Invoice interface
export interface Invoice {
  id: number;
  invoice_number: string;
  order_id: number;
  
  // Zoho integration
  zoho_invoice_id?: string;
  zoho_organization_id?: string;
  
  // Financial details
  amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  
  // Status and dates
  status: InvoiceStatus;
  due_date?: string;
  invoice_date: string;
  paid_date?: string;
  
  // Files and communications
  pdf_url?: string;
  pdf_file_path?: string;
  sent_emails: string[];
  
  // Customer info
  customer_email?: string;
  customer_name?: string;
  billing_address?: Address;
  
  // Line items
  line_items: InvoiceLineItem[];
  
  // Metadata
  notes?: string;
  metadata: Record<string, any>;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  order?: Order;
}

// Task interface
export interface Task {
  id: number;
  order_id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Assignment
  assigned_to?: string;
  created_by: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  
  // Metadata
  tags: string[];
  attachments: FileAttachment[];
  dependencies: number[]; // Task IDs this task depends on
  
  // Progress
  progress_percentage: number;
  completion_notes?: string;
  
  created_at: string;
  updated_at: string;
  completed_at?: string;
  
  // Relations
  order?: Order;
  assigned_user?: UserProfile;
  created_user?: UserProfile;
}

// Notification interface
export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  read_at?: string;
  
  // Related entities
  related_order_id?: number;
  related_task_id?: number;
  related_invoice_id?: number;
  
  // Delivery status
  email_sent: boolean;
  sms_sent: boolean;
  push_sent: boolean;
  
  // Actions
  action_url?: string;
  action_label?: string;
  
  metadata: Record<string, any>;
  expires_at?: string;
  created_at: string;
  
  // Relations
  related_order?: Order;
  related_task?: Task;
  related_invoice?: Invoice;
}

// Enhanced User Profile
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  
  // Enhanced role system
  role: UserRole;
  permissions: Record<string, boolean>;
  
  // Contact info
  phone_number?: string;
  phone_verified: boolean;
  
  // Organization
  organization?: string;
  department?: string;
  position?: string;
  
  // Preferences
  timezone: string;
  language: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    task_assigned: boolean;
    payment_received: boolean;
    order_status_changed: boolean;
    invoice_sent: boolean;
  };
  
  // Status
  status: UserStatus;
  last_login_at?: string;
  metadata: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

// Attachment interface
export interface Attachment {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url?: string;
  file_size: number;
  mime_type: string;
  
  // Storage info
  storage_provider: 'supabase' | 's3' | 'cloudinary' | 'local';
  bucket_name?: string;
  
  // Ownership
  uploaded_by: string;
  access_level: AccessLevel;
  
  // Relations
  related_order_id?: number;
  related_task_id?: number;
  related_invoice_id?: number;
  
  // Metadata
  description?: string;
  tags: string[];
  metadata: Record<string, any>;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  uploader?: UserProfile;
}

// Activity Log interface
export interface ActivityLog {
  id: number;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  
  action: string;
  entity_type: string;
  entity_id?: number;
  
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  
  description?: string;
  ip_address?: string;
  user_agent?: string;
  
  created_at: string;
  
  // Relations
  user?: UserProfile;
}

// Form interfaces for creating/updating entities
export interface CreateOrderRequest {
  title: string;
  description?: string;
  type: string;
  technology?: string;
  timeline?: number;
  team_size?: number;
  amount?: number;
  team_members?: TeamMember[];
  delivery_address?: Address;
  estimated_delivery?: string;
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  delivery_status?: DeliveryStatus;
  actual_delivery?: string;
}

export interface CreateInvoiceRequest {
  order_id: number;
  amount: number;
  tax_amount?: number;
  discount_amount?: number;
  due_date?: string;
  customer_email?: string;
  customer_name?: string;
  billing_address?: Address;
  line_items: InvoiceLineItem[];
  notes?: string;
}

export interface CreateTaskRequest {
  order_id: number;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  tags?: string[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
  progress_percentage?: number;
  actual_hours?: number;
  completion_notes?: string;
}

export interface CreateNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type?: NotificationType;
  related_order_id?: number;
  related_task_id?: number;
  related_invoice_id?: number;
  action_url?: string;
  action_label?: string;
  expires_at?: string;
}

// Dashboard analytics interfaces
export interface DashboardStats {
  total_orders: number;
  active_orders: number;
  completed_orders: number;
  total_revenue: number;
  pending_invoices: number;
  overdue_invoices: number;
  active_tasks: number;
  completed_tasks: number;
}

export interface OrderMetrics {
  orders_by_status: Record<OrderStatus, number>;
  orders_by_month: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  top_customers: Array<{
    user_id: string;
    user_name: string;
    order_count: number;
    total_amount: number;
  }>;
}

export interface TaskMetrics {
  tasks_by_status: Record<TaskStatus, number>;
  tasks_by_priority: Record<TaskPriority, number>;
  overdue_tasks: number;
  avg_completion_time: number;
  team_productivity: Array<{
    user_id: string;
    user_name: string;
    completed_tasks: number;
    avg_hours: number;
  }>;
}

// API Response interfaces
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// Search and filter interfaces
export interface OrderFilters {
  status?: OrderStatus[];
  payment_status?: PaymentStatus[];
  user_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigned_to?: string;
  order_id?: number;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus[];
  order_id?: number;
  due_date_from?: string;
  due_date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
}