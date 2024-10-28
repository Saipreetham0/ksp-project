// src/config/navigation.ts
import {
    LayoutDashboard,
    Users,
    FileText,
    Share2,
    DollarSign,
    Settings,
    ShieldAlert,
    UserCog,
    Building,
    Activity,
  } from 'lucide-react';
  import { NavigationItem } from '@/types/navigation';

  export const userNavigation: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FileText },
    { name: "Referrals", href: "/dashboard/referrals", icon: Share2 },
    { name: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
    { name: "Team", href: "/dashboard/team", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  export const adminNavigation: NavigationItem[] = [
    { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Projects Overview", href: "/admin/projects", icon: Building },
    { name: "System Logs", href: "/admin/logs", icon: Activity },
    { name: "Security", href: "/admin/security", icon: ShieldAlert },
    { name: "Settings", href: "/admin/settings", icon: UserCog },
  ];
