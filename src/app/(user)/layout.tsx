// src/app/(user)/layout.tsx
import "@/app/globals.css";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
