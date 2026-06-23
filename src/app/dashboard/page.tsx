import { Metadata } from "next";
import { StudentDashboard } from "@/components/student/StudentDashboard";

export const metadata: Metadata = {
  title: "Student Dashboard - ProjectX",
  description: "Simple student dashboard for project management",
};

export default function DashboardPage() {
  return <StudentDashboard />;
}