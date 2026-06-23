import { Metadata } from "next";
import { PaymentManagement } from "@/components/payments/PaymentManagement";

export const metadata: Metadata = {
  title: "Payment Management - ProjectX",
  description: "Track payments and manage financial transactions",
};

export default function PaymentsPage() {
  return <PaymentManagement />;
}