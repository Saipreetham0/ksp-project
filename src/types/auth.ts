// Enhanced auth types with new roles and features
// Firebase imports removed - replaced with Supabase
// import { User } from "firebase/auth";
import type { User } from '@supabase/supabase-js';
import { UserProfile, UserRole, UserStatus } from './database';

// Legacy types for backward compatibility
export type LegacyUserRole = "user" | "admin" | "moderator";

// Enhanced UserData interface extending UserProfile
export interface UserData extends Omit<UserProfile, 'id'> {
  uid: string; // Keep uid for Firebase compatibility
  
  // Legacy fields for backward compatibility
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  lastLogin: string;
  phoneNumber?: string;
  isPhoneVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  userData: UserData | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface AuthError {
  message: string;
  status: number;
}

// Permission system
export interface UserPermissions {
  // Order permissions
  orders_view_all: boolean;
  orders_create: boolean;
  orders_update_all: boolean;
  orders_delete: boolean;
  
  // Invoice permissions
  invoices_view_all: boolean;
  invoices_create: boolean;
  invoices_send: boolean;
  invoices_delete: boolean;
  
  // Task permissions
  tasks_view_all: boolean;
  tasks_assign: boolean;
  tasks_update_all: boolean;
  tasks_delete: boolean;
  
  // User management permissions
  users_view_all: boolean;
  users_create: boolean;
  users_update_roles: boolean;
  users_deactivate: boolean;
  
  // Finance permissions
  payments_view_all: boolean;
  payments_record: boolean;
  reports_financial: boolean;
  
  // Admin permissions
  system_settings: boolean;
  audit_logs: boolean;
  integrations_manage: boolean;
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<UserRole, Partial<UserPermissions>> = {
  admin: {
    orders_view_all: true,
    orders_create: true,
    orders_update_all: true,
    orders_delete: true,
    invoices_view_all: true,
    invoices_create: true,
    invoices_send: true,
    invoices_delete: true,
    tasks_view_all: true,
    tasks_assign: true,
    tasks_update_all: true,
    tasks_delete: true,
    users_view_all: true,
    users_create: true,
    users_update_roles: true,
    users_deactivate: true,
    payments_view_all: true,
    payments_record: true,
    reports_financial: true,
    system_settings: true,
    audit_logs: true,
    integrations_manage: true
  },
  
  finance: {
    orders_view_all: true,
    invoices_view_all: true,
    invoices_create: true,
    invoices_send: true,
    payments_view_all: true,
    payments_record: true,
    reports_financial: true,
    users_view_all: true // Need to see customer info
  },
  
  team_lead: {
    orders_view_all: true,
    orders_create: true,
    orders_update_all: true,
    tasks_view_all: true,
    tasks_assign: true,
    tasks_update_all: true,
    users_view_all: true // Team members
  },
  
  moderator: {
    orders_view_all: true,
    orders_update_all: true,
    tasks_view_all: true,
    tasks_update_all: true,
    users_view_all: true
  },
  
  user: {
    orders_create: true,
    // Users can only view/update their own data
  },
  
  client: {
    // Clients can only view their own orders and invoices
    // No create/update permissions
  }
};

// Role hierarchy for permissions inheritance
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  finance: 80,
  team_lead: 70,
  moderator: 60,
  user: 40,
  client: 20
};

// Helper functions for role and permission checking
export const hasPermission = (
  userPermissions: Partial<UserPermissions>, 
  permission: keyof UserPermissions
): boolean => {
  return userPermissions[permission] === true;
};

export const canAccessRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    finance: 'Finance Manager',
    team_lead: 'Team Lead',
    moderator: 'Moderator',
    user: 'User',
    client: 'Client'
  };
  return roleNames[role];
};

// Re-export enhanced types
export type { UserRole, UserStatus, UserProfile } from './database';