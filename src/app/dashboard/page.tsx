import { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "Dashboard - ProjectX",
  description: "Project management dashboard",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}