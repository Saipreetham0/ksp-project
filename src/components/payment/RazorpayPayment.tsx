import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';

interface RazorpayPaymentProps {
  amount: number;
  projectId: string;
  onPaymentSuccess?: () => void;
}


interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }



const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  projectId,
  onPaymentSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const { user, loading: userLoading } = useAuth();

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to make a payment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await initializeRazorpay();
      if (!res) {
        toast({
          title: "Error",
          description: "Razorpay SDK failed to load",
          variant: "destructive",
        });
        return;
      }

      // Create order
      const response = await fetch("/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100,
          projectId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Project Payment",
        description: `Payment for Project ${projectId}`,
        order_id: order.id,
        handler: async function (response: RazorpayResponse) {
          try {
            const verifyResponse = await fetch("/api/verifyOrder", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                userId: user.uid,
                amount:amount,
                projectId: projectId
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const verifyResult = await verifyResponse.json();

            if (verifyResult.isOk) {
              toast({
                title: "Success",
                description: "Payment completed successfully",
              });
              onPaymentSuccess?.();
            } else {
              throw new Error(verifyResult.message || "Payment verification failed");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            toast({
              title: "Error",
              description: err instanceof Error ? err.message : "Payment verification failed",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user.displayName || undefined,
          email: user.email || undefined,
        },
        theme: {
          color: "#0066FF",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <Button disabled className="w-full md:w-auto">
        Loading...
      </Button>
    );
  }

  return (

    <Button
      onClick={handlePayment}
      disabled={loading || !amount || !user}
      className="w-full md:w-auto"
    >
      {loading ? "Processing..." : user ? `Pay ₹${amount}` : "Login to Pay"}
    </Button>

  );
};

export default RazorpayPayment;