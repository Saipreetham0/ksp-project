import { Metadata } from "next";
import { InvoiceManagement } from "@/components/invoices/InvoiceManagement";

export const metadata: Metadata = {
  title: "Invoice Management - ProjectX",
  description: "Generate, send, and track invoices with Zoho integration",
};

export default function InvoicesPage() {
  return <InvoiceManagement />;
}