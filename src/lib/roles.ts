// src/lib/roles.ts
import { UserRole } from '@/types/auth';

export const ROLES: Record<UserRole, string> = {
  admin: 'Administrator',
  finance: 'Finance Manager',
  team_lead: 'Team Lead',
  moderator: 'Moderator',
  user: 'User',
  client: 'Client',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['read:own_profile', 'update:own_profile', 'read:users', 'update:users', 'delete:users', 'manage:roles'],
  moderator: ['read:own_profile', 'update:own_profile', 'read:users', 'moderate:content'],
  user: ['read:own_profile', 'update:own_profile'],
  // ponytail: empty until something reads these. Upgrade: fill per role when enforced.
  finance: [],
  team_lead: [],
  client: [],
};



export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}