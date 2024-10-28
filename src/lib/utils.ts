import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/lib/utils.ts
import { PAYMENT_CONFIG } from "./constants";



export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: PAYMENT_CONFIG.currency,
  }).format(amount);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}


import crypto from "crypto";

// Add validation functions for payment data
export function validatePaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  // const crypto = require("crypto");
  const text = `${orderId}|${paymentId}`;
  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(text)
    .digest("hex");
  return generated_signature === signature;
}
