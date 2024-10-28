// src/app/projects/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Project, DeliveryAddress, PaymentTransaction } from "@/types/project";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ProjectMetrics } from "@/components/projects/ProjectMetrics";
import { DeliverySection } from "@/components/projects/DeliverySection";
import { ErrorBoundary } from "@/components/projects/ErrorBoundary";
import RazorpayPayment from "@/components/payment/RazorpayPayment";
// import { CheckCircleIcon, CircleAlert } from "lucide-react";

function LoadingState() {
  return (
    <div className="p-6 flex justify-center items-center min-h-[400px]">
      <p className="text-gray-600">Loading project details...</p>
    </div>
  );
}

function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="p-6 flex justify-center items-center min-h-[400px]">
      <div className="text-red-500 text-center">
        <p className="font-semibold mb-2">Error</p>
        <p>{error}</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [paymentTransaction, setPaymentTransaction] =
    useState<PaymentTransaction | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    contactNumber: "",
  });
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">(
    "pending"
  );

  useEffect(() => {
    if (!projectId) {
      setError("Project ID is required");
      setLoading(false);
      return;
    }
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;
      if (!projectData) throw new Error("Project not found");

      setProject(projectData);
      setPaymentStatus(projectData.payment_status);

      if (projectData.payment_status === "paid") {
        const { data: paymentData, error: paymentError } = await supabase
          .from("payment_transactions")
          .select("*")
          .eq("project_id", projectId)
          .single();

        if (paymentError) throw paymentError;
        if (paymentData) {
          setPaymentTransaction(paymentData);
        }
      }

      //     const { data: deliveryData, error: deliveryError } = await supabase
      //       .from("delivery_addresses")
      //       .select("*")
      //       .eq("project_id", projectId)
      //       .single();

      //     if (deliveryError && deliveryError.code !== "PGRST116") {
      //       throw deliveryError;
      //     }

      //     if (deliveryData) {
      //       setDeliveryAddress(deliveryData);
      //       setShowDeliveryForm(false);
      //     }
      //   } catch (err) {
      //     console.error("Error fetching project:", err);
      //     setError(
      //       err instanceof Error ? err.message : "Failed to load project details"
      //     );
      //   } finally {
      //     setLoading(false);
      //   }
      // };

      // Fetch delivery address with proper error handling
      try {
        const { data: deliveryData, error: deliveryError } = await supabase
          .from("delivery_addresses")
          .select("street, city, state, postal_code, country, contact_number")
          .eq("project_id", projectId)
          .maybeSingle();

        if (deliveryError) {
          console.warn("Error fetching delivery address:", deliveryError);
        } else if (deliveryData) {
          setDeliveryAddress({
            street: deliveryData.street || "",
            city: deliveryData.city || "",
            state: deliveryData.state || "",
            postalCode: deliveryData.postal_code || "",
            country: deliveryData.country || "",
            contactNumber: deliveryData.contact_number || "",
          });
          setShowDeliveryForm(false);
        }
      } catch (deliveryErr) {
        console.warn("Failed to fetch delivery address:", deliveryErr);
        // Don't throw here - we want to continue even if delivery address fetch fails
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load project details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !project) return;

    setAddressSubmitting(true);
    try {
      // Map the delivery address to match the database column names
      const mappedAddress = {
        project_id: projectId,
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        postal_code: deliveryAddress.postalCode,
        country: deliveryAddress.country,
        contact_number: deliveryAddress.contactNumber,
        updated_at: new Date().toISOString(),
      };

      const { error: deliveryError } = await supabase
        .from("delivery_addresses")
        .upsert([mappedAddress]);

      if (deliveryError) throw deliveryError;

      const { error: projectError } = await supabase
        .from("projects")
        .update({ delivery_status: "pending" })
        .eq("id", projectId);

      if (projectError) throw projectError;

      await fetchProjectDetails();
      setShowDeliveryForm(false);
    } catch (err) {
      console.error("Error submitting delivery address:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save delivery address"
      );
    } finally {
      setAddressSubmitting(false);
    }
  };

  // const handleDeliverySubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!projectId || !project) return;

  //   setAddressSubmitting(true);
  //   try {
  //     const { error: deliveryError } = await supabase
  //       .from("delivery_addresses")
  //       .upsert([
  //         {
  //           project_id: projectId,
  //           ...deliveryAddress,
  //           updated_at: new Date().toISOString(),
  //         },
  //       ]);

  //     if (deliveryError) throw deliveryError;

  //     const { error: projectError } = await supabase
  //       .from("projects")
  //       .update({ delivery_status: "pending" })
  //       .eq("id", projectId);

  //     if (projectError) throw projectError;

  //     await fetchProjectDetails();
  //     setShowDeliveryForm(false);
  //   } catch (err) {
  //     console.error("Error submitting delivery address:", err);
  //     setError(
  //       err instanceof Error ? err.message : "Failed to save delivery address"
  //     );
  //   } finally {
  //     setAddressSubmitting(false);
  //   }
  // };

  const handlePaymentSuccess = async () => {
    try {
      const { error: projectError } = await supabase
        .from("projects")
        .update({ payment_status: "paid" })
        .eq("id", projectId);

      if (projectError) throw projectError;
      setPaymentStatus("paid");

      const { data: paymentData, error: paymentError } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (paymentError) throw paymentError;

      if (paymentData) {
        setPaymentTransaction(paymentData);
      }
    } catch (err) {
      console.error("Error updating payment status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update payment status"
      );
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onBack={() => router.back()} />;
  if (!project)
    return (
      <ErrorState error="Project not found" onBack={() => router.back()} />
    );

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Card>
          <ProjectHeader title={project.title} status={project.status} />

          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">{project.description}</p>
            </div>

            <ProjectMetrics
              technology={project.technology}
              teamSize={project.team_size}
              timeline={project.timeline}
              createdAt={project.created_at}
            />
           
            {project.amount > 0 && (
              <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-semibold">Payment</h3>
                {paymentTransaction ? (
                  <div>
                    <p>
                      Payment has been made. Order details:{" "}
                      {paymentTransaction.order_id}
                    </p>

                    <p>Amount: {paymentTransaction.amount}</p>
                    <p>Status: {paymentTransaction.status}</p>
                  </div>
                ) : (
                  <RazorpayPayment
                    amount={project.amount}
                    projectId={projectId}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                )}
              </div>
            )}

            {project.status === "Processing" &&
              project.delivery_status === "yes" && (
                <DeliverySection
                  showForm={showDeliveryForm}
                  deliveryAddress={deliveryAddress}
                  onAddressChange={handleAddressChange}
                  onSubmit={handleDeliverySubmit}
                  onToggleForm={() => setShowDeliveryForm(!showDeliveryForm)}
                  isSubmitting={addressSubmitting}
                />
              )}
          </CardContent>

          <CardFooter className="border-t bg-gray-50">
            <div className="flex justify-between w-full items-center">
              <Badge variant="outline" className="capitalize">
                {project.type} Project
              </Badge>
              <Button variant="ghost" onClick={() => router.back()}>
                Back to Dashboard
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
