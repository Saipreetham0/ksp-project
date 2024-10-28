import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_ID!,
});

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { amount, projectId, userId } = await request.json();

    // Validate required fields
    if (!amount || !projectId || !userId) {
      return NextResponse.json(
        { message: "Amount, projectId, and userId are required" },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { message: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Generate a shorter receipt ID (max 40 chars)
    const shortReceiptId = `rcpt_${projectId.slice(0, 8)}_${Date.now()
      .toString()
      .slice(-8)}`;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount), // Ensure amount is an integer
      currency: "INR",
      receipt: shortReceiptId,
      partial_payment: false,
      notes: {
        projectId,
        userId,
      },
    });

    return NextResponse.json(order, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Create order error:", error);

    // Handle specific Razorpay errors
    if (error.statusCode === 400) {
      return NextResponse.json(
        {
          message: "Invalid request parameters",
          error: error.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
