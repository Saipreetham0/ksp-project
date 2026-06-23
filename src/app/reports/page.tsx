import { Metadata } from "next";
import { ReportsAnalytics } from "@/components/reports/ReportsAnalytics";

export const metadata: Metadata = {
  title: "Reports & Analytics - ProjectX",
  description: "Comprehensive business analytics and reporting",
};

export default function ReportsPage() {
  return <ReportsAnalytics />;
}