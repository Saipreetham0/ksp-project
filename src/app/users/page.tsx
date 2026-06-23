import { Metadata } from "next";
import { UserManagement } from "@/components/users/UserManagement";

export const metadata: Metadata = {
  title: "User Management - ProjectX",
  description: "Manage users, roles, and permissions",
};

export default function UsersPage() {
  return <UserManagement />;
}