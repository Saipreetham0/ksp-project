import { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "Dashboard - StudentHub",
  description: "Student project management dashboard",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
