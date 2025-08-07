// import { ReactNode } from "react";

// src/types/project.ts
export type ProjectType = "mini" | "major" | "custom";

export type ProjectStatus = "pending" | "approved" | "rejected";


export interface Project {
  amount: number;
  id: number;
  user_id: string;
  title: string;
  description: string;
  type: string;
  technology: string;
  timeline: number;
  team_size: number;
  status: string;
  created_at: string;
  delivery_status?: string;
 
  payment_status: string;
}

export interface FormData {
  title: string;
  description: string;
  type: string;
  technology: string;
  timeline: string;
  team_size: string;
  status: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactNumber: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  project_id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  currency: string;
  failure_reason?: string;
}


// export type ProjectStatus = 'pending' | 'active' | 'completed' | 'cancelled';
// export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
// export type DeliveryStatus = 'pending' | 'delivered' | 'not_set';
// export type StatusType = 'status' | 'payment' | 'delivery';

// export interface Project {
//   id: string;
//   title: string;
//   description: string;
//   type: string;
//   technology: string;
//   timeline: number;
//   team_size: number;
//   status: String;
//   created_at: string;
//   user_id: string;
//   delivery_status?: String | null;
//   amount: number;
//   payment_status: string;
// }