// Enhanced role-based permissions system
import { 
  UserRole, 
  UserPermissions, 
  DEFAULT_PERMISSIONS, 
  ROLE_HIERARCHY, 
  hasPermission as checkPermission,
  canAccessRole as checkRoleAccess,
  getRoleDisplayName 
} from '@/types/auth';

// Re-export types and functions
export type { UserRole, UserPermissions } from '@/types/auth';
export { DEFAULT_PERMISSIONS, ROLE_HIERARCHY, getRoleDisplayName } from '@/types/auth';

// Legacy interface for backward compatibility
export interface LegacyUserPermissions {
  canViewUsers: boolean;
  canManageUsers: boolean;
  canViewProjects: boolean;
  canManageProjects: boolean;
  canViewPayments: boolean;
  canManagePayments: boolean;
  canAccessAdmin: boolean;
}

export const getRolePermissions = (role: UserRole): LegacyUserPermissions => {
  const modernPermissions = DEFAULT_PERMISSIONS[role] || {};
  
  return {
    canViewUsers: modernPermissions.users_view_all || false,
    canManageUsers: modernPermissions.users_create || modernPermissions.users_update_roles || false,
    canViewProjects: modernPermissions.orders_view_all || false,
    canManageProjects: modernPermissions.orders_create || modernPermissions.orders_update_all || false,
    canViewPayments: modernPermissions.payments_view_all || false,
    canManagePayments: modernPermissions.payments_record || false,
    canAccessAdmin: ['admin', 'finance', 'team_lead', 'moderator'].includes(role),
  };
};

export const hasLegacyPermission = (userRole: UserRole, permission: keyof LegacyUserPermissions): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions[permission];
};

// Enhanced permission functions
export const hasModernPermission = (
  userPermissions: Partial<UserPermissions>, 
  permission: keyof UserPermissions
): boolean => {
  return checkPermission(userPermissions, permission);
};

export const canAccessRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  return checkRoleAccess(userRole, targetRole);
};

export const getRoleDescription = (role: UserRole): string => {
  const descriptions: Record<UserRole, string> = {
    admin: 'Full system access with all permissions',
    finance: 'Manage invoices, payments, and financial reports',
    team_lead: 'Manage team tasks and projects',
    moderator: 'Moderate content and assist with order management',
    user: 'Standard user with basic order creation permissions',
    client: 'View-only access to own orders and invoices'
  };
  return descriptions[role];
};

export const getAvailableRoles = (currentUserRole: UserRole): UserRole[] => {
  return Object.keys(ROLE_HIERARCHY)
    .filter(role => canAccessRole(currentUserRole, role as UserRole))
    .sort((a, b) => ROLE_HIERARCHY[b as UserRole] - ROLE_HIERARCHY[a as UserRole]) as UserRole[];
};

// Role-based route protection
export const getProtectedRoutes = (role: UserRole): string[] => {
  const baseRoutes = ['/dashboard', '/profile', '/settings'];
  
  switch (role) {
    case 'admin':
      return [...baseRoutes, '/admin', '/admin/*', '/orders', '/invoices', '/tasks', '/users', '/reports'];
    
    case 'finance':
      return [...baseRoutes, '/orders', '/invoices', '/payments', '/reports/financial'];
    
    case 'team_lead':
      return [...baseRoutes, '/orders', '/tasks', '/team', '/reports/tasks'];
    
    case 'moderator':
      return [...baseRoutes, '/orders', '/tasks'];
    
    case 'user':
      return [...baseRoutes, '/orders/my', '/tasks/my'];
    
    case 'client':
      return [...baseRoutes, '/orders/my', '/invoices/my'];
    
    default:
      return baseRoutes;
  }
};

// Navigation items based on role
interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export const getRoleNavigation = (role: UserRole): NavItem[] => {
  const nav: NavItem[] = [];
  
  // Base navigation for all authenticated users
  nav.push(
    { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Profile', href: '/profile', icon: 'User' }
  );
  
  // Role-specific navigation
  switch (role) {
    case 'admin':
      nav.push(
        { name: 'Orders', href: '/admin/orders', icon: 'ShoppingCart' },
        { name: 'Tasks', href: '/admin/tasks', icon: 'CheckSquare' },
        { name: 'Invoices', href: '/admin/invoices', icon: 'FileText' },
        { name: 'Users', href: '/admin/users', icon: 'Users' },
        { name: 'Reports', href: '/admin/reports', icon: 'BarChart3' },
        { name: 'Settings', href: '/admin/settings', icon: 'Settings' }
      );
      break;
      
    case 'finance':
      nav.push(
        { name: 'Orders', href: '/orders', icon: 'ShoppingCart' },
        { name: 'Invoices', href: '/invoices', icon: 'FileText' },
        { name: 'Payments', href: '/payments', icon: 'CreditCard' },
        { name: 'Reports', href: '/reports/financial', icon: 'BarChart3' }
      );
      break;
      
    case 'team_lead':
      nav.push(
        { name: 'Projects', href: '/projects', icon: 'FolderOpen' },
        { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
        { name: 'Team', href: '/team', icon: 'Users' }
      );
      break;
      
    case 'moderator':
      nav.push(
        { name: 'Orders', href: '/orders', icon: 'ShoppingCart' },
        { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' }
      );
      break;
      
    case 'user':
      nav.push(
        { name: 'My Orders', href: '/orders/my', icon: 'ShoppingCart' },
        { name: 'My Tasks', href: '/tasks/my', icon: 'CheckSquare' }
      );
      break;
      
    case 'client':
      nav.push(
        { name: 'My Orders', href: '/orders/my', icon: 'ShoppingCart' },
        { name: 'Invoices', href: '/invoices/my', icon: 'FileText' }
      );
      break;
  }
  
  return nav;
};

// Permission validation utilities
export const validateUserPermission = (
  userRole: UserRole,
  requiredPermission: keyof UserPermissions
): boolean => {
  const userPermissions = DEFAULT_PERMISSIONS[userRole] || {};
  return hasModernPermission(userPermissions, requiredPermission);
};

export const validateRouteAccess = (
  userRole: UserRole,
  route: string
): boolean => {
  const allowedRoutes = getProtectedRoutes(userRole);
  return allowedRoutes.some(allowedRoute => {
    if (allowedRoute.endsWith('/*')) {
      return route.startsWith(allowedRoute.slice(0, -2));
    }
    return route === allowedRoute || route.startsWith(allowedRoute + '/');
  });
};

// Role transition utilities
export const canPromoteToRole = (
  currentRole: UserRole,
  targetRole: UserRole,
  promoterRole: UserRole
): boolean => {
  // Can't promote to same or lower role
  if (ROLE_HIERARCHY[targetRole] <= ROLE_HIERARCHY[currentRole]) {
    return false;
  }
  
  // Promoter must have higher role than target
  return ROLE_HIERARCHY[promoterRole] > ROLE_HIERARCHY[targetRole];
};

export const canDemoteFromRole = (
  currentRole: UserRole,
  targetRole: UserRole,
  demoterRole: UserRole
): boolean => {
  // Can't demote to same or higher role
  if (ROLE_HIERARCHY[targetRole] >= ROLE_HIERARCHY[currentRole]) {
    return false;
  }
  
  // Demoter must have higher role than current
  return ROLE_HIERARCHY[demoterRole] > ROLE_HIERARCHY[currentRole];
};