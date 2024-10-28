// import { ReactNode } from "react";

// src/types/project.ts
export type ProjectType = "mini" | "major" | "custom";

export type ProjectStatus = "pending" | "approved" | "rejected";

// export interface Project {
//   id: string;
//   title: string;
//   description: string;
//   type: string;
//   technology: string;
//   timeline: number;
//   team_size: number;
//   status: "pending" | "completed" | "rejected";
//   created_at: string;
// }

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

// export interface Project {
//     id: string;
//     title: string;
//     description: string;
//     status: "pending" | "in_progress" | "completed";
//     technology: string;
//     team_size: number;
//     timeline: number;
//     type: string;
//     created_at: string;
//     delivery_status?: "pending" | "delivered";
//   }

  export interface DeliveryAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactNumber: string;
  }

// export interface ProjectFormData {
//   title: string;
//   description: string;
//   type: ProjectType;
//   technology: string;
//   timeline: string;
//   teamSize: number;
// }

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
