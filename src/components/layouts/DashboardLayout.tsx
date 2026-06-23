"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import {
  LayoutDashboard,
  Users,
  FileText,
  Share2,
  Settings,
  IndianRupee,
  Package,
  CheckSquare,
  FolderKanban,
  UserCircle,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType?: "admin" | "user";
}

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: Package },
  { name: "Invoices", href: "/admin/invoices", icon: FileText },
  { name: "Payments", href: "/admin/payments", icon: IndianRupee },
  { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Users", href: "/admin/users", icon: Users },
];

const userNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Referrals", href: "/referrals", icon: Share2 },
  { name: "Profile", href: "/profile", icon: UserCircle },
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
    <div className="min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        navigationItems={navigationItems}
        title="KSP Electronics"
      />
      <div className="lg:pl-72">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
