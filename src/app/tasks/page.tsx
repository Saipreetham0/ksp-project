import { Metadata } from "next";
import { TaskManagement } from "@/components/tasks/TaskManagement";

export const metadata: Metadata = {
  title: "Task Management - ProjectX",
  description: "Manage tasks and projects with Kanban board interface",
};

export default function TasksPage() {
  return <TaskManagement />;
}