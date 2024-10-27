// src/types/index.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  technology: string;
  team_size: number;
  timeline: number;
  status: string;
  type: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentDetails {
  id: string;
  project_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed";
  payment_method: "razorpay" | "upi" | null;
  upi_reference_number?: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}
