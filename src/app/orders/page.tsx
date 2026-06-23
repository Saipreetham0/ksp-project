import { Metadata } from "next";
import { OrdersManagement } from "@/components/orders/OrdersManagement";

export const metadata: Metadata = {
  title: "Orders Management - ProjectX",
  description: "Manage all project orders and track progress",
};

export default function OrdersPage() {
  return <OrdersManagement />;
}