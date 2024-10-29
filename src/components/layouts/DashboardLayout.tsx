// // src/components/layouts/DashboardLayout.tsx

"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Share2,
  Settings,
  IndianRupee,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType?: "admin" | "user"; // Optional user type to determine sidebar content
}

// Define navigation items for different dashboard types
const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Projects", href: "/admin/projects", icon: FileText },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: IndianRupee },
  { name: "Referrals", href: "/admin/referrals", icon: Share2 },
  { name: "Earnings", href: "/admin/earnings", icon: IndianRupee },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const userNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FileText },
  { name: "Referrals", href: "/referrals", icon: Share2 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardLayout({
  children,
  userType = "user",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems =
    userType === "admin" ? adminNavigation : userNavigation;

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        navigationItems={navigationItems}
        title="KSP Projects"
      />
      <div className={cn("lg:pl-72 relative")}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
