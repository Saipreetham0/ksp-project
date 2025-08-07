"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  // LayoutDashboard,
  // Users,
  // FileText,
  // Share2,
  // DollarSign,
  // Settings,
  X,
  LucideIcon,
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  navigationItems: SidebarItem[]; // Allowing custom navigation for admin/user
  title?: string; // Optional title to display
}

export function Sidebar({
  open,
  setOpen,
  navigationItems,
  title = "Dashboard",
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/projects") {
      // Match both /projects and /projects/[id] routes
      return pathname === href || pathname.startsWith(`${href}/`);
    }
    return pathname === href;
  };

  return (
    <>
      <div
        className={`${
          open ? "block" : "hidden"
        } fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 z-50 w-72 flex flex-col bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-white">{title}</span>
          </Link>
          <button
            type="button"
            className="lg:hidden text-gray-400 hover:text-gray-200"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex-col overflow-y-auto">
          <nav className="space-y-1 px-3 py-4">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon
                    className={`h-5 w-5 mr-3 ${
                      active ? "text-white" : "text-gray-400"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
