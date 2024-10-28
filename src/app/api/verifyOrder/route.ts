// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";

// const generatedSignature = (
//   razorpayOrderId: string,
//   razorpayPaymentId: string
// ) => {
//   const keySecret = process.env.RAZORPAY_SECRET_ID as string;

//   const sig = crypto
//     .createHmac("sha256", keySecret)
//     .update(razorpayOrderId + "|" + razorpayPaymentId)
//     .digest("hex");
//   return sig;
// };

// export async function POST(request: NextRequest) {
//   const { orderId, razorpayPaymentId, razorpaySignature } =
//     await request.json();

//   const signature = generatedSignature(orderId, razorpayPaymentId);
//   if (signature !== razorpaySignature) {
//     return NextResponse.json(
//       { message: "payment verification failed", isOk: false },
//       { status: 400 }
//     );
//   }

//   // Probably some database calls here to update order or add premium status to user
//   return NextResponse.json(
//     { message: "payment verified successfully", isOk: true },
//     { status: 200 }
//   );
// }

import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import crypto from "crypto";

// Type definitions for better type safety
interface PaymentVerificationRequest {
  orderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: string;
  projectId: string;
  amount: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PaymentRecord {
  user_id: string;
  project_id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  status: "success" | "failed";
  created_at: string;
  payment_method: string;
  currency: string;
}

const generateSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string
): string => {
  const keySecret = process.env.RAZORPAY_SECRET_ID as string;
  return crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
};

export async function POST(request: NextRequest) {
  try {
    // Extract payment details from request
    const {
      orderId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
      projectId,
      amount,
    }: PaymentVerificationRequest = await request.json();

    // Validate required fields
    if (!orderId || !razorpayPaymentId || !razorpaySignature || !userId) {
      return NextResponse.json(
        { message: "Missing required fields", isOk: false },
        { status: 400 }
      );
    }

    // Verify payment signature
    const expectedSignature = generateSignature(orderId, razorpayPaymentId);
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpaySignature)
    );

    if (!isValidSignature) {
      // Save failed payment attempt to Supabase
      await supabase.from("payment_transactions").insert({
        user_id: userId,
        project_id: projectId,
        order_id: orderId,
        payment_id: razorpayPaymentId,
        amount: amount,
        status: "failed",
        created_at: new Date().toISOString(),
        payment_method: "razorpay",
        currency: "INR",
        failure_reason: "Invalid signature",
      });

      return NextResponse.json(
        { message: "Payment verification failed", isOk: false },
        { status: 400 }
      );
    }

    // Begin database transaction
    const { data: payment, error: paymentError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: userId,
        project_id: projectId,
        order_id: orderId,
        payment_id: razorpayPaymentId,
        amount: amount,
        status: "success",
        created_at: new Date().toISOString(),
        payment_method: "razorpay",
        currency: "INR",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error saving payment:", paymentError);
      throw new Error("Failed to save payment details");
    }

      // Verify project exists before updating
      const { data: projectExists, error: projectCheckError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();

    if (projectCheckError || !projectExists) {
      throw new Error("Project not found");
    }


    const { error: projectError } = await supabase
    .from("projects")
    .update({
      status: "Processing",
      payment_status: "Paid"
    })
    .eq("id", projectId)
    .select();
    // console.log(projectId, )

  if (projectError) {
    console.error("Error updating project:", projectError);
    throw new Error("Failed to update project status");
  }

    return NextResponse.json(
      {
        message: "Payment verified and recorded successfully",
        isOk: true,
        paymentId: payment.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
        isOk: false,
      },
      { status: 500 }
    );
  }
}
