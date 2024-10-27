// src/components/RoleBasedComponent.tsx
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface RoleBasedComponentProps {
  requiredPermission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleBasedComponent({
  requiredPermission,
  children,
  fallback = null,
}: RoleBasedComponentProps) {
  const { hasPermission, loading } = useAuth();

  if (loading) return null;

  return hasPermission(requiredPermission) ? <>{children}</> : <>{fallback}</>;
}
