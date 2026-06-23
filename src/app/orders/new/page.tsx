import { Metadata } from "next";
import { CreateOrderForm } from "@/components/orders/CreateOrderForm";

export const metadata: Metadata = {
  title: "Create New Order - ProjectX",
  description: "Create a new project order",
};

export default function NewOrderPage() {
  return <CreateOrderForm />;
}