// src/app/(adminpanel)/admin/projects/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Project, DeliveryAddress } from "@/types/project";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ProjectMetrics } from "@/components/projects/ProjectMetrics";
import { DeliverySection } from "@/components/projects/DeliverySection";
import { ErrorBoundary } from "@/components/projects/ErrorBoundary";

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

  useEffect(() => {
    if (!projectId) {
      setError("Project ID is required");
      setLoading(false);
      return;
    }
    fetchProjectDetails();

  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
        // .limit(1); // Add limit to ensure we only get one result

      if (projectError) throw projectError;
      if (!projectData) throw new Error("Project not found");

      setProject(projectData);
      // setProject(projectData[0]); // Use first result since we limited to 1

      const { data: deliveryData, error: deliveryError } = await supabase
        .from("delivery_addresses")
        .select("*")
        .eq("project_id", projectId)
        .single();


      if (deliveryError && deliveryError.code !== "PGRST116") {
        throw deliveryError;
      }

      if (deliveryData) {
        setDeliveryAddress(deliveryData);
        // setDeliveryAddress(deliveryData[0]);
        setShowDeliveryForm(false);
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
      const { error: deliveryError } = await supabase
        .from("delivery_addresses")
        .upsert([
          {
            project_id: projectId,
            ...deliveryAddress,
            updated_at: new Date().toISOString(),
          },
        ]);

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

            {project.status === "completed" && (
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

          {/* <CardFooter className="border-t bg-gray-50"> */}

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
