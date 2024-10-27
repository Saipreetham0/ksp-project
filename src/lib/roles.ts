// src/lib/roles.ts
import { UserRole } from '@/types/auth';

export const ROLES: Record<UserRole, string> = {
  user: 'User',
  admin: 'Administrator',
  moderator: 'Moderator'
};

export const ROLE_PERMISSIONS = {
  user: ['read:own_profile', 'update:own_profile'],
  moderator: ['read:own_profile', 'update:own_profile', 'read:users', 'moderate:content'],
  admin: ['read:own_profile', 'update:own_profile', 'read:users', 'update:users', 'delete:users', 'manage:roles']
};



export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}